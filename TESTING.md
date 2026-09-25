# Manual test guide

Click-through checklist for verifying the live app actually works, end to end,
in a real browser. This is the UI-level complement to `yarn test:smoke`
(`server/scripts/smoke-test.ts`), which proves the API/DB path works but
never touches a page.

**Live app:** https://tiebreak-soewaiyanag.vercel.app

**You'll need two browser contexts** — your normal window (as the poll
creator) and a private/incognito window (as a voter). Voting is tracked
per-browser via `localStorage`, so voting twice from the same window is
what "already voted" is supposed to catch, not a bug.

---

## 1. Landing page

- [ ] Open the live URL. You should see the headline **"Settle it in the
      group chat, not another poll app."**
- [ ] Nav has **"Log in"** and **"Sign up"**.
- [ ] Two CTAs: **"Try as guest"** and **"Create an account"**.

## 2. Sign up (real account — this is the part the API smoke test can't cover)

- [ ] Click **"Sign up"** → fill **Name**, **Email**, **Password** → **"Create
      account"**.
- [ ] You land on `/app` ("Your polls") already signed in — no email
      verification step.
- [ ] Refresh the page. You should stay signed in (not bounced to `/login`).
- [ ] First-run empty state should show **"Your first poll starts here"**
      with a **"Create your first poll"** button and an example "Pizza
      night" card labeled **Example**.

## 3. Create a poll (single-choice)

- [ ] Click **"Create your first poll"** (or **"New poll"** from the
      dashboard).
- [ ] Fill **"What are you deciding?"** (e.g. "Where should we eat?").
- [ ] Enter at least 2 options (**"+ Add an option"** for more).
- [ ] Leave **"Just one"** selected under "How many can each voter pick?".
- [ ] Set **Closing time** to a few minutes from now.
- [ ] Leave **"Let voters suggest their own options"** checked.
- [ ] Click **"Create poll"**.
- [ ] You land on the share screen: **"Your poll's live"**, with a link and
      a **"Copy link"** button.
- [ ] Click **"Go to your poll"**.

## 4. Creator view while voting is open

- [ ] Status pill reads **"Voting open"**, with a **"Closes …"** pill.
- [ ] Before any votes: **"No votes yet — share the link below and come back
      once your crew has weighed in."**
- [ ] Copy the share link (you'll need it for step 5).

## 5. Vote as a separate voter

- [ ] Open the share link in a **private/incognito window**.
- [ ] Enter **"Your name"** and pick a color under **"Pick a color"**.
- [ ] Select an option, then the sticky button should read **"Cast my vote
      for `<option>`"**.
- [ ] Tap it → confirm modal (**"Votes are final…"**) → **"Cast my vote"**.
- [ ] You should land on a confirmation: **"You backed `<option>` — thanks
      for voting, no takebacks."**
- [ ] Reload that same incognito window. You should see the same
      confirmation again (not the ballot) — proves the one-vote lock works.

## 6. Live results on the creator's screen

- [ ] Switch back to your normal window (still on the poll page).
- [ ] The vote from step 5 should now show up **without you reloading the
      page** (this is the "live results" part — give it a few seconds).

## 7. Suggestions

- [ ] In the incognito window, before or after voting, use **"Suggest
      something else"** → fill **"What should we add?"** → **"Suggest it"**.
- [ ] Back on the creator's screen, a **"Pending suggestions"** card should
      appear: `<name> suggested: "<label>"`.
- [ ] Click **"Add it"** — it should join the ballot. Then try declining a
      second suggestion with **"Not this time"** and check the **"Undo"**
      toast actually restores it.

## 8. Settle and reveal

- [ ] Click **"End voting"** on the creator's screen.
- [ ] Status pill should flip to **"Settled"**, and you should see a proper
      reveal (not just the live view frozen).
- [ ] Click **"Copy result"** and confirm something is actually on your
      clipboard.
- [ ] Reload the incognito voter window — it should now show the settled
      result too, not the ballot.

## 9. Reopen

- [ ] On the settled creator view, click **"Reopen voting"**.
- [ ] Modal asks for a **"New closing time"** — pick one in the future,
      confirm with **"Reopen voting"**.
- [ ] Status should flip back to **"Voting open"**.

## 10. Edge cases worth checking

- [ ] Visit a nonsense URL like `/p/does-not-exist` — should show a real
      404, not a crash.
- [ ] Create a poll, let it close (or set closing time a minute out and
      wait), then open the share link from a *third* browser context that
      never voted — it should land on the settled/closed view directly, not
      the ballot.
- [ ] Try a **multi-choice** poll ("Pick up to N") and confirm you can
      select more than one option before voting.
- [ ] Vote until two options are tied, settle the poll, and confirm the tie
      gets a dedicated "tied" treatment rather than picking a fake winner.

---

## If something breaks

Check `/api/health` first — `curl https://tiebreak-soewaiyanag.vercel.app/api/health`
should return `{"status":"ok",...}`. If it doesn't, the backend Lambda is
probably broken from a git-push auto-deploy (see the note in project memory
about `vercel build --prod && vercel deploy --prebuilt --prod` being the
only reliable deploy path right now) — redeploy that way before assuming
the app itself is broken.
