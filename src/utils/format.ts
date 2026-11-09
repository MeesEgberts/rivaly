export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatInviteCode(code: string): string {
  return `RIV-${code}`;
}

export function ordinal(position: number): string {
  return `${position}e`;
}

/** "za 14:30" voor wedstrijdlijsten. */
export function formatKickoff(timestamp: number): string {
  return new Date(timestamp).toLocaleString("nl-NL", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "zaterdag 14 november" voor een dagkop. */
export function formatDayHeading(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "za 14 – zo 15 nov" of "za 14 nov" als begin en eind op dezelfde dag vallen. */
export function formatDateRange(start: number, end: number): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  };
  const from = new Date(start).toLocaleDateString("nl-NL", options);
  const to = new Date(end).toLocaleDateString("nl-NL", options);

  if (from === to) {
    return from;
  }

  return `${from} – ${to}`;
}

/** "renners" → "Renners" */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
