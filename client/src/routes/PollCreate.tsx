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
  const closesAtRef = useRef<HTMLInputElement>(null);

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
        maxChoices: type === "multi" ? maxChoices : 1,
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
      <h1 className="font-display text-xl font-extrabold text-cocoa">New poll</h1>
      <form onSubmit={handleSubmit} noValidate className="mx-auto mt-6 max-w-form space-y-6">
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
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cocoa-soft transition-[color,background-color,transform] duration-150 hover:scale-110 hover:bg-cream-deep hover:text-cocoa active:scale-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal disabled:opacity-30 disabled:hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
                >
                  ×
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
          <div className="mt-1.5 flex items-center gap-4">
            <label className="flex items-center gap-2 font-body text-sm text-cocoa">
              <input
                type="radio"
                name="type"
                checked={type === "single"}
                onChange={() => setType("single")}
                className="h-4 w-4 accent-tangerine-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2"
              />
              Just one
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-cocoa">
              <input
                type="radio"
                name="type"
                checked={type === "multi"}
                onChange={() => setType("multi")}
                className="h-4 w-4 accent-tangerine-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2"
              />
              Pick up to
            </label>
            {type === "multi" && (
              <input
                type="number"
                min={2}
                max={options.length}
                value={maxChoices}
                onChange={(e) => setMaxChoices(Number(e.target.value))}
                aria-label="Maximum choices"
                className={`${INPUT_CLASSES} w-20`}
              />
            )}
          </div>
        </fieldset>

        <FormField label="Closing time" error={errors.closesAt}>
          {(props) => (
            <input
              {...props}
              ref={closesAtRef}
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className={INPUT_CLASSES}
            />
          )}
        </FormField>

        <label className="flex items-center gap-2 font-body text-sm text-cocoa">
          <input
            type="checkbox"
            checked={suggestionsEnabled}
            onChange={(e) => setSuggestionsEnabled(e.target.checked)}
            className="h-4 w-4 accent-tangerine-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2"
          />
          Let voters suggest their own options
        </label>

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? "Creating…" : "Create poll"}
        </Button>
      </form>
    </AppShell>
  );
}
