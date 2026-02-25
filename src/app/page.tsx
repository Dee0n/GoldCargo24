"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TrackTimeline } from "@/components/shared/track-timeline";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import {
  Package, Search, MapPin, MessageCircle, Instagram,
  ShieldAlert, ChevronRight, Truck, CheckCircle, Globe, Clock, Shield, Phone
} from "lucide-react";

interface Settings {
  exchangeRate: number;
  chinaAddress: string;
  warehouseAddress: string;
  whatsappNumber: string;
  instagramLink: string;
  aboutText: string;
  prohibitedItems: string;
}

interface TrackResult {
  found: boolean;
  message?: string;
  track?: {
    trackNumber: string;
    status: { name: string; color: string };
    history: {
      id: string;
      date: string;
      status: { name: string; color: string };
      note: string | null
    }[];
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<TrackResult | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResult(await res.json());
    } catch (error) {
      setSearchResult({ found: false, message: t.common.searchError });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Package className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="tracking-tight">GOLD CARGO</span>
          </Link>
          <div className="flex items-center gap-2">
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </a>
            )}
            {settings?.instagramLink && (
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
            )}
            <LocaleSwitcher />
            <ThemeToggle />
            <div className="w-px h-6 bg-border mx-1" />
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20">
                  {t.common.cabinet}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="rounded-xl font-semibold">{t.common.login}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-amber-50/50 to-background dark:from-amber-950/20 dark:via-amber-950/5 dark:to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-200/30 to-transparent dark:from-amber-800/10 rounded-full blur-3xl" />

          <div className="relative max-w-3xl mx-auto px-4 text-center pt-24 pb-20">
            <div className="inline-flex items-center gap-2 bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30">
              <Truck className="h-3.5 w-3.5" /> {t.home.deliveryBadge}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
              {t.home.heroTitle}<br />{t.home.heroTitleBr}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
              {t.home.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-2xl shadow-2xl shadow-amber-500/10 max-w-lg mx-auto">
              <Input
                placeholder={t.home.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-0 shadow-none focus-visible:ring-0 h-12 text-lg"
              />
              <Button onClick={handleSearch} disabled={searching} className="h-12 px-8 rounded-xl shrink-0 font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25">
                <Search className="h-4 w-4 mr-2" />
                {searching ? t.common.searching : t.common.search}
              </Button>
            </div>

            {searchResult && (
              <Card className="mt-8 text-left max-w-lg mx-auto animate-in fade-in slide-in-from-top-4 shadow-xl">
                <CardContent className="pt-6">
                  {searchResult.found && searchResult.track ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-600">{searchResult.track.trackNumber}</span>
                        <StatusBadge name={searchResult.track.status.name} color={searchResult.track.status.color} />
                      </div>
                      <TrackTimeline history={searchResult.track.history} />
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">{searchResult.message || t.common.trackNotFound}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="border-y bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-2xl flex items-center justify-center shadow-sm">
                  <Globe className="text-amber-600 dark:text-amber-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t.home.adv1Title}</h3>
                  <p className="text-muted-foreground text-sm">{t.home.adv1Text}</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-2xl flex items-center justify-center shadow-sm">
                  <Clock className="text-amber-600 dark:text-amber-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t.home.adv2Title}</h3>
                  <p className="text-muted-foreground text-sm">{t.home.adv2Text}</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-2xl flex items-center justify-center shadow-sm">
                  <Shield className="text-amber-600 dark:text-amber-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{t.home.adv3Title}</h3>
                  <p className="text-muted-foreground text-sm">{t.home.adv3Text}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {settings && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg shadow-amber-500/5 bg-gradient-to-br from-background to-muted/30">
                  <CardContent className="pt-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-amber-500/20">¥</div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.home.yuanRate}</p>
                      <p className="text-2xl font-bold">1 ¥ = {settings.exchangeRate} ₸</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg shadow-amber-500/5 bg-gradient-to-br from-background to-muted/30">
                  <CardContent className="pt-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <MapPin className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.home.warehouse}</p>
                      <p className="text-lg font-bold">{settings.warehouseAddress}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {settings && (settings.aboutText || settings.whatsappNumber || settings.instagramLink) && (
          <section className="border-t bg-muted/10 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {settings.aboutText && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t.home.aboutTitle}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{settings.aboutText}</p>
                  </div>
                )}
                {(settings.whatsappNumber || settings.instagramLink) && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{t.home.contactsTitle}</h2>
                    <div className="space-y-4">
                      {settings.whatsappNumber && (
                        <a
                          href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border bg-background hover:border-green-300 dark:hover:border-green-700 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">WhatsApp</p>
                            <p className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{settings.whatsappNumber}</p>
                          </div>
                        </a>
                      )}
                      {settings.instagramLink && (
                        <a
                          href={settings.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border bg-background hover:border-pink-300 dark:hover:border-pink-700 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                            <Instagram className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Instagram</p>
                            <p className="font-semibold group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">@goldcargo</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {settings?.prohibitedItems && (
          <section className="border-t py-16">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold">{t.home.prohibitedTitle}</h2>
              </div>
              <Card className="border-red-200/50 dark:border-red-900/30">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{settings.prohibitedItems}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-muted/20 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            GOLD CARGO
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} GOLD CARGO. {t.common.rights}</p>
          <div className="flex items-center gap-2">
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-green-600 h-8 w-8">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
            )}
            {settings?.instagramLink && (
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-pink-500 h-8 w-8">
                  <Instagram className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}