import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonClasses } from "../ui/button-classes";
import { SkipLink } from "./SkipLink";
import { Logo } from "./Logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <SkipLink />
      <header className="border-b-[length:var(--border-divider)] border-dashed border-cream-deep">
        <div className="mx-auto flex h-[var(--nav-height)] max-w-page items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link to="/app/new" className={buttonClasses("secondary")}>
            + New poll
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-page px-4 py-10">
        {children}
      </main>
    </div>
  );
}
