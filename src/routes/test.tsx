import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/lib/site/brand";

/** `/test` was the original path for the dated call. Keep old links alive. */
export const Route = createFileRoute("/test")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.test, replace: true });
  },
});
