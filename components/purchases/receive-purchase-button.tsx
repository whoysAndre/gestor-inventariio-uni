"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ReceivePurchaseButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReceive = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("purchase_orders")
        .update({
          status: "received",
          received_date: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error al recibir orden:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Marcar como Recibida</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar recepción?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto actualizará el inventario sumando las cantidades de esta orden de compra a los productos
            correspondientes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReceive} disabled={isLoading}>
            {isLoading ? "Procesando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
