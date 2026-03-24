/**
 * ============================================
 * 管理员角色管理页面
 * ============================================
 * 功能说明：
 *   - 角色列表展示（表格）
 *   - 显示关联权限数量
 *   - 创建/编辑角色 Dialog
 *   - 角色权限复选框列表（分组展示 PAGE 和 ACTION）
 *   - 删除角色确认 Dialog
 * ============================================
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Shield, Plus, Pencil, Trash2, Check, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

interface Permission {
  id: string
  name: string
  label: string
  type: "PAGE" | "ACTION"
}

interface Role {
  id: string
  name: string
  label: string
  description: string | null
  permissions: { id: string; name: string; label: string }[]
  adminCount: number
}

export default function RolesPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    permissionIds: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const pagePermissions = useMemo(
    () => permissions.filter((p) => p.type === "PAGE"),
    [permissions]
  )
  const actionPermissions = useMemo(
    () => permissions.filter((p) => p.type === "ACTION"),
    [permissions]
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/permissions"),
      ])
      const rolesData = await rolesRes.json()
      const permissionsData = await permissionsRes.json()
      if (rolesData.success) {
        setRoles(rolesData.data)
      }
      if (permissionsData.success) {
        setPermissions(permissionsData.data.list)
      }
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingRole(null)
    setFormData({ name: "", label: "", description: "", permissionIds: [] })
    setDialogOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      label: role.label,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id),
    })
    setDialogOpen(true)
  }

  const handleOpenDelete = (role: Role) => {
    setDeletingRole(role)
    setDeleteDialogOpen(true)
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter((id) => id !== permissionId),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.label) return

    try {
      setSubmitting(true)
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}`
        : "/api/admin/roles"
      const method = editingRole ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        setDialogOpen(false)
        fetchData()
      } else {
        alert(data.error || (isZh ? "操作失败" : "Operation failed"))
      }
    } catch (error) {
      console.error("提交失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRole) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/roles/${deletingRole.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        alert(data.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error) {
      console.error("删除失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderPermissionGroup = (
    title: string,
    permList: Permission[]
  ) => (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {permList.map((permission) => (
          <label
            key={permission.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors"
          >
            <input
              type="checkbox"
              checked={formData.permissionIds.includes(permission.id)}
              onChange={(e) =>
                handlePermissionChange(permission.id, e.target.checked)
              }
              className="w-4 h-4 rounded border-input accent-primary"
            />
            <span className="text-sm">{permission.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "角色管理" : "Role Management"}
            </h1>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {isZh ? "创建角色" : "Create Role"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "角色列表" : "Role List"}</CardTitle>
            <CardDescription>
              {isZh
                ? "管理系统中的角色和权限配置"
                : "Manage system roles and permission configurations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isZh ? "角色名称" : "Role Name"}</TableHead>
                  <TableHead>{isZh ? "标识" : "Identifier"}</TableHead>
                  <TableHead>{isZh ? "描述" : "Description"}</TableHead>
                  <TableHead>{isZh ? "权限数量" : "Permissions"}</TableHead>
                  <TableHead>{isZh ? "管理员数" : "Admins"}</TableHead>
                  <TableHead className="text-right">
                    {isZh ? "操作" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {isZh ? "暂无角色数据" : "No roles found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {role.name}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions.length} {isZh ? "个权限" : "permissions"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.adminCount} {isZh ? "人" : "admins"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(role)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDelete(role)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole
                ? isZh
                  ? "编辑角色"
                  : "Edit Role"
                : isZh
                  ? "创建角色"
                  : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? isZh
                  ? "修改角色的名称、描述和权限"
                  : "Modify role name, description and permissions"
                : isZh
                  ? "创建新角色并配置权限"
                  : "Create a new role and configure permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isZh ? "角色标识" : "Role Identifier"}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={isZh ? "如: admin" : "e.g., admin"}
                  disabled={!!editingRole}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">
                  {isZh ? "角色名称" : "Role Name"}
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder={isZh ? "如: 管理员" : "e.g., Administrator"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {isZh ? "角色描述" : "Description"}
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={
                  isZh ? "可选的角色描述" : "Optional role description"
                }
              />
            </div>

            <div className="space-y-3">
              <Label>{isZh ? "权限配置" : "Permissions"}</Label>
              {pagePermissions.length > 0 &&
                renderPermissionGroup(
                  isZh ? "页面权限 (PAGE)" : "Page Permissions (PAGE)",
                  pagePermissions
                )}
              {actionPermissions.length > 0 &&
                renderPermissionGroup(
                  isZh ? "操作权限 (ACTION)" : "Action Permissions (ACTION)",
                  actionPermissions
                )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.label}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? "保存中..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isZh ? "保存" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isZh ? "确认删除角色" : "Confirm Delete Role"}
            </DialogTitle>
            <DialogDescription>
              {isZh
                ? `确定要删除角色 "${deletingRole?.label}" 吗？此操作无法撤销。`
                : `Are you sure you want to delete the role "${deletingRole?.label}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? "删除中..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isZh ? "删除" : "Delete"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}