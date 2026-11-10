import type { ReactNode } from "react";
import { Icon } from "./icon";
import { SidebarNav, type NavItem } from "./sidebar-nav";
import { cn } from "../../lib/utils";

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
  domain: _domain,
  collapsed = false,
  onCollapsedChange,
}: {
  children: ReactNode;
  name: string;
  role?: "member" | "mentor" | "new";
  pathname?: string;
  domain?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const items =
    role === "mentor"
      ? mentorNav
      : role === "new"
        ? memberNav.filter((item) => item.label !== "People")
        : memberNav;
  void _domain;
  return (
    <div
      className={cn(
        "grid min-h-screen transition-[grid-template-columns] duration-200 [grid-template-columns:252px_minmax(0,1fr)] max-[860px]:block",
        collapsed && "[grid-template-columns:76px_minmax(0,1fr)]",
      )}
    >
      <aside className="sticky top-0 flex h-screen flex-col gap-6 overflow-auto border-r border-border bg-card px-4 py-6 max-[860px]:fixed max-[860px]:inset-auto max-[860px]:bottom-0 max-[860px]:top-auto max-[860px]:z-20 max-[860px]:h-[72px] max-[860px]:w-full max-[860px]:flex-row max-[860px]:items-center max-[860px]:justify-around max-[860px]:overflow-hidden max-[860px]:border-r-0 max-[860px]:border-t max-[860px]:px-2 max-[860px]:py-2">
        <div className="flex min-h-11 items-center justify-between gap-2 max-[860px]:hidden">
          <a href="/" className="flex items-center gap-3 font-heading text-[1.3rem] font-semibold">
            <span className="grid size-11 place-items-center rounded-[12px] bg-hero text-xl text-white">
              P
            </span>
            {!collapsed && (
              <span>
                <strong className="block">PCIC</strong>
                <small className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[.06em] text-muted-foreground">
                  Developer Companion
                </small>
              </span>
            )}
          </a>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="grid size-9 place-items-center rounded-[10px] border border-border bg-transparent text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <div className="max-[860px]:w-full">
          <div className="max-[860px]:hidden">
            <SidebarNav items={items} pathname={pathname} collapsed={collapsed} />
          </div>
          <nav aria-label="Main" className="hidden max-[860px]:flex max-[860px]:justify-around">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="grid min-h-11 min-w-11 place-items-center rounded-[10px] text-muted-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-foreground"
              >
                <Icon name={item.icon} />
                <span className="sr-only">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-auto px-3 font-bold max-[860px]:hidden">{name}</div>
      </aside>
      <main className="w-full max-w-[1240px] px-[clamp(20px,4vw,48px)] pb-[72px] pt-8 max-[860px]:pb-24">
        {children}
      </main>
    </div>
  );
}
export { AppShell };
