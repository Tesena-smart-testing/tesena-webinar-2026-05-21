export const LANGUAGES = ["cs-CZ", "en-US"] as const;
export type Locale = (typeof LANGUAGES)[number];

export const locale = (rawLocale: Locale) => {
  // Ověření hodnoty rawLocale
  if (!LANGUAGES.includes(rawLocale as Locale)) {
    throw new Error(`Invalid locale: [${rawLocale}]`);
  }

  return loadLocale(rawLocale);
};

function loadLocale(locale: string): Locale {
  if (locale.startsWith("cs")) return "cs-CZ";
  return "en-US";
}
