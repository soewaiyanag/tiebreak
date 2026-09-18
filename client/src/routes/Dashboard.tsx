import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { PollSummary } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { PollCard } from "../components/poll/PollCard";
import { Skeleton } from "../components/ui/Skeleton";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { buttonClasses } from "../components/ui/button-classes";
import { usePollsApi } from "../hooks/useSessionContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

type Tab = "open" | "closed";

export function Dashboard() {
  useDocumentTitle("Your polls · Tiebreak");
  const api = usePollsApi();
  const [polls, setPolls] = useState<PollSummary[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("open");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .listPolls()
      .then((result) => {
        if (cancelled) return;
        setPolls(result);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api, retryToken]);

  if (loadError) {
    return (
      <AppShell>
        <div className="rounded-[length:var(--radius-lg)] bg-cream-deep p-6 text-center">
          <p className="font-body text-sm text-cocoa">That didn't load. Try again.</p>
          <Button variant="secondary" className="mt-3" onClick={() => setRetryToken((n) => n + 1)}>
            Retry
          </Button>
        </div>
      </AppShell>
    );
  }

  if (polls === null) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  if (polls.length === 0) return <FirstRunEmptyState />;

  const openPolls = polls.filter((p) => p.status === "open").sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime());
  const closedPolls = polls.filter((p) => p.status === "settled");
  const [featured, ...rest] = tab === "open" ? openPolls : [];
  const shownList = tab === "open" ? rest : closedPolls;

  return (
    <AppShell>
      <h1 className="font-display text-xl font-extrabold text-cocoa">Your polls</h1>

      <div className="mt-5 inline-flex rounded-full border-[length:var(--border-chip)] border-cocoa bg-card p-1">
        {(["open", "closed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-full px-4 py-1.5 font-body text-sm font-bold transition-[background-color,color,transform] duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal motion-reduce:transition-none motion-reduce:active:scale-100 ${
              tab === t ? "bg-cream-deep text-cocoa" : "text-cocoa-soft hover:text-cocoa"
            }`}
          >
            {t === "open" ? "My polls" : "Closed"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {tab === "open" && featured && <PollCard poll={featured} featured />}

        {shownList.length === 0 ? (
          <p className="font-body text-sm text-cocoa-soft">
            {tab === "open" ? "Nothing else open right now." : "Nothing's settled yet."}
          </p>
        ) : (
          shownList.map((poll) => <PollCard key={poll.id} poll={poll} />)
        )}
      </div>
    </AppShell>
  );
}

function FirstRunEmptyState() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-form flex-col items-center gap-6 py-10 text-center">
        <div>
          <h1 className="font-display text-xl font-extrabold text-cocoa">Your first poll starts here</h1>
          <p className="mt-2 font-body text-base text-cocoa-soft">
            Give it a title, a couple of options, and a closing time — then drop the link in the chat.
          </p>
        </div>
        <Link to="/app/new" className={buttonClasses("primary", "px-8 py-3 text-base")}>
          Create your first poll
        </Link>

        <div className="mt-6 w-full rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-dashed border-cocoa-faint p-6 text-left opacity-80">
          <Pill tone="neutral">Example</Pill>
          <h2 className="mt-3 font-display text-md font-extrabold text-cocoa">Pizza night: what are we ordering?</h2>
          <p className="mt-1 font-body text-sm text-cocoa-soft">Closes today at 7:00 PM · 11 votes</p>
        </div>
      </div>
    </AppShell>
  );
}
