export const LANGUAGES = ["cs-CZ", "en-US"] as const;
export type Locale = (typeof LANGUAGES)[number];

export function loadLocale(locale: string): Locale {
  if (locale.startsWith("cs")) return "cs-CZ";
  return "en-US";
}
