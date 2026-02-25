"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowLeft, Phone, Mail, Hash, Package, Calendar } from "lucide-react";

interface UserDetail {
  id: string; phone: string; name: string; surname: string; email: string | null;
  role: string; clientCode: string | null; isBlocked: boolean; createdAt: string;
  parcels: {
    id: string; isArchived: boolean; createdAt: string;
    track: { id: string; trackNumber: string; status: { name: string; color: string }; updatedAt: string };
  }[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      fetch(`/api/users/${p.id}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setUser(d.user))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="text-center py-16 text-muted-foreground">Загрузка...</div>;
  if (!user) return <div className="text-center py-16 text-red-400">Пользователь не найден</div>;

  const activeParcels = user.parcels.filter((p) => !p.isArchived);
  const archivedParcels = user.parcels.filter((p) => p.isArchived);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{user.name} {user.surname}</h1>
        {user.isBlocked && <Badge variant="destructive">Заблокирован</Badge>}
        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
      </div>

      {/* Info */}
      <Card>
        <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {user.phone}</div>
          {user.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {user.email}</div>}
          {user.clientCode && <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> {user.clientCode}</div>}
          <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> {new Date(user.createdAt).toLocaleDateString("ru-RU")}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /> {user.parcels.length} посылок</div>
        </CardContent>
      </Card>

      {/* Active parcels */}
      <Card>
        <CardHeader><CardTitle>Активные посылки ({activeParcels.length})</CardTitle></CardHeader>
        <CardContent>
          {activeParcels.length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет активных посылок</p>
          ) : (
            <div className="space-y-2">
              {activeParcels.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <code className="text-xs font-mono">{p.track.trackNumber}</code>
                  <div className="flex items-center gap-2">
                    <StatusBadge name={p.track.status.name} color={p.track.status.color} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {archivedParcels.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Архив ({archivedParcels.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 opacity-60">
              {archivedParcels.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <code className="text-xs font-mono">{p.track.trackNumber}</code>
                  <StatusBadge name={p.track.status.name} color={p.track.status.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
