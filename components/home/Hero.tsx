'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Hero() {
    const router = useRouter();
    const [location, setLocation] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (location) params.set('q', location);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="relative bg-[#2a0a36] text-white py-20 md:py-32 overflow-hidden">
            {/* Background Pattern/Image Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Espaços incríveis para <span className="text-[#d68bf2]">eventos corporativos</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-8">
                        De reuniões estratégicas a grandes conferências. Reserve espaços únicos em São Paulo com transparência total de preço.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-2xl">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Bairro ou região (ex: Pinheiros)"
                                className="pl-10 text-gray-900 border-gray-200"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input type="date" className="pl-10 text-gray-900 border-gray-200" />
                        </div>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input type="number" placeholder="Nº Convidados" className="pl-10 text-gray-900 border-gray-200" />
                        </div>
                        <Button type="submit" className="bg-[#9c27c1] hover:bg-[#8a22ab] text-white font-semibold h-10 md:h-auto">
                            Buscar Espaços
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
