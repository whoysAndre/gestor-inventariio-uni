import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PurchaseOrdersTable } from "@/components/purchases/purchase-orders-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PurchasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Obtener todas las órdenes
  const { data: orders, error: ordersError } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error al obtener órdenes:", ordersError)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">No se pudieron cargar las órdenes de compra</p>
        </div>
      </div>
    )
  }

  // Si no hay órdenes, mostrar mensaje
  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Órdenes de Compra</h1>
            <p className="text-slate-600">Gestiona las compras a proveedores</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/purchases/new">Nueva Orden</Link>
          </Button>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 text-lg">No hay órdenes de compra registradas</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/purchases/new">Crear primera orden</Link>
          </Button>
        </div>
      </div>
    )
  }

  // 2. Extraer IDs únicos
  const supplierIds = Array.from(new Set(orders.map(order => order.supplier_id)))
  const userIds = Array.from(new Set(orders.map(order => order.created_by)))

  // 3. Obtener proveedores (con manejo de array vacío)
  let suppliers: any[] = []
  if (supplierIds.length > 0) {
    const { data: suppliersData, error: suppliersError } = await supabase
      .from("suppliers")
      .select("id, name")
      .in("id", supplierIds)

    if (!suppliersError) {
      suppliers = suppliersData || []
    }
  }

  // 4. Obtener perfiles de usuarios (con manejo de array vacío)
  let profiles: any[] = []
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds)

    if (!profilesError) {
      profiles = profilesData || []
    }
  }

  // 5. Crear mapas para búsqueda rápida
  const supplierMap = new Map(suppliers.map(s => [s.id, s]))
  const profileMap = new Map(profiles.map(p => [p.id, p]))

  // 6. Combinar los datos
  const ordersWithDetails = orders.map(order => ({
    ...order,
    supplier: supplierMap.get(order.supplier_id) || {
      id: order.supplier_id,
      name: "Proveedor no encontrado"
    },
    created_by_user: profileMap.get(order.created_by) || {
      id: order.created_by,
      full_name: "Usuario no encontrado"
    }
  }))

  console.log("Órdenes procesadas:", ordersWithDetails)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de Compra</h1>
          <p className="text-slate-600">Gestiona las compras a proveedores</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchases/new">Nueva Orden</Link>
        </Button>
      </div>

      <PurchaseOrdersTable orders={ordersWithDetails} />
    </div>
  )
}