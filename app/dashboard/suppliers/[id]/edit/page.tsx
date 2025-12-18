import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: supplier } = await supabase.from("suppliers").select("*").eq("id", id).single()

  if (!supplier) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Proveedor</h1>
        <p className="text-slate-600">Modifica los datos del proveedor</p>
      </div>

      <SupplierForm supplier={supplier} />
    </div>
  )
}
