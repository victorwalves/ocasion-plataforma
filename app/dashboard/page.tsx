import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    // Fetch profile to check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return <div>Profile not found</div>;
    }

    if (profile.role === 'client') {
        return redirect("/dashboard/client");
    }

    // If host or admin, fetch venues
    const { data: venues } = await supabase
        .from("venues")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Meus Espaços</h1>
                <Link
                    href="/venues/new"
                    className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                    Criar Novo Espaço
                </Link>
            </div>

            {venues && venues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <Link key={venue.id} href={`/dashboard/${venue.id}`}>
                            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white h-full flex flex-col">
                                <div className="relative h-48 w-full bg-gray-100">
                                    {venue.images && venue.images[0] ? (
                                        <Image
                                            src={venue.images[0]}
                                            alt={venue.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            Sem imagem
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h2 className="text-xl font-semibold mb-2">{venue.title}</h2>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                        {venue.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-auto pt-4 border-t">
                                        <span className={`px-2 py-1 rounded-full text-xs ${venue.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {venue.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {venue.address_city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <h2 className="text-xl font-semibold mb-2">Você ainda não tem espaços cadastrados</h2>
                    <p className="text-gray-500 mb-6">Comece cadastrando seu primeiro espaço para receber reservas.</p>
                    <Link
                        href="/venues/new"
                        className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition-colors"
                    >
                        Cadastrar Espaço
                    </Link>
                </div>
            )}
        </div>
    );
}
