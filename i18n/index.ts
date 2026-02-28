import type { Locale } from "../config/locale";
import { cs } from "./cs";
import { en } from "./en";
import type { Schema } from "./schema";

export const TEXTS = {
  "cs-CZ": cs,
  "en-US": en,
} satisfies Record<Locale, Schema>;

export function loadDictionary(locale: Locale) {
  return TEXTS[locale];
}
