"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Status {
  id: string; name: string; chineseName: string | null;
  order: number; color: string; isFinal: boolean; createdAt: string;
}

export default function AdminStatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const [form, setForm] = useState({ name: "", chineseName: "", order: "", color: "#6B7280", isFinal: false });

  const fetchStatuses = async () => {
    const r = await fetch("/api/statuses", { credentials: "include" });
    const d = await r.json();
    setStatuses(d.statuses || []);
    setLoading(false);
  };

  useEffect(() => { fetchStatuses(); }, []);

  const openCreate = () => {
    const maxOrder = Math.max(0, ...statuses.map((s) => s.order));
    setForm({ name: "", chineseName: "", order: String(maxOrder + 1), color: "#6B7280", isFinal: false });
    setCreateOpen(true);
  };

  const openEdit = (s: Status) => {
    setEditStatus(s);
    setForm({ name: s.name, chineseName: s.chineseName || "", order: String(s.order), color: s.color, isFinal: s.isFinal });
  };

  const handleCreate = async () => {
    const r = await fetch("/api/statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: parseInt(form.order), isFinal: form.isFinal, chineseName: form.chineseName || null }),
      credentials: "include",
    });
    if (r.ok) { toast.success("Статус создан"); setCreateOpen(false); fetchStatuses(); }
    else { const d = await r.json(); toast.error(d.error); }
  };

  const handleUpdate = async () => {
    if (!editStatus) return;
    const r = await fetch(`/api/statuses/${editStatus.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: parseInt(form.order), isFinal: form.isFinal, chineseName: form.chineseName || null }),
      credentials: "include",
    });
    if (r.ok) { toast.success("Сохранено"); setEditStatus(null); fetchStatuses(); }
    else { const d = await r.json(); toast.error(d.error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить статус?")) return;
    const r = await fetch(`/api/statuses/${id}`, { method: "DELETE", credentials: "include" });
    if (r.ok) { toast.success("Удалён"); fetchStatuses(); }
    else { const d = await r.json(); toast.error(d.error); }
  };

  const StatusForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Название (русский) *</Label>
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="На складе в Китае" />
      </div>
      <div className="space-y-2">
        <Label>Название (китайский)</Label>
        <Input value={form.chineseName} onChange={(e) => setForm((p) => ({ ...p, chineseName: e.target.value }))} placeholder="已入库" />
        <p className="text-xs text-muted-foreground">Используется для маппинга при загрузке XLSX</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Порядок *</Label>
          <Input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Цвет</Label>
          <div className="flex gap-2">
            <input type="color" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              className="w-10 h-10 rounded cursor-pointer border" />
            <Input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} className="font-mono text-sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.isFinal} onCheckedChange={(v) => setForm((p) => ({ ...p, isFinal: v }))} />
        <div>
          <Label>Финальный статус</Label>
          <p className="text-xs text-muted-foreground">Посылки с этим статусом считаются доставленными</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Статусы</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Добавить
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-12 text-muted-foreground">Загрузка...</p>
          ) : statuses.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Нет статусов</p>
          ) : (
            <div>
              {statuses.map((status, i) => (
                <div key={status.id} className={`flex items-center gap-4 p-4 ${i < statuses.length - 1 ? "border-b" : ""}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{status.name}</p>
                      {status.isFinal && <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 rounded">финальный</span>}
                      <span className="text-xs text-muted-foreground">#{status.order}</span>
                    </div>
                    {status.chineseName && (
                      <p className="text-xs text-muted-foreground mt-0.5">中文: {status.chineseName}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(status)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(status.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Создать статус</DialogTitle></DialogHeader>
          <StatusForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.order}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editStatus && (
        <Dialog open={!!editStatus} onOpenChange={() => setEditStatus(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Редактировать статус</DialogTitle></DialogHeader>
            <StatusForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditStatus(null)}>Отмена</Button>
              <Button onClick={handleUpdate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
