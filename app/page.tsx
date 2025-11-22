import { Hero } from '@/components/home/Hero';
import { VenueCard } from '@/components/venues/VenueCard';
import { createClient } from '@/lib/supabase/server';
import { Venue } from '@/types';

export const revalidate = 0; // Ensure fresh data for MVP

export default async function Home() {
  const supabase = await createClient();

  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />

      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Espaços em Destaque</h2>
            <p className="text-gray-600">Curadoria dos melhores locais para seu próximo evento.</p>
          </div>
          <a href="/search" className="text-[#9c27c1] font-semibold hover:underline hidden md:block">
            Ver todos os espaços →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues?.map((venue) => (
            <VenueCard key={venue.id} venue={venue as Venue} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="/search" className="text-[#9c27c1] font-semibold hover:underline">
            Ver todos os espaços →
          </a>
        </div>
      </section>

      <section className="bg-white py-16 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Por que usar a Ocasion?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#9c27c1] font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Preço Transparente</h3>
              <p className="text-gray-600">
                Nossa calculadora inteligente mostra o custo exato em tempo real. Sem surpresas ou orçamentos demorados.
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#9c27c1] font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Reserva Instantânea</h3>
              <p className="text-gray-600">
                Gostou do espaço? Reserve e pague o sinal na hora. Garantia de data sem burocracia.
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#9c27c1] font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Curadoria Premium</h3>
              <p className="text-gray-600">
                Visitamos e verificamos cada espaço para garantir que seu evento corporativo seja um sucesso.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
