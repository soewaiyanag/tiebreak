import { Link } from "react-router";
import { buttonClasses } from "../components/ui/button-classes";
import { Logo } from "../components/layout/Logo";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFound() {
  useDocumentTitle("Poll not found · Tiebreak");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-cream px-4 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-xl font-extrabold text-cocoa">That poll's gone quiet</h1>
        <p className="mt-2 font-body text-base text-cocoa-soft">
          This link doesn't lead anywhere anymore — the poll may have been deleted, or the link's just wrong.
        </p>
      </div>
      <Link to="/" className={buttonClasses("primary")}>
        Back to Tiebreak
      </Link>
    </main>
  );
}
