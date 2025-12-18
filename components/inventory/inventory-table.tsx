"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductForm } from "@/components/inventory/product-form"

type Product = {
  id: string
  name: string
  sku: string
  unit_price: number
  cost_price: number
  stock_quantity: number
  min_stock_level: number
  description: string | null
  category_id: string | null
  supplier_id: string | null
  categories?: { name: string }
  suppliers?: { name: string }
}

type Category = { id: string; name: string }
type Supplier = { id: string; name: string }

export function InventoryTable({
  products,
  categories,
  suppliers,
}: {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
}) {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", deleteId)

      if (error) throw error

      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    }
  }

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity === 0) return <Badge variant="destructive">Sin stock</Badge>
    if (quantity <= minLevel) return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Stock bajo</Badge>
    return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Disponible</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar productos por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setShowAddModal(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M5 12h14M12 5v14" />
          </svg>
          Agregar Producto
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay productos en el inventario
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell>{product.categories?.name || "-"}</TableCell>
                  <TableCell>{product.suppliers?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {product.stock_quantity} / {product.min_stock_level}
                  </TableCell>
                  <TableCell className="text-right font-semibold">s/. {product.unit_price.toFixed(2)}</TableCell>
                  <TableCell>{getStockStatus(product.stock_quantity, product.min_stock_level)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditProduct(product)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(product.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para agregar producto */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            suppliers={suppliers}
            onSuccess={() => {
              setShowAddModal(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar producto */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              categories={categories}
              suppliers={suppliers}
              product={editProduct}
              onSuccess={() => {
                setEditProduct(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
