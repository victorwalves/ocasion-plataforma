"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SeedPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Você precisa estar logado.");
                return;
            }

            // 1. Create Venue
            const slug = `espaco-showcase-${Math.random().toString(36).substring(2, 7)}`;
            const { data: venue, error: venueError } = await supabase
                .from("venues")
                .insert({
                    host_id: user.id,
                    title: "Espaço Showcase Paulista",
                    description: "Um espaço moderno e versátil no coração da Avenida Paulista. Perfeito para eventos corporativos, workshops e coquetéis. Com vista panorâmica e infraestrutura completa.",
                    slug: slug,
                    address_street: "Av. Paulista, 1000",
                    address_neighborhood: "Bela Vista",
                    address_city: "São Paulo",
                    max_capacity_seated: 80,
                    max_capacity_standing: 150,
                    amenities: ["wifi", "ar_condicionado", "projetor", "som", "acessibilidade", "cozinha"],
                    images: [
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
                        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200",
                        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200"
                    ]
                })
                .select()
                .single();

            if (venueError) throw venueError;

            // 2. Create Pricing Rules
            const { error: pricingError } = await supabase
                .from("pricing_rules")
                .insert([
                    {
                        venue_id: venue.id,
                        day_of_week: 1, // Monday
                        pricing_model: "hourly",
                        base_price: 500,
                        minimum_spend: 0,
                        min_hours: 4
                    },
                    {
                        venue_id: venue.id,
                        day_of_week: 5, // Friday
                        pricing_model: "hourly",
                        base_price: 800,
                        minimum_spend: 2000,
                        min_hours: 5
                    }
                ]);

            if (pricingError) throw pricingError;

            // 3. Create Packages
            const { error: packageError } = await supabase
                .from("packages")
                .insert([
                    {
                        venue_id: venue.id,
                        name: "Coffee Break Premium",
                        description: "Café, sucos, pães de queijo, mini sanduíches e frutas.",
                        price: 45,
                        price_type: "per_person",
                        category: "food"
                    },
                    {
                        venue_id: venue.id,
                        name: "Projetor 4K + Telão",
                        description: "Equipamento audiovisual de alta definição.",
                        price: 300,
                        price_type: "fixed",
                        category: "equipment"
                    }
                ]);

            if (packageError) throw packageError;

            toast.success("Dados de exemplo criados!");
            router.push(`/venues/${slug}`);

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao criar dados: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-20 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-8">Gerador de Dados de Teste</h1>
            <Button
                onClick={handleSeed}
                size="lg"
                className="bg-[#9c27c1] hover:bg-[#8a22ab]"
                disabled={isLoading}
            >
                {isLoading ? "Gerando..." : "Gerar Espaço Showcase"}
            </Button>
            <p className="text-muted-foreground mt-4 text-sm">
                Isso criará um espaço completo com preços e pacotes vinculado à sua conta.
            </p>
        </div>
    );
}
