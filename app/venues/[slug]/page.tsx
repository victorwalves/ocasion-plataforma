import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Check } from 'lucide-react';
import { BudgetCalculator } from '@/components/calculator/BudgetCalculator';
import { Package, PricingRule, Venue } from '@/types';

export const revalidate = 0;

interface VenuePageProps {
    params: { slug: string };
}

export default async function VenuePage({ params }: VenuePageProps) {
    const supabase = await createClient();

    // Fetch Venue
    const { data: venue } = await supabase
        .from('venues')
        .select('*')
        .eq('slug', params.slug)
        .single();

    if (!venue) return notFound();

    // Fetch Pricing Rules
    const { data: pricingRules } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('venue_id', venue.id);

    // Fetch Packages (Venue specific + Global)
    const { data: packages } = await supabase
        .from('packages')
        .select('*')
        .or(`venue_id.eq.${venue.id},venue_id.is.null`);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Image */}
            <div className="relative h-[50vh] w-full">
                <Image
                    src={venue.images[0] || '/placeholder-venue.jpg'}
                    alt={venue.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 text-white">
                    <Badge className="mb-4 bg-[#9c27c1] hover:bg-[#8a22ab]">Espaço Verificado</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{venue.title}</h1>
                    <div className="flex items-center gap-2 text-lg opacity-90">
                        <MapPin className="h-5 w-5" />
                        {venue.address_neighborhood}, {venue.address_city}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sobre o Espaço</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {venue.description}
                            </p>
                        </section>

                        <Separator />

                        {/* Amenities */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Comodidades</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {venue.amenities.map((amenity: string) => (
                                    <div key={amenity} className="flex items-center gap-2 text-gray-600">
                                        <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-[#9c27c1]">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <Separator />

                        {/* Capacity */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Capacidade</h2>
                            <div className="flex gap-8">
                                <div className="bg-white p-6 rounded-xl border shadow-sm flex-1 text-center">
                                    <div className="text-3xl font-bold text-[#9c27c1] mb-1">{venue.max_capacity_seated}</div>
                                    <div className="text-gray-500">Sentados</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border shadow-sm flex-1 text-center">
                                    <div className="text-3xl font-bold text-[#9c27c1] mb-1">{venue.max_capacity_standing}</div>
                                    <div className="text-gray-500">Em pé</div>
                                </div>
                            </div>
                        </section>

                        {/* Location (Placeholder Map) */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Localização</h2>
                            <p className="text-gray-600 mb-4">{venue.address_street} - {venue.address_neighborhood}</p>
                            <div className="bg-gray-200 h-64 rounded-xl flex items-center justify-center text-gray-500">
                                Mapa Indisponível no MVP
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Calculator */}
                    <div className="lg:col-span-1">
                        <BudgetCalculator
                            venue={venue as Venue}
                            pricingRules={pricingRules as PricingRule[]}
                            packages={packages as Package[]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
