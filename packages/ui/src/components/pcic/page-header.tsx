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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-.02em]">
          {title}
        </h1>
        {description && (
          <Meta className="mt-2 max-w-[56ch] text-base leading-[1.6]">{description}</Meta>
        )}
      </div>
      {actions}
    </header>
  );
}

export { PageHeader };
