import { ru, type Translations } from "./ru";
import { kz } from "./kz";

export type Locale = "ru" | "kz";

const dictionaries: Record<Locale, Translations> = { ru, kz };

export function getDict(locale: Locale): Translations {
    return dictionaries[locale];
}

export type { Translations };
