import { Link } from "@tanstack/react-router";

export function BrandHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
      <Link to="/" className="flex items-center gap-2.5 group">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-semibold">
          G
        </span>
        <span className="font-display text-base font-semibold tracking-tight">
          Gomand Consult
        </span>
      </Link>
      <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
        Marketing Clarity
      </span>
    </header>
  );
}
