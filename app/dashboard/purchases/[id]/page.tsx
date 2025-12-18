import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReceivePurchaseButton } from "@/components/purchases/receive-purchase-button"

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Obtener orden SIN relaciones primero
  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", id)
    .single();


  if (orderError || !order) {
    console.error("No se encontró la orden:", id);
    notFound();
  }

  // 3. Obtener relaciones por separado
  const [{ data: supplier }, { data: profile }] = await Promise.all([
    supabase
      .from("suppliers")
      .select("name, email, phone")
      .eq("id", order.supplier_id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", order.created_by)
      .single()
  ]);

  // 4. Obtener items
  const { data: items } = await supabase
    .from("purchase_order_items")
    .select("*, products(name, sku)")
    .eq("purchase_order_id", id);

  // 5. Crear objeto combinado
  const orderData = {
    ...order,
    suppliers: supplier || { name: "No encontrado", email: null, phone: null },
    profiles: profile || { full_name: "No encontrado" },
    items: items || []
  };

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detalle de Orden de Compra</h1>
          <p className="text-slate-600">#{orderData.order_number}</p>
        </div>
        <div className="flex gap-2">
          {orderData.status === "pending" && <ReceivePurchaseButton orderId={orderData.id} />}
          <Button asChild variant="outline">
            <Link href="/dashboard/purchases">Volver</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Número de orden</p>
              <p className="font-medium">{orderData.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Fecha de creación</p>
              <p className="font-medium">{new Date(orderData.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Estado</p>
              {getStatusBadge(orderData.status)}
            </div>
            {order.expected_date && (
              <div>
                <p className="text-sm text-slate-600">Fecha esperada</p>
                <p className="font-medium">{new Date(orderData.expected_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.received_date && (
              <div>
                <p className="text-sm text-slate-600">Fecha de recepción</p>
                <p className="font-medium">{new Date(orderData.received_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">s/. {orderData.total_amount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Nombre</p>
              <p className="font-medium">{orderData.suppliers.name}</p>
            </div>
            {orderData.suppliers.email && (
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium">{orderData.suppliers.email}</p>
              </div>
            )}
            {orderData.suppliers.phone && (
              <div>
                <p className="text-sm text-slate-600">Teléfono</p>
                <p className="font-medium">{orderData.suppliers.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">Creado por</p>
              <p className="font-medium">{orderData.profiles?.full_name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Costo Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.products?.name}</TableCell>
                  <TableCell>{item.products?.sku}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">s/. {item.unit_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">s/. {item.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{orderData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
