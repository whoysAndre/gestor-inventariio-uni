import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomersTable } from "@/components/customers/customers-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CustomersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: customers } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600">Gestiona tus clientes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">Agregar Cliente</Link>
        </Button>
      </div>

      <CustomersTable customers={customers || []} />
    </div>
  )
}
