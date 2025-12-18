import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SuppliersTable } from "@/components/suppliers/suppliers-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuppliersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: suppliers } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-600">Gestiona tus proveedores</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/suppliers/new">Agregar Proveedor</Link>
        </Button>
      </div>

      <SuppliersTable suppliers={suppliers || []} />
    </div>
  )
}
