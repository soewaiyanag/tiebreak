import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../components/layout/AuthLayout";
import { PasswordInput } from "../components/ui/PasswordInput";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { INPUT_CLASSES } from "../components/ui/input-classes";
import { authClient } from "../lib/auth-client";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { linkButtonClasses } from "../components/ui/link-button-classes";

export function Signup() {
  useDocumentTitle("Sign up · Tiebreak");
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
    <AuthLayout
      title="Make it official"
      subtitle="An account keeps your polls in one place. The people you invite never need one."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={linkButtonClasses()}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            <PasswordInput
              {...props}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>
        <Button type="submit" variant="primary" disabled={submitting} className="!mt-8 w-full py-3.5">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
