import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { PollDetail } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { CopyButton } from "../components/ui/CopyButton";
import { buttonClasses } from "../components/ui/button-classes";
import { Skeleton } from "../components/ui/Skeleton";
import { usePollsApi } from "../hooks/useSessionContext";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { NotFound } from "./NotFound";

export function PollShare() {
  const { id } = useParams<{ id: string }>();
  const api = usePollsApi();
  const { announceStatus } = useAnnouncer();
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(poll ? `Share "${poll.title}" · Tiebreak` : "Share your poll · Tiebreak");

  useEffect(() => {
    if (!id) return;
    void api.getPoll(id).then(setPoll).catch(() => setNotFound(true));
  }, [api, id]);

  if (notFound) return <NotFound />;

  if (!poll) {
    return (
      <AppShell>
        <Skeleton className="h-48 w-full max-w-form" />
      </AppShell>
    );
  }

  const shareUrl = `${window.location.origin}/p/${poll.slug}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    announceStatus("Link copied");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-form text-center">
        <h1 className="font-display text-xl font-extrabold text-cocoa">Your poll's live</h1>
        <p className="mt-2 font-body text-base text-cocoa-soft">
          Paste this into the chat — anyone with the link can vote, no account needed.
        </p>

        <Card className="mt-6 flex items-center justify-between gap-3 bg-cream-deep">
          <span className="truncate font-body text-sm font-bold text-cocoa">{shareUrl}</span>
          <CopyButton onCopy={copyLink} label="Copy link" className="shrink-0" />
        </Card>

        <Link to={`/app/polls/${poll.id}`} className={buttonClasses("secondary", "mt-6")}>
          Go to your poll
        </Link>
      </div>
    </AppShell>
  );
}
