"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Parcel {
  id: string;
  createdAt: string;
  track: { id: string; trackNumber: string; status: { name: string; color: string }; updatedAt: string };
}

export default function ArchivePage() {
  const { t, locale } = useLocale();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchive = () => {
    fetch("/api/parcels?archived=true", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setParcels(d.parcels || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArchive(); }, []);

  const handleUnarchive = async (id: string) => {
    const res = await fetch(`/api/parcels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
      credentials: "include",
    });
    if (res.ok) { toast.success(t.archive.restored); fetchArchive(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/parcels/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success(t.parcels.deleted); fetchArchive(); }
  };

  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  return (
    <div className="md:ml-56 space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{t.archive.title}</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>{t.archive.archivedParcels} ({parcels.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t.common.loading}</p>
          ) : parcels.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Archive className="h-16 w-16 text-muted-foreground/20 mx-auto" />
              <p className="text-muted-foreground">{t.archive.empty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parcels.map((parcel) => (
                <div key={parcel.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                  <Link href={`/track/${parcel.track.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono truncate">{parcel.track.trackNumber}</code>
                      <StatusBadge name={parcel.track.status.name} color={parcel.track.status.color} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(parcel.track.updatedAt).toLocaleDateString(dateLocale)}
                    </p>
                  </Link>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleUnarchive(parcel.id)} title={t.archive.restore}>
                      <RotateCcw className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(parcel.id)} title={t.common.delete}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
