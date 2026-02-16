"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { TrackTimeline } from "@/components/shared/track-timeline";
import { ArrowLeft, Package, Scale } from "lucide-react";

interface Track {
  trackNumber: string;
  weight: number | null;
  description: string | null;
  status: { name: string; color: string };
  history: { id: string; date: string; status: { name: string; color: string }; note: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export default function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetch(`/api/tracks/${p.id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setTrack(d.track))
        .finally(() => setLoading(false));
    });
  }, [params]);

  return (
    <div className="md:ml-56 max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/parcels">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Детали посылки</h1>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Загрузка...</CardContent></Card>
      ) : !track ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Трек не найден</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Трек-номер</p>
                  <code className="text-lg font-mono font-bold">{track.trackNumber}</code>
                </div>
                <StatusBadge name={track.status.name} color={track.status.color} />
              </div>

              {track.weight && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  <span>{track.weight} кг</span>
                </div>
              )}

              {track.description && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mt-0.5" />
                  <span>{track.description}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Добавлен: {new Date(track.createdAt).toLocaleDateString("ru-RU")} ·
                Обновлён: {new Date(track.updatedAt).toLocaleDateString("ru-RU")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>История статусов</CardTitle></CardHeader>
            <CardContent>
              {track.history.length === 0 ? (
                <p className="text-muted-foreground text-sm">История пуста</p>
              ) : (
                <TrackTimeline history={track.history} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
