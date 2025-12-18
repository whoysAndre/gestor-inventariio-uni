import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SaleDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log("🟢 Cargando venta ID:", id)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    // 1. Obtener venta básica
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", id)
      .single()

    console.log("🟡 Venta básica:", sale)
    console.log("🟡 Error venta:", saleError)

    if (saleError || !sale) {
      console.error("❌ Error al obtener venta:", saleError)
      notFound()
    }

    // 2. Obtener datos relacionados en paralelo
    const [
      { data: customer },
      { data: profile },
      { data: items }
    ] = await Promise.all([
      // Cliente (puede ser null si no hay customer_id)
      sale.customer_id
        ? supabase
          .from("customers")
          .select("name, email, phone")
          .eq("id", sale.customer_id)
          .single()
        : Promise.resolve({ data: null }),

      // Perfil del vendedor
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sale.created_by)
        .single(),


      // Items de la venta
      supabase
        .from("sale_items")
        .select("*, products(name, sku)")
        .eq("sale_id", id)
    ])

    console.log("🟢 Datos relacionados:", {
      customer: !!customer,
      profile: !!profile,
      itemsCount: items?.length
    })

    // 3. Formatear fechas de forma segura
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('es-ES')
      } catch {
        return "Fecha inválida"
      }
    }

    // 4. Determinar texto del método de pago
    const getPaymentMethodText = (method: string) => {
      switch (method) {
        case "cash": return "Efectivo"
        case "card": return "Tarjeta"
        case "transfer": return "Transferencia"
        default: return method
      }
    }

    // 5. Renderizar
    return (
      <div className="space-y-6 max-w-4xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detalle de Venta</h1>
            <p className="text-slate-600">#{sale.sale_number}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/sales">Volver</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información de la Venta */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Número de venta</p>
                <p className="font-medium">{sale.sale_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Fecha</p>
                <p className="font-medium">{formatDate(sale.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Estado</p>
                <Badge className={sale.status === "completed" ? "bg-green-600" : "bg-red-600"}>
                  {sale.status === "completed" ? "Completada" : "Cancelada"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600">Método de pago</p>
                <p className="font-medium capitalize">
                  {getPaymentMethodText(sale.payment_method)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  s/. {sale.total_amount.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer ? (
                <>
                  <div>
                    <p className="text-sm text-slate-600">Nombre</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <p className="text-sm text-slate-600">Teléfono</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500">Venta sin cliente registrado</p>
              )}

              <div>
                <p className="text-sm text-slate-600">Vendedor</p>
                <p className="font-medium">{profile?.full_name || "No encontrado"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {items && items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.products?.name || "Producto no encontrado"}
                      </TableCell>
                      <TableCell>{item.products?.sku || "-"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        s/. {item.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        s/. {item.subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-slate-500 text-center py-4">
                No hay productos en esta venta
              </p>
            )}
          </CardContent>
        </Card>

        {sale.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{sale.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    console.error("❌ Error crítico en SaleDetailPage:", error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">No se pudo cargar el detalle de la venta</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/sales">Volver a ventas</Link>
          </Button>
        </div>
      </div>
    )
  }
}