import { Link } from "@tanstack/react-router";

export function BrandHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-center px-5 py-5">
      <Link
        to="/"
        className="font-display text-base tracking-tight active font-thin text-center text-slate-400"
      >
        Marketing Clarity
      </Link>
    </header>
  );
}
