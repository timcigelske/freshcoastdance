import * as React from "react";
import { sendMagicLink } from "../lib/auth";
import { Wordmark } from "../components/Wordmark";

export function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await sendMagicLink(email);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-bg p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Wordmark size="lg" />
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.25em] text-muted">
            Whitefish Bay · North Shore
          </p>
        </div>

        {status === "sent" ? (
          <p className="text-center text-sm text-fg/80">
            Check <strong>{email}</strong> for a sign-in link. You can close this tab.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="mb-1 text-center text-sm text-fg/70">
              Sign in with the email your studio has on file.
            </p>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-sm bg-accent py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
