import type { Locale } from "@/config/locale";
import { cs } from "@/i18n/cs";
import { en } from "@/i18n/en";
import type { Schema } from "@/i18n/schema";

export const TEXTS = {
  "cs-CZ": cs,
  "en-US": en,
} satisfies Record<Locale, Schema>;

export function loadDictionary(locale: Locale) {
  return TEXTS[locale];
}

export type Texts = Schema;
