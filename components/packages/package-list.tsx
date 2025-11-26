"use client"

import { Package } from "@/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PackageListProps {
    packages: Package[]
    venueId: string
}

export function PackageList({ packages, venueId }: PackageListProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (packageId: string) => {
        try {
            const { error } = await supabase
                .from("packages")
                .delete()
                .eq("id", packageId)

            if (error) throw error

            toast.success("Pacote removido com sucesso")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao remover pacote")
        }
    }

    if (packages.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                Nenhum pacote cadastrado para este espaço.
            </div>
        )
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const getCategoryLabel = (cat: string) => {
        const map: Record<string, string> = {
            food: "Alimentação",
            beverage: "Bebidas",
            staff: "Equipe",
            equipment: "Equipamento",
            photography: "Fotografia",
            dj: "DJ / Música"
        }
        return map[cat] || cat
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
                <Card key={pkg.id} className="relative group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {getCategoryLabel(pkg.category)}
                            </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                            {pkg.description || "Sem descrição"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mt-2">
                            <div className="font-semibold text-[#9c27c1]">
                                {formatCurrency(pkg.price)}
                                <span className="text-sm text-gray-500 font-normal ml-1">
                                    {pkg.price_type === 'per_person' ? '/ pessoa' : ' fixo'}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(pkg.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
