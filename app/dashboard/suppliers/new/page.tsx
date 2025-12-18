import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default async function NewSupplierPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nuevo Proveedor</h1>
        <p className="text-slate-600">Agrega un nuevo proveedor</p>
      </div>

      <SupplierForm />
    </div>
  )
}
