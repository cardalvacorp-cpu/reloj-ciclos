import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-navy px-6 text-center">
      <p className="font-display text-xl text-cream">Watch Cycles</p>
      <p className="text-sm text-cream-muted">
        {error.message || "Could not load. Pull to refresh."}
      </p>
      <button
        type="button"
        className="min-h-12 rounded-md bg-gold px-5 text-sm font-medium text-navy"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </main>
  );
}
