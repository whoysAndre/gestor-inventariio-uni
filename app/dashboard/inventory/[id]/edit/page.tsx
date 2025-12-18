import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ProductForm } from "@/components/inventory/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const { data: suppliers } = await supabase.from("suppliers").select("*").order("name")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Producto</h1>
        <p className="text-slate-600">Modifica los datos del producto</p>
      </div>

      <ProductForm categories={categories || []} suppliers={suppliers || []} product={product} />
    </div>
  )
}
