// components/sales/sales-table.tsx
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Sale = {
  id: string
  sale_number: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  customers?: { name: string }
  profiles?: { full_name: string }
  formatted_created_at?: string  // Agregar esto
}

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("")

  const filteredSales = sales.filter((sale) =>
    sale.sale_number.toLowerCase().includes(search.toLowerCase()) ||
    sale.customers?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completada</Badge>
      case "cancelled":
        return <Badge className="bg-red-600">Cancelada</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "Efectivo"
      case "card":
        return "Tarjeta"
      case "transfer":
        return "Transferencia"
      default:
        return method
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por número o cliente..."
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
              <TableHead>Cliente</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Método de pago</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500">
                  No hay ventas que coincidan con la búsqueda
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.sale_number}</TableCell>
                  <TableCell>{sale.customers?.name || "-"}</TableCell>
                  <TableCell>{sale.profiles?.full_name || "-"}</TableCell>
                  <TableCell className="text-right font-semibold">s/. {sale.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getPaymentMethodText(sale.payment_method)}</TableCell>
                  <TableCell>
                    {sale.formatted_created_at || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/sales/${sale.id}`}>Ver detalle</Link>
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