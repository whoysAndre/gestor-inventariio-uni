import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomerForm } from "@/components/customers/customer-form"

export default async function NewCustomerPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Nuevo Cliente</h1>
        <p className="text-slate-600">Agrega un nuevo cliente</p>
      </div>

      <CustomerForm />
    </div>
  )
}
