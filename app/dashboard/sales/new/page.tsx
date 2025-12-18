import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SaleForm } from "@/components/sales/sale-form"

export default async function NewSalePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase.from("products").select("*").gt("stock_quantity", 0).order("name")

  const { data: customers } = await supabase.from("customers").select("*").order("name")

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Venta</h1>
        <p className="text-slate-600">Registra una nueva venta</p>
      </div>

      <SaleForm products={products || []} customers={customers || []} />
    </div>
  )
}
