"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { api, ApiClientError } from "@/lib/api-client"
import type { AdminMenu, AdminRole, MenuAccessRecord } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MenuForm = {
  name: string
  path: string
  icon: string
  parentId: string
}

const emptyMenuForm: MenuForm = {
  name: "",
  path: "",
  icon: "",
  parentId: "",
}

type PermFlags = {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export function MenusManager() {
  const [menus, setMenus] = useState<AdminMenu[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [access, setAccess] = useState<MenuAccessRecord[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminMenu | null>(null)
  const [form, setForm] = useState<MenuForm>(emptyMenuForm)
  const [saving, setSaving] = useState(false)

  const flatMenus = useMemo(() => {
    const flatten = (items: AdminMenu[]): AdminMenu[] =>
      items.flatMap((item) => [item, ...flatten(item.children ?? [])])
    return flatten(menus)
  }, [menus])

  const parentOptions = flatMenus.filter((m) => !editing || m.id !== editing.id)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [menuData, roleData] = await Promise.all([
        api.admin.menus.list(),
        api.admin.roles.list(),
      ])
      setMenus(menuData)
      setRoles(roleData)
      setSelectedRoleId((prev) => prev || roleData[0]?.id || "")
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load menus")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAccess = useCallback(async (roleId: string) => {
    if (!roleId) return
    try {
      setAccess(await api.admin.menuAccess.list(roleId))
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load permissions")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (selectedRoleId) loadAccess(selectedRoleId)
  }, [selectedRoleId, loadAccess])

  function getAccessForMenu(menuId: string): MenuAccessRecord | undefined {
    return access.find((a) => a.menuId === menuId)
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyMenuForm)
    setDialogOpen(true)
  }

  function openEdit(menu: AdminMenu) {
    setEditing(menu)
    setForm({
      name: menu.name,
      path: menu.path,
      icon: menu.icon ?? "",
      parentId: menu.parentId ?? "",
    })
    setDialogOpen(true)
  }

  async function handleSaveMenu() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        path: form.path,
        icon: form.icon || undefined,
        parentId: form.parentId || null,
      }
      if (editing) {
        await api.admin.menus.update(editing.id, payload)
      } else {
        await api.admin.menus.create(payload)
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save menu")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteMenu(id: string) {
    setError(null)
    try {
      await api.admin.menus.remove(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete menu")
    }
  }

  async function togglePermission(menuId: string, flag: keyof PermFlags, value: boolean) {
    if (!selectedRoleId) return
    setError(null)
    const existing = getAccessForMenu(menuId)
    const flags: PermFlags = {
      canCreate: existing?.canCreate ?? false,
      canRead: existing?.canRead ?? false,
      canUpdate: existing?.canUpdate ?? false,
      canDelete: existing?.canDelete ?? false,
      [flag]: value,
    }
    try {
      await api.admin.menuAccess.save({
        roleId: selectedRoleId,
        menuId,
        ...flags,
      })
      await loadAccess(selectedRoleId)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update permission")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage navigation items and role-based access.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Tabs defaultValue="menus">
        <TabsList>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="menus" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation Menus</CardTitle>
              <CardDescription>{flatMenus.length} menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatMenus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell>{menu.path}</TableCell>
                      <TableCell>{menu.icon ?? "—"}</TableCell>
                      <TableCell>
                        {menu.parentId
                          ? flatMenus.find((m) => m.id === menu.parentId)?.name ?? menu.parentId
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(menu)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(menu.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Permissions</CardTitle>
              <CardDescription>Assign CRUD access per menu for each role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-xs">
                <Label>Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead>Create</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead>Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatMenus.map((menu) => {
                    const record = getAccessForMenu(menu.id)
                    return (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <div className="font-medium">{menu.name}</div>
                          <div className="text-xs text-muted-foreground">{menu.path}</div>
                        </TableCell>
                        {(["canRead", "canCreate", "canUpdate", "canDelete"] as const).map(
                          (flag) => (
                            <TableCell key={flag}>
                              <Checkbox
                                checked={record?.[flag] ?? false}
                                onCheckedChange={(checked) =>
                                  togglePermission(menu.id, flag, checked === true)
                                }
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Menu" : "Create Menu"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="menu-name">Name</Label>
              <Input
                id="menu-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="menu-path">Path</Label>
              <Input
                id="menu-path"
                placeholder="/admin/users"
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="menu-icon">Icon (Lucide name)</Label>
              <Input
                id="menu-icon"
                placeholder="Users"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Parent Menu</Label>
              <Select
                value={form.parentId || "none"}
                onValueChange={(value) =>
                  setForm({ ...form, parentId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentOptions.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMenu} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Child menus and access rules linked to this item will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteMenu(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
