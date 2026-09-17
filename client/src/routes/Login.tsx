import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { SkipLink } from "../components/layout/SkipLink";
import { Logo } from "../components/layout/Logo";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { INPUT_CLASSES } from "../components/ui/input-classes";
import { authClient } from "../lib/auth-client";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) {
        setError(authError.message ?? "That didn't work. Try again.");
        return;
      }
      navigate(searchParams.get("next") || "/app");
    } catch {
      setError("That didn't send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SkipLink />
      <header className="px-4 py-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <main id="main" className="mx-auto max-w-form px-4 py-10">
        <h1 className="font-display text-xl font-extrabold text-cocoa">Log in</h1>
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <FormField label="Email">
            {(props) => (
              <input
                {...props}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASSES}
              />
            )}
          </FormField>
          <FormField label="Password" error={error}>
            {(props) => (
              <input
                {...props}
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLASSES}
              />
            )}
          </FormField>
          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-6 font-body text-sm text-cocoa-soft">
          New to Tiebreak?{" "}
          <Link to="/signup" className="font-bold text-teal-deep hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </>
  );
}
