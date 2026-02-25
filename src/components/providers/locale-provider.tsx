"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale, Translations } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translations;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: "ru",
    setLocale: () => { },
    t: getDict("ru"),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("ru");

    useEffect(() => {
        const saved = localStorage.getItem("locale") as Locale | null;
        if (saved === "kz" || saved === "ru") setLocaleState(saved);
    }, []);

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("locale", l);
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t: getDict(locale) }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
