import { createFileRoute } from "@tanstack/react-router";
import { RelojApp } from "@/components/app/RelojApp";

export const Route = createFileRoute("/")({ component: RelojApp });
