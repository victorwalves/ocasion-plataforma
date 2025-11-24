import { VenueCard } from '@/components/venues/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/server';
import { Venue } from '@/types';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const revalidate = 0;

interface SearchPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const query = typeof params.q === 'string' ? params.q : '';
    const amenitiesParam = typeof params.amenities === 'string' ? params.amenities.split(',') : [];

    const supabase = await createClient();

    // Fetch amenities for filters
    const { data: amenities } = await supabase
        .from('amenities')
        .select('*')
        .order('name');

    // Build venues query
    let dbQuery = supabase
        .from('venues')
        .select('*')
        .eq('is_active', true);

    if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,address_neighborhood.ilike.%${query}%,address_city.ilike.%${query}%`);
    }

    if (amenitiesParam.length > 0) {
        // Filter venues that have ALL selected amenities
        // The amenities column is a JSONB array of strings
        dbQuery = dbQuery.contains('amenities', amenitiesParam);
    }

    const { data: venues } = await dbQuery;

    async function searchAction(formData: FormData) {
        'use server';
        const q = formData.get('q');
        redirect(`/search?q=${q}`);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <form action={searchAction} className="flex gap-2 max-w-2xl">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                name="q"
                                defaultValue={query}
                                placeholder="Buscar por bairro, cidade ou nome..."
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" className="bg-[#9c27c1] hover:bg-[#8a22ab] text-white">
                            Buscar
                        </Button>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-36">
                            <SearchFilters amenities={amenities || []} />
                        </div>
                    </div>

                    {/* Filters - Mobile */}
                    <div className="lg:hidden mb-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filtrar Resultados
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <div className="py-6">
                                    <SearchFilters amenities={amenities || []} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Venue Grid */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-6">
                            {query ? `Resultados para "${query}"` : 'Todos os espaços'}
                            <span className="text-gray-500 font-normal text-base ml-2">
                                ({venues?.length || 0} encontrados)
                            </span>
                        </h1>

                        {venues && venues.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {venues.map((venue) => (
                                    <VenueCard key={venue.id} venue={venue as Venue} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                                <p className="text-gray-500 text-lg">Nenhum espaço encontrado com esses critérios.</p>
                                {(query || amenitiesParam.length > 0) && (
                                    <Button variant="link" className="text-[#9c27c1] mt-2" asChild>
                                        <a href="/search">Limpar busca e filtros</a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
