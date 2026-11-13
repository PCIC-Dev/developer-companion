import type { SVGProps } from "react";
import { cn } from "../../lib/utils";

const paths = {
  journey: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
  tracks: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  work: "M7 3h8l4 4v14H7zM15 3v4h4M10 13h6M10 17h6",
  ranks: "M5 21V11M12 21V4M19 21v-7",
  people:
    "M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a2.5 2.5 0 100-5M17 14c2.5 0 4 2 4 5",
  review: "M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6",
  studio: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
} as const;

type IconName = keyof typeof paths;
function Icon({ name, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5 flex-none", className)}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export { Icon, type IconName };
