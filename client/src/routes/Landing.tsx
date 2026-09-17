import { Link } from "react-router";
import { Logo } from "../components/layout/Logo";
import { SkipLink } from "../components/layout/SkipLink";
import { buttonClasses } from "../components/ui/button-classes";
import { Card } from "../components/ui/Card";

const STEPS = [
  { title: "Make the poll", body: "A title, 2–10 options, and a closing time. Under a minute." },
  { title: "Drop the link in the chat", body: "No accounts, no sign-up wall — your crew taps and votes." },
  { title: "Watch it settle", body: "Live results while it's open, a proper reveal when it closes." },
];

export function Landing() {
  return (
    <>
      <SkipLink />
      <header className="mx-auto flex max-w-page items-center justify-between px-4 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link to="/login" className={buttonClasses("secondary")}>
            Log in
          </Link>
          <Link to="/signup" className={buttonClasses("primary")}>
            Sign up
          </Link>
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto max-w-page px-4 pb-16 pt-10 text-center sm:pt-20">
          <h1 className="mx-auto max-w-3xl text-balance font-display text-2xl font-black leading-[var(--leading-display)] text-cocoa [text-shadow:0.045em_0.045em_0_var(--color-butter)]">
            Settle it in the group chat, not another poll app.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance font-body text-base text-cocoa-soft">
            Make a poll, drop the link in the chat, and watch your crew decide — no accounts for voters, no
            spreadsheets, just a real answer before everyone loses interest.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/guest" className={buttonClasses("primary", "px-8 py-3 text-base")}>
              Try as guest
            </Link>
            <Link to="/signup" className={buttonClasses("secondary", "px-8 py-3 text-base")}>
              Create an account
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-page gap-4 px-4 pb-20 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title}>
              <span className="font-display text-lg font-black text-tangerine-deep">{i + 1}</span>
              <h2 className="mt-2 font-display text-md font-extrabold text-cocoa">{step.title}</h2>
              <p className="mt-1 font-body text-sm text-cocoa-soft">{step.body}</p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t-[length:var(--border-divider)] border-dashed border-cream-deep px-4 py-8 text-center font-body text-sm text-cocoa-soft">
        Tiebreak — a poll goes from created to decided inside one conversation.
      </footer>
    </>
  );
}
