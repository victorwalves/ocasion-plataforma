import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Menu } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-[#9c27c1]">
                    Ocasion
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-[#9c27c1] transition-colors">
                        Buscar Espaços
                    </Link>
                    <Link href="/host" className="text-sm font-medium text-gray-600 hover:text-[#9c27c1] transition-colors">
                        Anunciar Espaço
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" className="text-gray-600">Entrar</Button>
                        <Button className="bg-[#9c27c1] hover:bg-[#8a22ab] text-white">
                            Criar Conta
                        </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
