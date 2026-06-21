"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { api, ApiClientError } from "@/lib/api-client"
import type { AdminRole, AdminUser } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type UserForm = {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  roleSlug: string
}

const emptyForm: UserForm = {
  email: "",
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  roleSlug: "org:patient",
}

export function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [userData, roleData] = await Promise.all([
        api.admin.users.list(),
        api.admin.roles.list(),
      ])
      setUsers(userData)
      setRoles(roleData)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load users")
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

  function openEdit(user: AdminUser) {
    const [firstName = "", lastName = ""] = (user.name ?? "").split(" ")
    setEditing(user)
    setForm({
      email: user.email,
      username: "",
      password: "",
      firstName,
      lastName,
      roleSlug: user.role.clerkRoleSlug,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await api.admin.users.update(editing.id, {
          email: form.email,
          username: form.username || undefined,
          password: form.password || undefined,
          firstName: form.firstName,
          lastName: form.lastName,
          roleSlug: form.roleSlug,
        })
      } else {
        await api.admin.users.create({
          email: form.email,
          password: form.password,
          username: form.username || undefined,
          firstName: form.firstName,
          lastName: form.lastName,
          roleSlug: form.roleSlug,
        })
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await api.admin.users.remove(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete user")
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
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage platform users synced with Clerk.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>{users.length} registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role.name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {!editing && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </>
            )}
            {editing && (
              <div className="grid gap-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={form.roleSlug}
                onValueChange={(value) => setForm({ ...form, roleSlug: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.clerkRoleSlug}>
                      {role.name}
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the user from Clerk and the database. This action cannot be undone.
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
