"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type PurchaseOrder = {
  id: string
  order_number: string
  total_amount: number
  status: string
  expected_date: string | null
  created_at: string
  supplier?: { id: string, name: string }
  created_by_user?: { id: string, full_name: string }

}

export function PurchaseOrdersTable({ orders }: { orders: PurchaseOrder[] }) {
  const [search, setSearch] = useState("")


  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500">Pendiente</Badge>
      case "received":
        return <Badge className="bg-green-600">Recibida</Badge>
      case "cancelled":
        return <Badge className="bg-red-600">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Función para formatear fecha sin locale
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"

    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por número de orden..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Fecha esperada</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500">
                  No hay órdenes de compra registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.supplier?.name || "-"}</TableCell>
                  <TableCell>{order.created_by_user?.full_name || "-"}</TableCell>
                  <TableCell className="text-right font-semibold">s/. {order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {formatDate(order.expected_date)}
                  </TableCell>
                  <TableCell>
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/purchases/${order.id}`}>Ver detalle</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}