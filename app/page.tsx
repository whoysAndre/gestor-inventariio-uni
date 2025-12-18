import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">FerreSoft Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16 text-center">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 md:text-6xl">
              Gestiona tu Ferretería de Forma Profesional
            </h1>
            <p className="text-lg text-slate-600 md:text-xl">
              Sistema completo para gestionar inventario, ventas, compras y proveedores de tu ferretería de manera
              eficiente y organizada.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/sign-up">Comenzar Ahora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
          </div>

          <div className="grid gap-6 pt-12 md:grid-cols-3">
            <div className="space-y-2 rounded-lg border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Gestión de Inventario</h3>
              <p className="text-sm text-slate-600">Controla tu stock, alertas de productos bajos y categorización.</p>
            </div>

            <div className="space-y-2 rounded-lg border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Registro de Ventas</h3>
              <p className="text-sm text-slate-600">Registra ventas, clientes y genera reportes de ingresos.</p>
            </div>

            <div className="space-y-2 rounded-lg border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                  <path d="M16 3h5v5M21 3l-7 7M8 3H3v5M3 3l7 7M3 21v-5M3 21l7-7M21 21v-5M21 21l-7-7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Gestión de Compras</h3>
              <p className="text-sm text-slate-600">
                Administra proveedores, órdenes de compra y recepción de mercancía.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-600 lg:px-8">
          <p>Sistema de Gestión para Ferretería - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  )
}
