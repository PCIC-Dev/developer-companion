import type { ReactNode } from "react";
import { Eyebrow, Meta } from "../ui/tag";

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>

        <h1 className="mt-2 font-heading text-[clamp(1.85rem,3.5vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground">
          {title}
        </h1>

        {description && (
          <Meta className="mt-3 block max-w-[60ch] text-sm leading-7 sm:text-base">
            {description}
          </Meta>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">{actions}</div>
      )}
    </header>
  );
}

export { PageHeader };
