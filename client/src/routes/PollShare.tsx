import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { PollDetail } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { buttonClasses } from "../components/ui/button-classes";
import { Skeleton } from "../components/ui/Skeleton";
import { usePollsApi } from "../hooks/useSessionContext";
import { useAnnouncer } from "../hooks/useAnnouncer";

export function PollShare() {
  const { id } = useParams<{ id: string }>();
  const api = usePollsApi();
  const { announceStatus } = useAnnouncer();
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    void api.getPoll(id).then(setPoll);
  }, [api, id]);

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
    setCopied(true);
    announceStatus("Link copied");
    setTimeout(() => setCopied(false), 2000);
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
          <Button variant="primary" onClick={copyLink} className="shrink-0">
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </Card>

        <Link to={`/app/polls/${poll.id}`} className={buttonClasses("secondary", "mt-6")}>
          Go to your poll
        </Link>
      </div>
    </AppShell>
  );
}
