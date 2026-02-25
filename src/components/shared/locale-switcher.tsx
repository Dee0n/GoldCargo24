"use client";

import { useLocale } from "@/components/providers/locale-provider";

export function LocaleSwitcher() {
    const { locale, setLocale } = useLocale();

    return (
        <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
            <button
                onClick={() => setLocale("ru")}
                className={`px-2 py-1 rounded-md transition-colors ${locale === "ru"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                RU
            </button>
            <button
                onClick={() => setLocale("kz")}
                className={`px-2 py-1 rounded-md transition-colors ${locale === "kz"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                KZ
            </button>
        </div>
    );
}
