"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { TrackTimeline } from "@/components/shared/track-timeline";
import { Search, Plus, Trash2, Edit2, RefreshCw, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";

interface Status { id: string; name: string; color: string; order: number }
interface Track {
  id: string; trackNumber: string; weight: number | null; description: string | null;
  status: { id: string; name: string; color: string };
  batch: { id: string; batchNumber: string } | null;
  parcels: { user: { id: string; name: string; surname: string; phone: string; clientCode: string | null } }[];
  createdAt: string; updatedAt: string;
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [viewTrack, setViewTrack] = useState<Track & { history?: { id: string; date: string; status: { name: string; color: string }; note: string | null }[] } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTrack, setNewTrack] = useState({ trackNumber: "", statusId: "", weight: "", description: "" });
  const LIMIT = 50;

  const fetchStatuses = async () => {
    const r = await fetch("/api/statuses", { credentials: "include" });
    const d = await r.json();
    setStatuses(d.statuses || []);
  };

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "all") params.set("statusId", statusFilter);
    const r = await fetch(`/api/tracks?${params}`, { credentials: "include" });
    const d = await r.json();
    setTracks(d.tracks || []);
    setTotal(d.pagination?.total || 0);
    setSelected(new Set());
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStatuses(); }, []);
  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить трек?")) return;
    const r = await fetch(`/api/tracks/${id}`, { method: "DELETE", credentials: "include" });
    if (r.ok) { toast.success("Удалено"); fetchTracks(); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${selected.size} треков?`)) return;
    const r = await fetch("/api/tracks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackIds: Array.from(selected) }),
      credentials: "include",
    });
    if (r.ok) { toast.success("Удалено"); fetchTracks(); }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus) return;
    const r = await fetch("/api/tracks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackIds: Array.from(selected), statusId: bulkStatus }),
      credentials: "include",
    });
    if (r.ok) { toast.success("Статус обновлён"); fetchTracks(); setBulkStatus(""); }
  };

  const handleUpdate = async () => {
    if (!editTrack) return;
    const r = await fetch(`/api/tracks/${editTrack.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackNumber: editTrack.trackNumber,
        statusId: editTrack.status.id,
        weight: editTrack.weight,
        description: editTrack.description,
      }),
      credentials: "include",
    });
    if (r.ok) { toast.success("Обновлено"); setEditTrack(null); fetchTracks(); }
    else { const d = await r.json(); toast.error(d.error); }
  };

  const handleCreate = async () => {
    const r = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackNumber: newTrack.trackNumber,
        statusId: newTrack.statusId,
        weight: newTrack.weight ? parseFloat(newTrack.weight) : undefined,
        description: newTrack.description || undefined,
      }),
      credentials: "include",
    });
    if (r.ok) {
      toast.success("Трек создан");
      setCreateOpen(false);
      setNewTrack({ trackNumber: "", statusId: "", weight: "", description: "" });
      fetchTracks();
    } else { const d = await r.json(); toast.error(d.error); }
  };

  const handleViewTrack = async (id: string) => {
    const r = await fetch(`/api/tracks/${id}`, { credentials: "include" });
    const d = await r.json();
    setViewTrack(d.track);
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === tracks.length) setSelected(new Set());
    else setSelected(new Set(tracks.map((t) => t.id)));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold">Треки <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Добавить трек
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск по номеру..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {statuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchTracks}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-3 pb-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Выбрано: {selected.size}</span>
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Выбрать статус" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBulkStatus} disabled={!bulkStatus}>
              Обновить статус
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-3 w-3 mr-1" /> Удалить
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="p-3 w-10">
                    <Checkbox checked={selected.size === tracks.length && tracks.length > 0}
                      onCheckedChange={toggleAll} />
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Трек-номер</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Статус</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Партия</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Вес</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden xl:table-cell">Клиент</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Дата</th>
                  <th className="p-3 w-28 text-left font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Загрузка...</td></tr>
                ) : tracks.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Нет треков</td></tr>
                ) : (
                  tracks.map((track) => (
                    <tr key={track.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <Checkbox checked={selected.has(track.id)} onCheckedChange={() => toggleSelect(track.id)} />
                      </td>
                      <td className="p-3">
                        <code className="font-mono text-xs">{track.trackNumber}</code>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <StatusBadge name={track.status.name} color={track.status.color} />
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        {track.batch ? <code className="text-xs text-muted-foreground">{track.batch.batchNumber}</code> : "—"}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        {track.weight ? `${track.weight} кг` : "—"}
                      </td>
                      <td className="p-3 hidden xl:table-cell text-muted-foreground text-xs">
                        {track.parcels.map((p) => (
                          <span key={p.user.id}>{p.user.name} {p.user.surname}</span>
                        ))}
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                        {new Date(track.updatedAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewTrack(track.id)} title="Просмотр">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditTrack(track)} title="Редактировать">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDelete(track.id)} title="Удалить">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} из {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2 py-1">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Создать трек</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Трек-номер *</Label>
              <Input value={newTrack.trackNumber} onChange={(e) => setNewTrack((p) => ({ ...p, trackNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Статус *</Label>
              <Select value={newTrack.statusId} onValueChange={(v) => setNewTrack((p) => ({ ...p, statusId: v }))}>
                <SelectTrigger><SelectValue placeholder="Выберите статус" /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Вес (кг)</Label>
              <Input type="number" step="0.1" value={newTrack.weight} onChange={(e) => setNewTrack((p) => ({ ...p, weight: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input value={newTrack.description} onChange={(e) => setNewTrack((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!newTrack.trackNumber || !newTrack.statusId}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editTrack && (
        <Dialog open={!!editTrack} onOpenChange={() => setEditTrack(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Редактировать трек</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Трек-номер</Label>
                <Input value={editTrack.trackNumber} onChange={(e) => setEditTrack((p) => p ? { ...p, trackNumber: e.target.value } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={editTrack.status.id} onValueChange={(v) => {
                  const s = statuses.find((s) => s.id === v);
                  if (s) setEditTrack((p) => p ? { ...p, status: { id: s.id, name: s.name, color: s.color } } : p);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Вес (кг)</Label>
                <Input type="number" step="0.1" value={editTrack.weight ?? ""} onChange={(e) => setEditTrack((p) => p ? { ...p, weight: e.target.value ? parseFloat(e.target.value) : null } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input value={editTrack.description ?? ""} onChange={(e) => setEditTrack((p) => p ? { ...p, description: e.target.value } : p)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTrack(null)}>Отмена</Button>
              <Button onClick={handleUpdate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View dialog */}
      {viewTrack && (
        <Dialog open={!!viewTrack} onOpenChange={() => setViewTrack(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle><code className="font-mono text-base">{viewTrack.trackNumber}</code></DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge name={viewTrack.status.name} color={viewTrack.status.color} />
                {viewTrack.weight && <Badge variant="outline">{viewTrack.weight} кг</Badge>}
                {viewTrack.batch && <Badge variant="outline">Партия: {viewTrack.batch.batchNumber}</Badge>}
              </div>
              {viewTrack.parcels.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Клиенты:</p>
                  {viewTrack.parcels.map((p) => (
                    <p key={p.user.id} className="text-sm text-muted-foreground">{p.user.name} {p.user.surname} · {p.user.phone}</p>
                  ))}
                </div>
              )}
              {viewTrack.history && viewTrack.history.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">История:</p>
                  <TrackTimeline history={viewTrack.history} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
