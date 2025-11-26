"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DeletePackageButton({ packageId }: { packageId: string }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from("packages")
                .delete()
                .eq("id", packageId)

            if (error) throw error

            toast.success("Pacote excluído com sucesso")
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao excluir pacote")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o pacote.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white">
                        {isLoading ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
