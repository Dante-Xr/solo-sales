"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

const products = [
  {
    id: "PROD-001",
    name: "网红同款发光手机壳",
    status: "上架",
    price: "$19.99",
    stock: 250,
    sales: 120,
  },
  {
    id: "PROD-002",
    name: "TikTok爆款便携加湿器",
    status: "上架",
    price: "$29.99",
    stock: 120,
    sales: 85,
  },
  {
    id: "PROD-003",
    name: "蓝牙无线耳机 (运动防汗)",
    status: "下架",
    price: "$49.99",
    stock: 0,
    sales: 430,
  },
]

export default function ProductsPage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("admin.productManagement")}</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t("admin.addProduct")}
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>{t("admin.productName")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.price")}</TableHead>
              <TableHead>{t("admin.stock")}</TableHead>
              <TableHead>{t("admin.sales")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.status === "上架" ? "default" : "secondary"}>
                    {product.status === "上架" ? t("admin.active") : t("admin.inactive")}
                  </Badge>
                </TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">{t("admin.edit")}</Button>
                  <Button variant="destructive" size="sm">{t("admin.delete")}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
