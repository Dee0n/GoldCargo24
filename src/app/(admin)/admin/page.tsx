"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { Users, Package, TrendingUp, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalTracks: number;
  totalParcels: number;
  statusCounts: { statusId: string; statusName: string; color: string; count: number }[];
  recentTracks: { id: string; trackNumber: string; status: { name: string; color: string }; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-muted-foreground">{t.common.loading}</div>;
  if (!stats) return <div className="text-center py-16 text-red-400">{t.common.serverError}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.nav.dashboard}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">{t.admin.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
                <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTracks}</p>
                <p className="text-sm text-muted-foreground">{t.admin.totalTracks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParcels}</p>
                <p className="text-sm text-muted-foreground">{t.nav.parcels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.statusCounts.length}</p>
                <p className="text-sm text-muted-foreground">{t.admin.totalStatuses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t.nav.statuses}</CardTitle></CardHeader>
          <CardContent>
            {stats.statusCounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.common.noData}</p>
            ) : (
              <div className="space-y-3">
                {stats.statusCounts
                  .sort((a, b) => b.count - a.count)
                  .map((s) => (
                    <div key={s.statusId} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{s.statusName}</span>
                          <span className="font-medium">{s.count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(s.count / stats.totalTracks) * 100}%`,
                              backgroundColor: s.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t.admin.recentTracks}</CardTitle></CardHeader>
          <CardContent>
            {stats.recentTracks.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.common.noData}</p>
            ) : (
              <div className="space-y-2">
                {stats.recentTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between py-1">
                    <code className="text-sm font-mono text-muted-foreground truncate max-w-[60%]">{track.trackNumber}</code>
                    <StatusBadge name={track.status.name} color={track.status.color} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
