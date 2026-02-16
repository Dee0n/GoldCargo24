"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit2, Eye, RefreshCw, ChevronLeft, ChevronRight, ShieldOff, Shield } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string; phone: string; name: string; surname: string; email: string | null;
  role: string; clientCode: string | null; isBlocked: boolean; createdAt: string;
  _count?: { parcels: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ phone: "", password: "", name: "", surname: "", email: "", role: "CLIENT", clientCode: "" });
  const router = useRouter();
  const LIMIT = 50;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) params.set("search", search);
    if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);
    const r = await fetch(`/api/users?${params}`, { credentials: "include" });
    const d = await r.json();
    setUsers(d.users || []);
    setTotal(d.pagination?.total || 0);
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      name: user.name, surname: user.surname, phone: user.phone,
      email: user.email || "", role: user.role, clientCode: user.clientCode || "",
      isBlocked: user.isBlocked, password: "",
    });
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    const payload: Record<string, unknown> = { ...editForm };
    if (!payload.password) delete payload.password;
    if (!payload.email) payload.email = null;
    if (!payload.clientCode) payload.clientCode = null;
    const r = await fetch(`/api/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (r.ok) { toast.success("Сохранено"); setEditUser(null); fetchUsers(); }
    else { const d = await r.json(); toast.error(d.error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить пользователя?")) return;
    const r = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
    if (r.ok) { toast.success("Удалён"); fetchUsers(); }
  };

  const handleToggleBlock = async (user: User) => {
    const r = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !user.isBlocked }),
      credentials: "include",
    });
    if (r.ok) { toast.success(user.isBlocked ? "Разблокирован" : "Заблокирован"); fetchUsers(); }
  };

  const handleCreate = async () => {
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newUser, email: newUser.email || undefined, clientCode: newUser.clientCode || undefined }),
      credentials: "include",
    });
    if (r.ok) {
      toast.success("Пользователь создан");
      setCreateOpen(false);
      setNewUser({ phone: "", password: "", name: "", surname: "", email: "", role: "CLIENT", clientCode: "" });
      fetchUsers();
    } else { const d = await r.json(); toast.error(d.error); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold">Пользователи <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Добавить
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Имя, телефон, код клиента..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Все роли" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="CLIENT">Клиенты</SelectItem>
              <SelectItem value="ADMIN">Админы</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchUsers}><RefreshCw className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Пользователь</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Телефон</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Код клиента</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Роль</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Посылок</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden xl:table-cell">Дата</th>
                  <th className="p-3 w-36 text-left font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Загрузка...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Нет пользователей</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={`border-b hover:bg-muted/50 transition-colors ${user.isBlocked ? "opacity-50" : ""}`}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{user.name} {user.surname}</p>
                          {user.isBlocked && <Badge variant="destructive" className="text-xs">заблокирован</Badge>}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{user.phone}</td>
                      <td className="p-3 hidden lg:table-cell">
                        {user.clientCode ? <code className="text-xs bg-muted px-1 rounded">{user.clientCode}</code> : "—"}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? "Админ" : "Клиент"}
                        </Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">{user._count?.parcels || 0}</td>
                      <td className="p-3 hidden xl:table-cell text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/users/${user.id}`)} title="Посылки">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(user)} title="Редактировать">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleBlock(user)} title={user.isBlocked ? "Разблокировать" : "Заблокировать"}>
                            {user.isBlocked ? <Shield className="h-3 w-3 text-green-500" /> : <ShieldOff className="h-3 w-3 text-orange-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => handleDelete(user.id)} title="Удалить">
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} из {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm px-2 py-1">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      {editUser && (
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Редактировать пользователя</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                { key: "name", label: "Имя" }, { key: "surname", label: "Фамилия" },
                { key: "phone", label: "Телефон" }, { key: "email", label: "Email" },
                { key: "clientCode", label: "Код клиента" }, { key: "password", label: "Новый пароль" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    type={key === "password" ? "password" : "text"}
                    placeholder={key === "password" ? "Оставьте пустым если не менять" : undefined}
                    value={String(editForm[key] ?? "")}
                    onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label>Роль</Label>
                <Select value={String(editForm.role)} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Клиент</SelectItem>
                    <SelectItem value="ADMIN">Админ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUser(null)}>Отмена</Button>
              <Button onClick={handleUpdate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Создать пользователя</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { key: "name", label: "Имя *" }, { key: "surname", label: "Фамилия *" },
              { key: "phone", label: "Телефон *" }, { key: "password", label: "Пароль *" },
              { key: "email", label: "Email" }, { key: "clientCode", label: "Код клиента" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type={key === "password" ? "password" : "text"}
                  value={newUser[key as keyof typeof newUser]}
                  onChange={(e) => setNewUser((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Роль</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Клиент</SelectItem>
                  <SelectItem value="ADMIN">Админ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!newUser.phone || !newUser.password || !newUser.name || !newUser.surname}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
