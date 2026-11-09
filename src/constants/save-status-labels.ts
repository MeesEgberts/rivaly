import type { SaveStatus } from "@/hooks/use-bracket-draft";

export const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Opslaan…",
  saved: "✓ Opgeslagen",
  error: "Niet opgeslagen",
};
