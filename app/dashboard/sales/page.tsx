import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SalesTable } from "@/components/sales/sales-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SalesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Obtener ventas básicas
  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })

  if (salesError) {
    console.error("Error al obtener ventas:", salesError)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">No se pudieron cargar las ventas</p>
        </div>
      </div>
    )
  }

  // Si no hay ventas
  if (!sales || sales.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
            <p className="text-slate-600">Gestiona las ventas de tu ferretería</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/sales/new">Nueva Venta</Link>
          </Button>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 text-lg">No hay ventas registradas</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/sales/new">Registrar primera venta</Link>
          </Button>
        </div>
      </div>
    )
  }

  // 2. Extraer IDs únicos
  const customerIds = Array.from(new Set(
    sales.map(sale => sale.customer_id).filter(Boolean)
  ))
  const userIds = Array.from(new Set(
    sales.map(sale => sale.created_by).filter(Boolean)
  ))

  // 3. Obtener datos relacionados en paralelo
  let customers: any[] = []
  let profiles: any[] = []

  if (customerIds.length > 0 || userIds.length > 0) {
    const [customersResult, profilesResult] = await Promise.all([
      customerIds.length > 0
        ? supabase
          .from("customers")
          .select("id, name")
          .in("id", customerIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds)
        : Promise.resolve({ data: [] })
    ])

    customers = customersResult.data || []
    profiles = profilesResult.data || []
  }

  // 4. Crear mapas para búsqueda rápida
  const customerMap = new Map(customers.map(c => [c.id, c]))
  const profileMap = new Map(profiles.map(p => [p.id, p]))

  // 5. Combinar datos
  const salesWithDetails = sales.map(sale => ({
    ...sale,
    customers: customerMap.get(sale.customer_id) || {
      id: sale.customer_id,
      name: "Cliente no registrado"
    },
    profiles: profileMap.get(sale.created_by) || {
      id: sale.created_by,
      full_name: "Usuario no encontrado"
    },
    // Formatear fechas en el servidor para evitar problemas de hydration
    formatted_created_at: new Date(sale.created_at).toLocaleDateString('es-ES')
  }))

  console.log("Ventas procesadas:", salesWithDetails.length)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-600">Gestiona las ventas de tu ferretería</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sales/new">Nueva Venta</Link>
        </Button>
      </div>

      <SalesTable sales={salesWithDetails} />
    </div>
  )
}