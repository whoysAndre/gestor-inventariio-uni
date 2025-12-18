import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PurchaseOrderForm } from "@/components/purchases/purchase-order-form"

export default async function NewPurchaseOrderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase.from("products").select("*").order("name")

  const { data: suppliers } = await supabase.from("suppliers").select("*").order("name")

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Orden de Compra</h1>
        <p className="text-slate-600">Crea una orden de compra a un proveedor</p>
      </div>

      <PurchaseOrderForm products={products || []} suppliers={suppliers || []} />
    </div>
  )
}
