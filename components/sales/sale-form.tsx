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
  unit_price: number
  stock_quantity: number
}

type Customer = {
  id: string
  name: string
}

type SaleItem = {
  product_id: string
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export function SaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [customerId, setCustomerId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<SaleItem[]>([])

  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    if (quantity > product.stock_quantity) {
      setError("La cantidad solicitada excede el stock disponible")
      return
    }

    const existingItem = items.find((item) => item.product_id === product.id)
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unit_price,
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
          unit_price: product.unit_price,
          subtotal: quantity * product.unit_price,
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

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const saleNumber = `V-${Date.now()}`

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            sale_number: saleNumber,
            customer_id: customerId || null,
            total_amount: total,
            payment_method: paymentMethod,
            status: "completed",
            notes: notes || null,
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (saleError) throw saleError

      const saleItems = items.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

      if (itemsError) throw itemsError

      router.push("/dashboard/sales")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la venta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente (opcional)</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Método de pago *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
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
                      {product.name} - ${product.unit_price.toFixed(2)} (Stock: {product.stock_quantity})
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
                    <TableHead className="text-right">Precio</TableHead>
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
                      <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
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
                    <TableCell className="text-right text-xl font-bold">${total.toFixed(2)}</TableCell>
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
          {isLoading ? "Procesando..." : "Completar Venta"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/sales">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
