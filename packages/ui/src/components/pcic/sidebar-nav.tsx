import { Icon, type IconName } from "./icon";
import { cn } from "../../lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}
function SidebarNav({
  items,
  pathname,
  collapsed = false,
}: {
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
}) {
  return (
    <nav aria-label="Main" className={cn("grid gap-1", collapsed && "justify-items-center")}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              active && "bg-secondary text-foreground",
              collapsed && "w-11 justify-center px-0",
            )}
          >
            <Icon name={item.icon} />
            <span className={cn(collapsed && "sr-only")}>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export { SidebarNav };
