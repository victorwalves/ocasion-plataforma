import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClientDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="container mx-auto py-20 px-4">
            <h1 className="text-3xl font-bold mb-6">Minha Conta</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Bem-vindo, {user.email}</h2>
                <p className="text-gray-600">
                    Aqui você poderá ver suas reservas e gerenciar sua conta.
                </p>
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    Em breve: Histórico de reservas e favoritos.
                </div>
            </div>
        </div>
    );
}
