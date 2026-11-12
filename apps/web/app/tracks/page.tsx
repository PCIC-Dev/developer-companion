"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader, Card, CardContent, Button } from "@pcic/ui";

const tracks = [
  {
    id: 1,
    title: "Code Crafters",
    category: "Code Crafters",
    description:
      "Build programming knowledge, strengthen problem-solving skills, and develop practical software applications through structured learning.",
    skills: ["Programming", "Problem Solving", "Software Development"],
  },
  {
    id: 2,
    title: "Data Science",
    category: "Data Science",
    description:
      "Learn to work with data, discover meaningful patterns, and use analytical approaches to solve real-world problems.",
    skills: ["Data Analysis", "Statistics", "Data Visualization"],
  },
  {
    id: 3,
    title: "Cyber Security",
    category: "Cyber Security",
    description:
      "Explore cybersecurity principles, understand digital threats, and develop practical skills for protecting digital systems.",
    skills: ["Security Fundamentals", "Networking", "Threat Awareness"],
  },
];

const categories = ["All", "Code Crafters", "Data Science", "Cyber Security"];

const STORAGE_KEY = "pcic-selected-domain";

export default function TracksPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedDomain = window.localStorage.getItem(STORAGE_KEY);

    if (savedDomain && tracks.some((track) => track.title === savedDomain)) {
      setSelectedDomain(savedDomain);
    }

    setLoaded(true);
  }, []);

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesCategory = category === "All" || track.category === category;

      const matchesSearch =
        track.title.toLowerCase().includes(search.toLowerCase()) ||
        track.description.toLowerCase().includes(search.toLowerCase()) ||
        track.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  function chooseDomain(domain: string) {
    const message = selectedDomain
      ? `Change your learning domain from ${selectedDomain} to ${domain}?`
      : `Choose ${domain} as your learning domain?`;

    if (!window.confirm(message)) return;

    window.localStorage.setItem(STORAGE_KEY, domain);
    setSelectedDomain(domain);
  }

  return (
    <AppShell role="member">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 md:px-8">
        <PageHeader
          eyebrow="YOUR LEARNING JOURNEY"
          title="Explore learning domains"
          description="Choose one learning domain to begin your journey. Your tasks, progress, and learning activities will follow your selected domain."
        />

        {loaded && selectedDomain && (
          <Card>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your selected domain
                </p>
                <h2 className="mt-1 text-lg font-semibold">{selectedDomain}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your learning activities will be organized around this domain.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-medium">
                Active selection
              </span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">FIND YOUR DIRECTION</p>
              <h2 className="mt-2 text-xl font-semibold">Where would you like to grow?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore the three PCIC learning domains and select one.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search learning domains..."
              aria-label="Search learning domains"
              className="h-12 w-full max-w-md rounded-lg border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Available learning domains</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You can actively follow one domain at a time.
              </p>
            </div>

            <span className="text-sm text-muted-foreground">{filteredTracks.length} domains</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTracks.map((track) => {
              const isSelected = selectedDomain === track.title;

              return (
                <Card
                  key={track.id}
                  className={`flex h-full flex-col transition-shadow hover:shadow-md ${
                    isSelected ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        {track.category}
                      </span>

                      {isSelected && (
                        <span className="text-xs font-semibold text-primary">Selected</span>
                      )}
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">{track.title}</h3>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {track.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <Button
                        className="w-full"
                        variant={isSelected ? "outline" : "default"}
                        disabled={!loaded}
                        onClick={() => chooseDomain(track.title)}
                      >
                        {isSelected
                          ? "Currently selected"
                          : selectedDomain
                            ? "Change to this domain"
                            : "Choose this domain"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTracks.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <h3 className="font-semibold">No domains found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search term or category.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-4 text-sm font-medium text-primary"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
