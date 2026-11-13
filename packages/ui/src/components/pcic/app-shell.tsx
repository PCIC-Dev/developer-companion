"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { SidebarNav, type NavItem } from "./sidebar-nav";
import { cn } from "../../lib/utils";

const SIDEBAR_STORAGE_KEY = "pcic-sidebar-collapsed";

const memberNav: NavItem[] = [
  { href: "/", label: "Home", icon: "journey" },
  { href: "/tracks", label: "Tracks", icon: "tracks" },
  { href: "/work", label: "Work", icon: "work" },
  { href: "/ranks", label: "Ranks", icon: "ranks" },
  { href: "/people", label: "People", icon: "people" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

const mentorNav: NavItem[] = [
  { href: "/", label: "Home", icon: "journey" },
  { href: "/reviews", label: "Reviews", icon: "review" },
  { href: "/mentees", label: "Mentees", icon: "people" },
  { href: "/studio", label: "Studio", icon: "studio" },
  { href: "/tracks", label: "Tracks", icon: "tracks" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

function AppShell({
  children,
  name,
  role = "member",
  pathname = "/",
  domain,
  collapsed,
  onCollapsedChange,
}: {
  children: ReactNode;
  name?: string;
  role?: "member" | "mentor" | "new";
  pathname?: string;
  domain?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const isControlled = collapsed !== undefined;
  const isCollapsed = collapsed ?? internalCollapsed;

  const displayName =
    typeof name === "string" && name.trim()
      ? name.trim()
      : role === "mentor"
        ? "Mentor"
        : "Student";

  useEffect(() => {
    if (isControlled) {
      setStorageReady(true);
      return;
    }

    try {
      const savedState = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setInternalCollapsed(savedState === "true");
    } catch {
      setInternalCollapsed(false);
    }

    setStorageReady(true);
  }, [isControlled]);

  useEffect(() => {
    if (!isControlled && storageReady) {
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
      } catch {
        // Browser storage may be unavailable.
      }
    }
  }, [isControlled, isCollapsed, storageReady]);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;

    if (!isControlled) {
      setInternalCollapsed(nextState);
    }

    onCollapsedChange?.(nextState);
  };

  const items =
    role === "mentor"
      ? mentorNav
      : role === "new"
        ? memberNav.filter((item) => item.label !== "People")
        : memberNav;

  void domain;

  return (
    <div
      className={cn(
        "grid min-h-screen transition-[grid-template-columns] duration-200 [grid-template-columns:252px_minmax(0,1fr)] max-[860px]:block",
        isCollapsed && "[grid-template-columns:76px_minmax(0,1fr)]",
      )}
    >
      <aside
        className={cn(
          "sticky top-0 z-20 flex h-screen flex-col gap-6 overflow-x-hidden overflow-y-auto border-r border-border bg-card py-6 transition-[padding] duration-200",
          isCollapsed ? "px-2" : "px-4",
          "max-[860px]:fixed max-[860px]:inset-auto max-[860px]:bottom-0 max-[860px]:top-auto max-[860px]:h-[72px] max-[860px]:w-full max-[860px]:flex-row max-[860px]:items-center max-[860px]:justify-around max-[860px]:overflow-hidden max-[860px]:border-r-0 max-[860px]:border-t max-[860px]:px-2 max-[860px]:py-2",
        )}
      >
        <div
          className={cn(
            "flex min-h-11 items-center gap-2 max-[860px]:hidden",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <a
              href="/"
              className="flex min-w-0 items-center gap-3 font-heading text-[1.3rem] font-semibold"
            >
              <span className="grid size-11 flex-none place-items-center rounded-[12px] bg-hero text-xl text-white">
                P
              </span>

              <span className="min-w-0">
                <strong className="block">PCIC</strong>
                <small className="mt-1 block whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[.06em] text-muted-foreground">
                  Developer Companion
                </small>
              </span>
            </a>
          )}

          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            aria-controls="pcic-main-navigation"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid size-9 flex-none place-items-center rounded-[10px] border border-border bg-transparent text-lg font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background"
          >
            {isCollapsed ? "›" : "‹"}
          </button>
        </div>

        <div className="min-w-0 max-[860px]:w-full">
          <div id="pcic-main-navigation" className="max-[860px]:hidden">
            <SidebarNav items={items} pathname={pathname} collapsed={isCollapsed} />
          </div>

          <nav aria-label="Main" className="hidden max-[860px]:flex max-[860px]:justify-around">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                aria-label={item.label}
                className="grid min-h-11 min-w-11 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} />
                <span className="sr-only">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div
          className={cn(
            "mt-auto flex min-h-11 items-center rounded-[10px] text-sm font-semibold text-foreground transition-colors hover:bg-secondary max-[860px]:hidden",
            isCollapsed ? "justify-center px-0" : "gap-3 px-3",
          )}
          title={isCollapsed ? displayName : undefined}
        >
          <span className="grid size-9 flex-none place-items-center rounded-full bg-secondary font-heading text-sm font-bold">
            {displayName.charAt(0).toUpperCase()}
          </span>

          {!isCollapsed && <span className="min-w-0 truncate">{displayName}</span>}
        </div>
      </aside>

      <main className="min-w-0 w-full max-w-[1240px] px-[clamp(20px,4vw,48px)] pb-[72px] pt-8 max-[860px]:pb-24">
        {children}
      </main>
    </div>
  );
}

export { AppShell };
