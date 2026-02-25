"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { Package, Plus, Trash2, Archive } from "lucide-react";
import { toast } from "sonner";

interface Parcel {
  id: string;
  isArchived: boolean;
  createdAt: string;
  track: {
    id: string;
    trackNumber: string;
    status: { name: string; color: string };
    updatedAt: string;
  };
}

export default function ParcelsPage() {
  const { t, locale } = useLocale();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrack, setNewTrack] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchParcels = () => {
    fetch("/api/parcels", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setParcels(d.parcels || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchParcels(); }, []);

  const handleAdd = async () => {
    if (!newTrack.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackNumber: newTrack.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
      } else {
        toast.success(t.parcels.parcelAdded);
        setNewTrack("");
        fetchParcels();
      }
    } finally {
      setAdding(false);
    }
  };

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/parcels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
      credentials: "include",
    });
    if (res.ok) {
      toast.success(t.parcels.movedToArchive);
      fetchParcels();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/parcels/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success(t.parcels.deleted);
      fetchParcels();
    }
  };

  const activeParcels = parcels.filter((p) => !p.isArchived);
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  return (
    <div className="md:ml-56 space-y-6">
      <h1 className="text-2xl font-bold">{t.parcels.title}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">{t.parcels.addTitle}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t.parcels.placeholder}
              value={newTrack}
              onChange={(e) => setNewTrack(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={adding || !newTrack.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              {adding ? t.common.adding : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.parcels.activeParcels} ({activeParcels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t.common.loading}</p>
          ) : activeParcels.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="h-16 w-16 text-muted-foreground/20 mx-auto" />
              <p className="text-muted-foreground">{t.parcels.noParcels}</p>
              <p className="text-sm text-muted-foreground">{t.parcels.noTrackHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeParcels.map((parcel) => (
                <div key={parcel.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <Link href={`/track/${parcel.track.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono truncate">{parcel.track.trackNumber}</code>
                      <StatusBadge name={parcel.track.status.name} color={parcel.track.status.color} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.common.updated}: {new Date(parcel.track.updatedAt).toLocaleDateString(dateLocale)}
                    </p>
                  </Link>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleArchive(parcel.id)} title={t.parcels.toArchive}>
                      <Archive className="h-4 w-4 text-muted-foreground" />
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
