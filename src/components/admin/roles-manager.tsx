"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { api, ApiClientError } from "@/lib/api-client"
import type { AdminRole } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type RoleForm = {
  name: string
  clerkRoleSlug: string
  description: string
}

const emptyForm: RoleForm = {
  name: "",
  clerkRoleSlug: "",
  description: "",
}

export function RolesManager() {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminRole | null>(null)
  const [form, setForm] = useState<RoleForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRoles(await api.admin.roles.list())
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load roles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(role: AdminRole) {
    setEditing(role)
    setForm({
      name: role.name,
      clerkRoleSlug: role.clerkRoleSlug,
      description: role.description ?? "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        clerkRoleSlug: form.clerkRoleSlug,
        description: form.description || undefined,
      }
      if (editing) {
        await api.admin.roles.update(editing.id, payload)
      } else {
        await api.admin.roles.create(payload)
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save role")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await api.admin.roles.remove(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete role")
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
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage organization roles mapped to Clerk org roles.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles</CardTitle>
          <CardDescription>{roles.length} roles configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Clerk Slug</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Menu Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.clerkRoleSlug}</Badge>
                  </TableCell>
                  <TableCell>{role._count.users}</TableCell>
                  <TableCell>{role._count.menuAccess}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(role.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Clerk Role Slug</Label>
              <Input
                id="slug"
                placeholder="org:doctor"
                value={form.clerkRoleSlug}
                onChange={(e) => setForm({ ...form, clerkRoleSlug: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              Users assigned to this role may lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
