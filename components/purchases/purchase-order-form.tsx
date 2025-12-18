"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

type Product = {
  id: string
  name: string
  sku: string
  cost_price: number
}

type Supplier = {
  id: string
  name: string
}

type OrderItem = {
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_cost: number
  subtotal: number
}

export function PurchaseOrderForm({ products, suppliers }: { products: Product[]; suppliers: Supplier[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [supplierId, setSupplierId] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])

  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = items.find((item) => item.product_id === product.id)
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unit_cost,
              }
            : item,
        ),
      )
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          quantity,
          unit_cost: product.cost_price,
          subtotal: quantity * product.cost_price,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
    setError(null)
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product_id !== productId))
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (items.length === 0) {
      setError("Debes agregar al menos un producto")
      setIsLoading(false)
      return
    }

    if (!supplierId) {
      setError("Debes seleccionar un proveedor")
      setIsLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const orderNumber = `OC-${Date.now()}`

      const { data: order, error: orderError } = await supabase
        .from("purchase_orders")
        .insert([
          {
            order_number: orderNumber,
            supplier_id: supplierId,
            total_amount: total,
            status: "pending",
            expected_date: expectedDate || null,
            notes: notes || null,
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        purchase_order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("purchase_order_items").insert(orderItems)

      if (itemsError) throw itemsError

      router.push("/dashboard/purchases")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la orden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_date">Fecha esperada</Label>
              <Input
                id="expected_date"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - s/. {product.cost_price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                min="1"
                placeholder="Cant."
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
              />
            </div>
            <Button type="button" onClick={addItem} disabled={!selectedProduct}>
              Agregar
            </Button>
          </div>

          {items.length > 0 && (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">s/. {item.unit_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">s/. {item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.product_id)}>
                          Quitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right text-xl font-bold">s/. {total.toFixed(2)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || items.length === 0}>
          {isLoading ? "Creando..." : "Crear Orden de Compra"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/purchases">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
