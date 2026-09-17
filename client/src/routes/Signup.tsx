import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { SkipLink } from "../components/layout/SkipLink";
import { Logo } from "../components/layout/Logo";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { INPUT_CLASSES } from "../components/ui/input-classes";
import { authClient } from "../lib/auth-client";

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      const { error: authError } = await authClient.signUp.email({ name, email, password });
      if (authError) {
        setError(authError.message ?? "That didn't work. Try again.");
        return;
      }
      navigate("/app");
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
        <h1 className="font-display text-xl font-extrabold text-cocoa">Create an account</h1>
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <FormField label="Name">
            {(props) => (
              <input
                {...props}
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASSES}
              />
            )}
          </FormField>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLASSES}
              />
            )}
          </FormField>
          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 font-body text-sm text-cocoa-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-teal-deep hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </>
  );
}
