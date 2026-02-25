"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Package, ArrowRight, Archive, Plus, DollarSign, MapPin,
  MessageCircle, Instagram, Phone, ShieldAlert, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TrackTimeline } from "@/components/shared/track-timeline";

interface Parcel {
  id: string;
  isArchived: boolean;
  createdAt: string;
  track: {
    id: string;
    trackNumber: string;
    status: { name: string; color: string };
    history: { id: string; date: string; status: { name: string; color: string } }[];
  };
}

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
    history: { id: string; date: string; status: { name: string; color: string }; note: string | null }[];
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<TrackResult | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/parcels", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setParcels(d.parcels || []))
      .finally(() => setLoading(false));

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  const activeParcels = parcels.filter((p) => !p.isArchived);
  const recentParcels = activeParcels.slice(0, 3);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResult(data);
    } catch {
      setSearchResult({ found: false, message: t.common.searchError });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="md:ml-56 space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">{t.dashboard.greeting} {user?.name}! 👋</h1>
        <p className="opacity-90 mt-1">{t.dashboard.welcome}</p>
        {user?.clientCode && (
          <p className="text-sm opacity-75 mt-2">{t.dashboard.clientCode}: <strong>{user.clientCode}</strong></p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeParcels.length}</p>
                <p className="text-sm text-muted-foreground">{t.dashboard.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                <Archive className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{parcels.filter((p) => p.isArchived).length}</p>
                <p className="text-sm text-muted-foreground">{t.dashboard.inArchive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t.dashboard.trackParcel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t.dashboard.trackPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? "..." : t.common.search}
            </Button>
          </div>
          {searchResult && (
            <div className="mt-4">
              {searchResult.found && searchResult.track ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{searchResult.track.trackNumber}</code>
                    <StatusBadge name={searchResult.track.status.name} color={searchResult.track.status.color} />
                  </div>
                  <TrackTimeline history={searchResult.track.history} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-2">{searchResult.message || t.common.trackNotFound}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.dashboard.recentParcels}</CardTitle>
          <Link href="/parcels">
            <Button variant="ghost" size="sm" className="gap-1">
              {t.common.all} <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t.common.loading}</p>
          ) : recentParcels.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">{t.dashboard.noParcels}</p>
              <Link href="/parcels">
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t.dashboard.addTrack}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentParcels.map((parcel) => (
                <Link key={parcel.id} href={`/track/${parcel.track.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer">
                    <div>
                      <code className="text-sm font-mono">{parcel.track.trackNumber}</code>
                    </div>
                    <StatusBadge name={parcel.track.status.name} color={parcel.track.status.color} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {settings && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t.dashboard.info}</h2>

          <div className="grid grid-cols-1 gap-4">
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.dashboard.yuanRate}</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">1¥ = {settings.exchangeRate}₸</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {settings.warehouseAddress && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t.dashboard.warehouseKz}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium">{settings.warehouseAddress}</p>
                </CardContent>
              </Card>
            )}

            {settings.chinaAddress && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" /> {t.dashboard.warehouseChina}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{settings.chinaAddress}</p>
                </CardContent>
              </Card>
            )}

            {(settings.whatsappNumber || settings.instagramLink) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t.dashboard.contacts}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {settings.whatsappNumber && (
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shrink-0">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">WhatsApp</p>
                        <p className="text-sm font-medium group-hover:text-green-700 dark:group-hover:text-green-400">{settings.whatsappNumber}</p>
                      </div>
                    </a>
                  )}
                  {settings.instagramLink && (
                    <a
                      href={settings.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shrink-0">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Instagram</p>
                        <p className="text-sm font-medium group-hover:text-pink-700 dark:group-hover:text-pink-400">
                          {settings.instagramLink.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
                        </p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {settings.prohibitedItems && (
              <Card className="border-red-100 dark:border-red-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4" /> {t.dashboard.prohibited}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{settings.prohibitedItems}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
