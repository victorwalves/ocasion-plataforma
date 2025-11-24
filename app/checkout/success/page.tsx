import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle className="h-10 w-10" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reserva Confirmada!</h1>
                <p className="text-gray-600 mb-8">
                    Seu pagamento foi processado com sucesso. Você receberá os detalhes por e-mail em breve.
                </p>

                <div className="space-y-3">
                    <Button className="w-full bg-[#9c27c1] hover:bg-[#8a22ab]" asChild>
                        <Link href="/dashboard/client">Ver Minhas Reservas</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">Voltar para Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
