/** "Mees Egberts" → "ME", "Mees" → "ME". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#AF52DE",
  "#FF2D55",
  "#5AC8FA",
  "#5856D6",
  "#FF3B30",
];

/** Vaste kleur per naam, zodat iemand overal dezelfde kleur houdt. */
export function avatarColor(name: string): string {
  let hash = 0;

  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
