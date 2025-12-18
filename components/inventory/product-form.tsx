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

type Category = { id: string; name: string }
type Supplier = { id: string; name: string }
type Product = {
  id: string
  name: string
  description: string | null
  sku: string
  category_id: string | null
  supplier_id: string | null
  unit_price: number
  cost_price: number
  stock_quantity: number
  min_stock_level: number
}

export function ProductForm({
  categories,
  suppliers,
  product,
  onSuccess,
}: {
  categories: Category[]
  suppliers: Supplier[]
  product?: Product
  onSuccess?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    category_id: product?.category_id || "",
    supplier_id: product?.supplier_id || "",
    unit_price: product?.unit_price || 0,
    cost_price: product?.cost_price || 0,
    stock_quantity: product?.stock_quantity || 0,
    min_stock_level: product?.min_stock_level || 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const dataToSubmit = {
        ...formData,
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
        created_by: user.id,
      }

      if (product) {
        const { error } = await supabase.from("products").update(dataToSubmit).eq("id", product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert([dataToSubmit])
        if (error) throw error
      }

      router.refresh()
      onSuccess?.()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            required
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor</Label>
          <Select
            value={formData.supplier_id}
            onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
          >
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
          <Label htmlFor="cost_price">Precio de costo *</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: Number.parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Precio de venta *</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: Number.parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Cantidad en stock *</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            required
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">Nivel mínimo de stock *</Label>
          <Input
            id="min_stock_level"
            type="number"
            min="0"
            required
            value={formData.min_stock_level}
            onChange={(e) => setFormData({ ...formData, min_stock_level: Number.parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-3 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
        </Button>
      </div>
    </form>
  )
}
