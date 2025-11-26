"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Package } from "@/types"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    description: z.string().optional(),
    price: z.coerce.number().min(0, {
        message: "O preço deve ser maior ou igual a 0.",
    }),
    price_type: z.enum(["fixed", "per_person"]),
    category: z.enum(["food", "beverage", "staff", "equipment", "photography", "dj"]),
    subPackageIds: z.array(z.string()).default([]),
})

interface PackageFormProps {
    venueId?: string | null
    initialData?: Package | null
    onSuccess?: () => void
}

export function PackageForm({ venueId, initialData, onSuccess }: PackageFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [availablePackages, setAvailablePackages] = useState<any[]>([])

    useEffect(() => {
        async function fetchPackages() {
            const supabase = createClient()
            let query = supabase.from("packages").select("*")

            if (venueId) {
                // If venueId is present, fetch venue packages + global packages
                query = query.or(`venue_id.eq.${venueId},venue_id.is.null`)
            } else {
                // Global packages can only include other global packages
                query = query.is("venue_id", null)
            }

            // Exclude self if editing
            if (initialData?.id) {
                query = query.neq("id", initialData.id)
            }

            const { data } = await query

            if (data) {
                setAvailablePackages(data)
            }
        }
        fetchPackages()
    }, [venueId, initialData?.id])

    // Fetch existing sub-packages if editing
    useEffect(() => {
        async function fetchSubPackages() {
            if (!initialData?.id) return

            const supabase = createClient()
            const { data } = await supabase
                .from("package_items")
                .select("child_package_id")
                .eq("parent_package_id", initialData.id)

            if (data) {
                const ids = data.map(item => item.child_package_id)
                form.setValue("subPackageIds", ids)
            }
        }
        fetchSubPackages()
    }, [initialData?.id])


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            price_type: (initialData?.price_type as "fixed" | "per_person") || "fixed",
            category: (initialData?.category as any) || "food",
            subPackageIds: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const supabase = createClient()

            let packageId = initialData?.id

            if (initialData) {
                // UPDATE
                const { error } = await supabase
                    .from("packages")
                    .update({
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        price_type: values.price_type,
                        category: values.category,
                    })
                    .eq("id", initialData.id)

                if (error) throw error
            } else {
                // INSERT
                const { data: newPackage, error } = await supabase
                    .from("packages")
                    .insert({
                        venue_id: venueId || null, // Handle global packages
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        price_type: values.price_type,
                        category: values.category,
                    })
                    .select()
                    .single()

                if (error) throw error
                packageId = newPackage.id
            }

            // Handle Sub-packages (Delete all and re-insert for simplicity)
            if (packageId) {
                // 1. Delete existing items
                const { error: deleteError } = await supabase
                    .from("package_items")
                    .delete()
                    .eq("parent_package_id", packageId)

                if (deleteError) throw deleteError

                // 2. Insert new items
                if (values.subPackageIds && values.subPackageIds.length > 0) {
                    const items = values.subPackageIds.map(childId => ({
                        parent_package_id: packageId,
                        child_package_id: childId,
                    }))

                    const { error: itemsError } = await supabase
                        .from("package_items")
                        .insert(items)

                    if (itemsError) throw itemsError
                }
            }

            toast.success(initialData ? "Pacote atualizado!" : "Pacote criado!")
            if (!initialData) form.reset()

            if (onSuccess) {
                onSuccess()
            }
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar pacote.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Pacote</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Buffet Completo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descreva o que está incluso..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Preço</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="fixed">Preço Fixo (Total)</SelectItem>
                                        <SelectItem value="per_person">Por Pessoa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="food">Alimentação</SelectItem>
                                    <SelectItem value="beverage">Bebidas</SelectItem>
                                    <SelectItem value="staff">Equipe</SelectItem>
                                    <SelectItem value="equipment">Equipamento</SelectItem>
                                    <SelectItem value="photography">Fotografia</SelectItem>
                                    <SelectItem value="dj">DJ / Música</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {availablePackages.length > 0 && (
                    <FormField
                        control={form.control}
                        name="subPackageIds"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Incluir outros pacotes</FormLabel>
                                    <FormDescription>
                                        Selecione pacotes para incluir neste (ex: criar um combo).
                                    </FormDescription>
                                </div>
                                <div className="grid grid-cols-1 gap-2 border p-4 rounded-md max-h-40 overflow-y-auto">
                                    {availablePackages.map((pkg) => (
                                        <FormField
                                            key={pkg.id}
                                            control={form.control}
                                            name="subPackageIds"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={pkg.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(pkg.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, pkg.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== pkg.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {pkg.name} - R$ {pkg.price} ({pkg.price_type === 'per_person' ? '/pessoa' : 'fixo'})
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full bg-[#9c27c1] hover:bg-[#8a22ab]" disabled={isLoading}>
                    {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Pacote")}
                </Button>
            </form>
        </Form>
    )
}
