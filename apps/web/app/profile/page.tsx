"use client";

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { AppShell } from "@pcic/ui";

const PROFILE_KEY = "pcic-profile";
const DOMAIN_KEY = "pcic-selected-domain";
const THEME_KEY = "pcic-theme";

interface Profile {
  name: string;
  email: string;
  university: string;
  program: string;
  year: string;
  location: string;
  bio: string;
  photo: string;
}

const emptyProfile: Profile = {
  name: "",
  email: "",
  university: "",
  program: "",
  year: "",
  location: "",
  bio: "",
  photo: "",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [domain, setDomain] = useState("");
  const [theme, setTheme] = useState("light");
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      const savedDomain = localStorage.getItem(DOMAIN_KEY);
      const savedTheme = localStorage.getItem(THEME_KEY) || "light";

      if (savedProfile) {
        setProfile({ ...emptyProfile, ...JSON.parse(savedProfile) });
      }

      setDomain(savedDomain || "");
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } catch {
      setMessage("Some saved settings could not be loaded.");
    }

    setLoaded(true);
  }, []);

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event("pcic-profile-updated"));
      setMessage("Your profile has been saved successfully.");
    } catch {
      setMessage("Could not save your profile. Try a smaller photo.");
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Please choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("photo", String(reader.result));
      setMessage("Photo preview updated. Save your profile to keep it.");
    };

    reader.onerror = () => setMessage("Could not read that image.");

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function changeTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    try {
      localStorage.setItem(THEME_KEY, nextTheme);
      window.dispatchEvent(new Event("pcic-theme-updated"));
    } catch {
      setMessage("Could not save your appearance preference.");
    }
  }

  if (!loaded) {
    return (
      <AppShell name="Student" role="member" pathname="/profile">
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </AppShell>
    );
  }

  const initials = profile.name.trim() ? profile.name.trim().charAt(0).toUpperCase() : "S";

  return (
    <AppShell name={profile.name || "Student"} role="member" pathname="/profile">
      <div className="mx-auto grid max-w-[1000px] gap-7">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Account</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">My profile</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage your personal information, learning identity, and account appearance.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-secondary font-heading text-2xl font-bold">
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-semibold">{profile.name || "Your name"}</h2>
              <p className="text-sm text-muted-foreground">
                {profile.email || "Add your email address"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Student account</p>
            </div>

            <div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
              >
                Upload photo
              </button>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="grid gap-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold">Personal information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your student information up to date.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Full name
                <input
                  className={inputClass}
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label className="text-sm font-semibold">
                Email address
                <input
                  className={inputClass}
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className="text-sm font-semibold">
                University
                <input
                  className={inputClass}
                  value={profile.university}
                  onChange={(e) => updateField("university", e.target.value)}
                  placeholder="Your university"
                />
              </label>

              <label className="text-sm font-semibold">
                Program / department
                <input
                  className={inputClass}
                  value={profile.program}
                  onChange={(e) => updateField("program", e.target.value)}
                  placeholder="Your program"
                />
              </label>

              <label className="text-sm font-semibold">
                Academic year
                <select
                  className={inputClass}
                  value={profile.year}
                  onChange={(e) => updateField("year", e.target.value)}
                >
                  <option value="">Select academic year</option>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                  <option value="5th year">5th year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Location
                <input
                  className={inputClass}
                  value={profile.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, country"
                />
              </label>

              <label className="text-sm font-semibold sm:col-span-2">
                Short biography
                <textarea
                  className={inputClass + " min-h-28 resize-y"}
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell your mentors a little about yourself..."
                  maxLength={500}
                />
                <span className="mt-1 block text-right text-xs font-normal text-muted-foreground">
                  {profile.bio.length}/500
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <h2 className="font-heading text-xl font-semibold">Learning identity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your learning domain is shared with Tracks, Work, and Ranks.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Current learning domain
                </p>
                <p className="mt-1 font-semibold">{domain || "No domain selected yet"}</p>
              </div>
              <a href="/tracks" className="text-sm font-bold text-primary hover:underline">
                {domain ? "Change in Tracks" : "Explore Tracks"}
              </a>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {message}
            </p>
            <button
              type="submit"
              className="rounded-xl bg-solid px-6 py-3 text-sm font-bold text-solid-foreground transition hover:opacity-90"
            >
              Save profile
            </button>
          </div>
        </form>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div>
            <h2 className="font-heading text-xl font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how PCIC looks across the entire application.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeTheme(mode)}
                aria-pressed={theme === mode}
                className={`rounded-xl border p-4 text-left transition ${
                  theme === mode
                    ? "border-primary bg-secondary"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <span className="block text-sm font-bold">
                  {mode === "light" ? "Light mode" : "Dark mode"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {mode === "light"
                    ? "Bright surfaces and dark text"
                    : "Dark surfaces and comfortable contrast"}
                </span>
                {theme === mode && (
                  <span className="mt-3 block text-xs font-bold text-primary">
                    Currently selected
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
