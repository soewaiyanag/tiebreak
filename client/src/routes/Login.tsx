import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/layout/AuthLayout";
import { PasswordInput } from "../components/ui/PasswordInput";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { INPUT_CLASSES } from "../components/ui/input-classes";
import { authClient } from "../lib/auth-client";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { linkButtonClasses } from "../components/ui/link-button-classes";

export function Login() {
  useDocumentTitle("Log in · Tiebreak");
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
    <AuthLayout
      title="Welcome back"
      subtitle="Your polls, your crew, right where you left them."
      footer={
        <>
          New to Tiebreak?{" "}
          <Link to="/signup" className={linkButtonClasses()}>
            Create an account
          </Link>
          <span className="mt-2 block">
            Just looking?{" "}
            <Link to="/guest" className={linkButtonClasses()}>
              Try the demo
            </Link>
          </span>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            <PasswordInput
              {...props}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>
        <Button type="submit" variant="primary" disabled={submitting} className="!mt-8 w-full py-3.5">
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
