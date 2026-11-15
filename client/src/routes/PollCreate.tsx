import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import type { CreatePollInput } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { INPUT_CLASSES } from "../components/ui/input-classes";
import { linkButtonClasses } from "../components/ui/link-button-classes";
import { usePollsApi } from "../hooks/useSessionContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { CloseIcon } from "../components/ui/CloseIcon";
import { ClosingTimePicker } from "../components/poll/ClosingTimePicker";
import { InkChip } from "../components/ui/InkChip";
import { Switch } from "../components/ui/Switch";
import { buttonClasses } from "../components/ui/button-classes";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

interface Errors {
  title?: string;
  options?: string;
  closesAt?: string;
}

export function PollCreate() {
  useDocumentTitle("New poll · Tiebreak");
  const api = usePollsApi();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [type, setType] = useState<CreatePollInput["type"]>("single");
  const [maxChoices, setMaxChoices] = useState(2);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [closesAt, setClosesAt] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const closesAtRef = useRef<HTMLButtonElement>(null);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    const nextErrors: Errors = {};
    if (!title.trim()) nextErrors.title = "Give the poll a title so your crew knows what they're deciding.";
    if (filledOptions.length < MIN_OPTIONS) nextErrors.options = "Add at least 2 options.";
    if (!closesAt) nextErrors.closesAt = "Pick a closing time.";
    else if (new Date(closesAt).getTime() <= Date.now()) nextErrors.closesAt = "Closing time has to be in the future.";

    setErrors(nextErrors);
    if (nextErrors.title) return titleRef.current?.focus();
    if (nextErrors.options) return optionsRef.current?.querySelector("input")?.focus();
    if (nextErrors.closesAt) return closesAtRef.current?.focus();

    setSubmitting(true);
    try {
      const poll = await api.createPoll({
        title: title.trim(),
        type,
        // Clamped: removing options after setting the stepper can leave it above the option count.
        maxChoices: type === "multi" ? Math.min(maxChoices, options.length) : 1,
        suggestionsEnabled,
        closesAt: new Date(closesAt).toISOString(),
        options: filledOptions,
      });
      navigate(`/app/polls/${poll.id}/share`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-form">
        <h1 className="font-display text-[2.5rem] font-black leading-[var(--leading-display)] tracking-[-0.02em] text-cocoa [text-shadow:0.045em_0.045em_0_var(--color-butter)]">
          New poll
        </h1>
        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
          <FormField label="What are you deciding?" error={errors.title}>
            {(props) => (
              <input
                {...props}
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pizza night: what are we ordering?"
                className={INPUT_CLASSES}
              />
            )}
          </FormField>

          <fieldset>
            <legend className="font-body text-sm font-bold text-cocoa">Options</legend>
            <div ref={optionsRef} className="mt-1.5 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    aria-label={`Option ${index + 1}`}
                    placeholder={`Option ${index + 1}`}
                    className={INPUT_CLASSES}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= MIN_OPTIONS}
                    aria-label={`Remove option ${index + 1}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition-[color,background-color,rotate] duration-200 ease-[var(--ease-out)] hover:rotate-90 hover:bg-cream-deep hover:text-cocoa focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal disabled:opacity-30 disabled:hover:rotate-0 disabled:hover:bg-transparent motion-reduce:transition-none motion-reduce:hover:rotate-0"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="mt-1.5 font-body text-sm text-cocoa" role="alert">
                {errors.options}
              </p>
            )}
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= MAX_OPTIONS}
              className={linkButtonClasses("mt-2")}
            >
              + Add an option
            </button>
          </fieldset>

          <fieldset>
            <legend className="font-body text-sm font-bold text-cocoa">How many can each voter pick?</legend>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <InkChip
                picked={type === "single"}
                onClick={() => setType("single")}
                layout="flex items-center justify-center px-5"
                className="h-11 rounded-full text-sm"
              >
                Just one
              </InkChip>
              <InkChip
                picked={type === "multi"}
                onClick={() => setType("multi")}
                layout="flex items-center justify-center px-5"
                className="h-11 rounded-full text-sm"
              >
                More than one
              </InkChip>
              {type === "multi" && (
                // A stepper instead of a number box: the range is tiny (2 to the option count) and taps beat typing on a phone.
                <div className="flex animate-[check-in_0.18s_var(--ease-out)] items-center gap-2 motion-reduce:animate-none">
                  <span className="font-body text-sm text-cocoa-soft">up to</span>
                  <button
                    type="button"
                    onClick={() => setMaxChoices((n) => Math.max(2, n - 1))}
                    disabled={maxChoices <= 2}
                    aria-label="Fewer picks"
                    className={buttonClasses("secondary", "h-11 w-11 px-0")}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <output
                    aria-live="polite"
                    aria-label="Maximum picks"
                    className="w-6 text-center font-display text-lg font-black tabular-nums text-cocoa"
                  >
                    {maxChoices}
                  </output>
                  <button
                    type="button"
                    onClick={() => setMaxChoices((n) => Math.min(options.length, n + 1))}
                    disabled={maxChoices >= options.length}
                    aria-label="More picks"
                    className={buttonClasses("secondary", "h-11 w-11 px-0")}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </fieldset>

          <ClosingTimePicker
            ref={closesAtRef}
            legend="Closing time"
            value={closesAt}
            onChange={setClosesAt}
            error={errors.closesAt}
          />

          <Switch
            checked={suggestionsEnabled}
            onChange={setSuggestionsEnabled}
            label="Let voters suggest their own options"
            hint="Suggestions wait for your approval before they join the ballot."
          />

          <Button type="submit" variant="primary" disabled={submitting} className="w-full py-3.5">
            {submitting ? "Creating…" : "Create poll"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
