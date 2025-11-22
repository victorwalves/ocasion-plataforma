import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="text-xl font-bold text-[#9c27c1] mb-4 block">
                            Ocasion
                        </Link>
                        <p className="text-sm text-gray-500">
                            A plataforma definitiva para encontrar e reservar espaços corporativos em São Paulo.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Plataforma</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/search">Buscar Espaços</Link></li>
                            <li><Link href="/host">Anunciar</Link></li>
                            <li><Link href="/pricing">Preços</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Suporte</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/help">Central de Ajuda</Link></li>
                            <li><Link href="/terms">Termos de Uso</Link></li>
                            <li><Link href="/privacy">Privacidade</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Contato</h3>
                        <p className="text-sm text-gray-500 mb-2">contato@ocasion.com.br</p>
                        <p className="text-sm text-gray-500">São Paulo, SP</p>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Ocasion Marketplace. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}
