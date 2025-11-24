"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "O título deve ter pelo menos 2 caracteres.",
    }),
    description: z.string().optional(),
    address_street: z.string().min(5, {
        message: "O endereço é obrigatório.",
    }),
    address_neighborhood: z.string().min(2, {
        message: "O bairro é obrigatório.",
    }),
    address_city: z.string().min(2, {
        message: "A cidade é obrigatória.",
    }).default("São Paulo"),
    max_capacity_seated: z.coerce.number().min(1, {
        message: "Capacidade deve ser pelo menos 1.",
    }),
    max_capacity_standing: z.coerce.number().min(1, {
        message: "Capacidade deve ser pelo menos 1.",
    }),
    amenities: z.array(z.string()).default([]),
})

const AMENITIES_OPTIONS = [
    { id: "wifi", label: "Wi-Fi" },
    { id: "ar_condicionado", label: "Ar Condicionado" },
    { id: "projetor", label: "Projetor" },
    { id: "som", label: "Sistema de Som" },
    { id: "cozinha", label: "Cozinha" },
    { id: "estacionamento", label: "Estacionamento" },
    { id: "acessibilidade", label: "Acessibilidade" },
]

export function VenueForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            address_street: "",
            address_neighborhood: "",
            address_city: "São Paulo",
            max_capacity_seated: 0,
            max_capacity_standing: 0,
            amenities: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const supabase = createClient()

            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                toast.error("Você precisa estar logado para cadastrar um espaço.")
                return
            }

            // Generate a simple slug from title
            const slug = values.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 7)

            const { error } = await supabase
                .from("venues")
                .insert({
                    host_id: user.id,
                    title: values.title,
                    description: values.description,
                    slug: slug,
                    address_street: values.address_street,
                    address_neighborhood: values.address_neighborhood,
                    address_city: values.address_city,
                    max_capacity_seated: values.max_capacity_seated,
                    max_capacity_standing: values.max_capacity_standing,
                    amenities: values.amenities,
                })

            if (error) {
                console.error(error)
                toast.error("Erro ao cadastrar espaço: " + error.message)
                return
            }

            toast.success("Espaço cadastrado com sucesso!")
            router.push("/venues/" + slug)
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro inesperado.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Espaço</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Sala de Reunião Paulista" {...field} />
                            </FormControl>
                            <FormDescription>
                                O nome público do seu espaço.
                            </FormDescription>
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
                                    placeholder="Descreva seu espaço, diferenciais, etc."
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
                        name="address_street"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Endereço (Rua e Número)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Rua Augusta, 1000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address_neighborhood"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jardins" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address_city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="max_capacity_seated"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacidade (Sentado)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="max_capacity_standing"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacidade (Em pé)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Comodidades</FormLabel>
                                <FormDescription>
                                    Selecione o que seu espaço oferece.
                                </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {AMENITIES_OPTIONS.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="amenities"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, item.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== item.id
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.label}
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

                <Button type="submit" className="w-full bg-[#9c27c1] hover:bg-[#8a22ab]" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar Espaço"}
                </Button>
            </form>
        </Form>
    )
}
