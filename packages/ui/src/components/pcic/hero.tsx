import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Eyebrow } from "../ui/tag";

interface HeroStat {
  value: ReactNode;
  label: string;
}
function Hero({
  eyebrow,
  title,
  description,
  stats,
  className,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  stats?: HeroStat[];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "mb-6 grid items-center gap-8 rounded-[20px] bg-hero px-6 py-8 text-white md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:px-10",
        className,
      )}
    >
      <div>
        <Eyebrow className="text-[#b9c6e6]">{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.1]">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-[56ch] text-[#dbe3f5]">{description}</p>}
        {children}
      </div>
      {stats && <HeroStats stats={stats} />}
    </section>
  );
}
function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="grid grid-cols-3 border-l border-white/20">
      {stats.map((stat) => (
        <div key={stat.label} className="border-r border-white/20 px-5 py-1 last:border-r-0">
          <b className="block font-heading text-[2.1rem] leading-[1.1]">{stat.value}</b>
          <span className="font-mono text-[0.66rem] uppercase tracking-[.07em] text-[#b9c6e6]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export { Hero, HeroStats };
