/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：用 AdminUser/Role 分页类型替代用户管理页 any，并清理未使用回调。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 管理员用户管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 用户列表展示
 *   - 创建/编辑用户
 *   - 启用/禁用用户
 *   - 删除用户
 *   - 使用 Refine useList hook
 * ============================================
 * 2026-04-13: 集成 Refine useList hook
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useList } from "@refinedev/core"
import { Users, UserPlus, Search, Pencil, Trash2, RefreshCw, KeyRound } from "lucide-react"
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
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"

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

interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface ListPayload<T> {
  list?: T[]
  pagination?: PaginationState
}

export default function UsersPage() {
  const t = useTranslations('admin')
  const commonT = useTranslations('common')
  const locale = useLocale()
  const isZh = locale === "zh"

  const [searchKeyword, setSearchKeyword] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

  const { query: { data: usersData, isLoading: loading, refetch: refetchUsers } } = useList({
    resource: "users",
    pagination: {
      currentPage: pagination.page,
      pageSize: pagination.pageSize,
    },
    filters: [
      ...(searchKeyword ? [{ field: "keyword", operator: "eq" as const, value: searchKeyword }] : []),
    ],
  })

  const { query: { data: rolesData } } = useList({
    resource: "roles",
    pagination: {
      currentPage: 1,
      pageSize: 100,
    },
  })

  const users = useMemo<AdminUser[]>(() => {
    const raw = usersData?.data as ListPayload<AdminUser> | undefined
    // 后台用户接口返回分页对象，统一从 list 字段收窄为 AdminUser[]。
    return raw?.list || []
  }, [usersData])

  const roles = useMemo<Role[]>(() => {
    const raw = rolesData?.data as Role[] | ListPayload<Role> | undefined
    const list = Array.isArray(raw) ? raw : (raw?.list || [])
    return list.map((role) => ({
      id: role.id,
      name: role.name,
      label: role.label,
    }))
  }, [rolesData])

  useEffect(() => {
    if (usersData?.total !== undefined) {
      const raw = usersData?.data as ListPayload<AdminUser> | undefined
      if (raw?.pagination) {
        setPagination(raw.pagination)
      }
    }
  }, [usersData])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState<UserFormData>({ username: "", email: "", password: "", roleId: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [switchLoading, setSwitchLoading] = useState<string | null>(null)
  const [activationOperationId, setActivationOperationId] = useState<string | null>(null)
  const [activationOtp, setActivationOtp] = useState("")
  const [delegatedResetUser, setDelegatedResetUser] = useState<AdminUser | null>(null)
  const [delegatedResetOperationId, setDelegatedResetOperationId] = useState<string | null>(null)
  const [delegatedResetOtp, setDelegatedResetOtp] = useState("")

  const handleOpenCreateDialog = () => {
    setEditingUser(null)
    setFormData({ username: "", email: "", password: "", roleId: roles[0]?.id || "" })
    setActivationOperationId(null)
    setActivationOtp("")
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

  const handleOpenDelegatedReset = async (user: AdminUser) => {
    setDelegatedResetUser(user)
    setDelegatedResetOperationId(null)
    setDelegatedResetOtp("")
    setFormLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/delegated-reset/request`, { method: "POST" })
      const result = await response.json()
      if (!response.ok || !result.operationId) throw new Error("request failed")
      setDelegatedResetOperationId(result.operationId)
    } catch {
      setDelegatedResetUser(null)
      toast.error(isZh ? "无法发起委派重置" : "Unable to start delegated reset")
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelegatedReset = async () => {
    if (!delegatedResetUser || !delegatedResetOperationId || delegatedResetOtp.length !== 6) return
    setFormLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${delegatedResetUser.id}/delegated-reset/confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operationId: delegatedResetOperationId, otp: delegatedResetOtp }) })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error("confirm failed")
      setDelegatedResetUser(null)
      toast.success(isZh ? "已向该管理员发送密码重置验证码" : "Password reset code sent to the administrator")
    } catch {
      toast.error(isZh ? "验证码无效或已过期" : "Invalid or expired verification code")
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || (!editingUser && !formData.password) || !formData.roleId) {
      return
    }

    setFormLoading(true)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users/activation/request"
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

      if (!editingUser && response.ok && result.operationId) {
        setActivationOperationId(result.operationId)
        toast.success(isZh ? "确认验证码已发送到您的邮箱" : "Confirmation code sent to your email")
      } else if (result.success) {
        setDialogOpen(false)
        refetchUsers()
      } else {
        toast.error(result.error || (isZh ? "操作失败" : "Operation failed"))
      }
    } catch (error: unknown) {
      console.error("保存用户失败:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmActivation = async () => {
    if (!activationOperationId || activationOtp.length !== 6) return
    setFormLoading(true)
    try {
      const response = await fetch("/api/admin/users/activation/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operationId: activationOperationId, otp: activationOtp }) })
      const result = await response.json()
      if (result.success) { setDialogOpen(false); setActivationOperationId(null); setActivationOtp(""); refetchUsers(); toast.success(isZh ? "管理员已创建" : "Administrator created") }
      else toast.error(result.error || (isZh ? "验证码无效或已过期" : "Invalid or expired verification code"))
    } finally { setFormLoading(false) }
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
        refetchUsers()
      }
    } catch (error: unknown) {
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
        refetchUsers()
      } else {
        toast.error(result.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error: unknown) {
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
              {t("userManagement")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {isZh ? "共" : "Total"} {pagination.total} {isZh ? "位用户" : "users"}
            </span>
            <Button onClick={handleOpenCreateDialog} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t("createUser")}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("searchUserPlaceholder")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("userList")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("loading")}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("lastLogin")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{commonT("actions")}</TableHead>
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
                            {user.isActive ? t("active") : t("inactive")}
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
                            title={isZh ? "编辑管理员" : "Edit administrator"}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {user.role.name !== "super_admin" && user.isActive ? <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelegatedReset(user)}
                            title={isZh ? "委派密码重置" : "Delegated password reset"}
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button> : null}
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
                ? t("editUser")
                : t("createUser")}
            </DialogTitle>
          </DialogHeader>
          {activationOperationId ? <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{isZh ? "请输入发送到当前超级管理员邮箱的 6 位确认验证码。" : "Enter the six-digit confirmation code sent to the current super administrator email."}</p>
            <div className="space-y-2"><Label htmlFor="activation-otp">{isZh ? "确认验证码" : "Confirmation code"}</Label><Input id="activation-otp" inputMode="numeric" maxLength={6} value={activationOtp} onChange={(event) => setActivationOtp(event.target.value.replace(/\D/g, ""))} /></div>
          </div> : <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t("enterUsername")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("enterEmail")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("password")}
                {editingUser && <span className="text-xs text-muted-foreground ml-1">({isZh ? "留空则不修改" : "Leave empty to keep unchanged"})</span>}
              </Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? t("enterNewPassword") : t("enterPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectRole")} />
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
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {commonT("cancel")}
            </Button>
            <Button onClick={activationOperationId ? handleConfirmActivation : handleSubmit} disabled={formLoading || Boolean(activationOperationId && activationOtp.length !== 6)}>
              {formLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {activationOperationId ? (isZh ? "确认并创建" : "Confirm and create") : commonT("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(delegatedResetUser)} onOpenChange={(open) => { if (!open) setDelegatedResetUser(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "委派密码重置" : "Delegated password reset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{isZh ? `确认后将向 ${delegatedResetUser?.username ?? ""} 的邮箱发送密码重置验证码。请输入发送到当前超级管理员邮箱的 6 位确认验证码。` : `Confirm the six-digit code sent to the current super administrator before sending a reset code to ${delegatedResetUser?.username ?? ""}.`}</p>
            <div className="space-y-2"><Label htmlFor="delegated-reset-otp">{isZh ? "确认验证码" : "Confirmation code"}</Label><Input id="delegated-reset-otp" inputMode="numeric" maxLength={6} value={delegatedResetOtp} onChange={(event) => setDelegatedResetOtp(event.target.value.replace(/\D/g, ""))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegatedResetUser(null)}>{commonT("cancel")}</Button>
            <Button onClick={handleConfirmDelegatedReset} disabled={formLoading || !delegatedResetOperationId || delegatedResetOtp.length !== 6}>
              {formLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isZh ? "确认并发送" : "Confirm and send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
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
              {commonT("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {commonT("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
