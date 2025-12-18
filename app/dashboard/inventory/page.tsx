import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { InventoryTable } from "@/components/inventory/inventory-table"

export default async function InventoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), suppliers(name)")
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const { data: suppliers } = await supabase.from("suppliers").select("*").order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Gestiona los productos de tu ferretería</p>
        </div>
      </div>

      <InventoryTable products={products || []} categories={categories || []} suppliers={suppliers || []} />
    </div>
  )
}
