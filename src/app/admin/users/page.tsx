/**
 * ============================================
 * 管理员用户管理页面
 * ============================================
 * 功能说明：
 *   - 用户列表展示
 *   - 创建/编辑用户
 *   - 启用/禁用用户
 *   - 删除用户
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, UserPlus, Search, Pencil, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/context/LanguageContext"

interface Role {
  id: string
  name: string
  label: string
}

interface AdminUser {
  id: string
  username: string
  email: string
  role: Role
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface UserFormData {
  username: string
  email: string
  password: string
  roleId: string | null
}

export default function UsersPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState<UserFormData>({ username: "", email: "", password: "", roleId: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [switchLoading, setSwitchLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("pageSize", pagination.pageSize.toString())
      if (searchKeyword) params.append("keyword", searchKeyword)

      const response = await fetch(`/api/admin/users?${params}`)
      const result = await response.json()

      if (result.success) {
        setUsers(result.data.list)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error("获取用户列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchKeyword])

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/roles")
      const result = await response.json()

      if (result.success) {
        setRoles(result.data.map((role: Role & { permissions?: unknown[]; adminCount?: number }) => ({
          id: role.id,
          name: role.name,
          label: role.label,
        })))
      }
    } catch (error) {
      console.error("获取角色列表失败:", error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleOpenCreateDialog = () => {
    setEditingUser(null)
    setFormData({ username: "", email: "", password: "", roleId: roles[0]?.id || "" })
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      roleId: user.role.id,
    })
    setDialogOpen(true)
  }

  const handleOpenDeleteDialog = (user: AdminUser) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || (!editingUser && !formData.password) || !formData.roleId) {
      return
    }

    setFormLoading(true)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users"
      const method = editingUser ? "PATCH" : "POST"
      const body: Record<string, string> = {
        username: formData.username,
        email: formData.email,
        roleId: formData.roleId,
      }
      if (formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (result.success) {
        setDialogOpen(false)
        fetchUsers()
      } else {
        alert(result.error || (isZh ? "操作失败" : "Operation failed"))
      }
    } catch (error) {
      console.error("保存用户失败:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    setSwitchLoading(user.id)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const result = await response.json()

      if (result.success) {
        setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)))
      }
    } catch (error) {
      console.error("更新用户状态失败:", error)
    } finally {
      setSwitchLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    setFormLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        setDeleteDialogOpen(false)
        setDeletingUser(null)
        fetchUsers()
      } else {
        alert(result.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error) {
      console.error("删除用户失败:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US")
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "用户管理" : "User Management"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {isZh ? "共" : "Total"} {pagination.total} {isZh ? "位用户" : "users"}
            </span>
            <Button onClick={handleOpenCreateDialog} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {isZh ? "创建用户" : "Create User"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isZh ? "搜索用户名或邮箱..." : "Search by username or email..."}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "用户列表" : "User List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无数据" : "No data"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isZh ? "用户名" : "Username"}</TableHead>
                    <TableHead>{isZh ? "邮箱" : "Email"}</TableHead>
                    <TableHead>{isZh ? "角色" : "Role"}</TableHead>
                    <TableHead>{isZh ? "状态" : "Status"}</TableHead>
                    <TableHead>{isZh ? "最后登录" : "Last Login"}</TableHead>
                    <TableHead>{isZh ? "创建时间" : "Created At"}</TableHead>
                    <TableHead className="text-right">{isZh ? "操作" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {switchLoading === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleActive(user)}
                            />
                          )}
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? (isZh ? "启用" : "Active") : (isZh ? "禁用" : "Inactive")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(user)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser
                ? (isZh ? "编辑用户" : "Edit User")
                : (isZh ? "创建用户" : "Create User")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">{isZh ? "用户名" : "Username"}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={isZh ? "输入用户名" : "Enter username"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isZh ? "邮箱" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={isZh ? "输入邮箱" : "Enter email"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {isZh ? "密码" : "Password"}
                {editingUser && <span className="text-xs text-muted-foreground ml-1">({isZh ? "留空则不修改" : "Leave empty to keep unchanged"})</span>}
              </Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? (isZh ? "输入新密码" : "Enter new password") : (isZh ? "输入密码" : "Enter password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{isZh ? "角色" : "Role"}</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isZh ? "选择角色" : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isZh ? "保存" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "确认删除" : "Confirm Delete"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {isZh ? "确定要删除用户" : "Are you sure you want to delete user"}
              <span className="font-medium text-foreground"> {deletingUser?.username} </span>
              {isZh ? "吗？此操作无法撤销。" : "? This action cannot be undone."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isZh ? "删除" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
