import { cn } from "../../lib/utils";

function FieldError({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "mt-2 rounded-lg bg-primary/25 px-2.5 py-1.5 text-[0.86rem] font-semibold text-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export { FieldError };
