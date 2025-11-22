'use client';

import { useEffect, useState } from 'react';
import { useBudgetCalculator } from '@/hooks/useBudgetCalculator';
import { Package, PricingRule, Venue } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BudgetCalculatorProps {
    venue: Venue;
    pricingRules: PricingRule[];
    packages: Package[];
}

export function BudgetCalculator({ venue, pricingRules, packages }: BudgetCalculatorProps) {
    const {
        date,
        startTime,
        endTime,
        guestCount,
        selectedPackages,
        pricingRule,
        result,
        setDate,
        setTime,
        setGuestCount,
        togglePackage,
        setPricingRule,
        reset
    } = useBudgetCalculator();

    const [isBooking, setIsBooking] = useState(false);

    // Reset and Initialize
    useEffect(() => {
        reset();
        // Default to today or tomorrow?
        // Let's not set a default date to force user selection
    }, [venue.id, reset]);

    // Update Pricing Rule when Date changes
    useEffect(() => {
        if (date) {
            const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon...
            const rule = pricingRules.find(r => r.day_of_week === dayOfWeek);
            setPricingRule(rule || null);
        } else {
            setPricingRule(null);
        }
    }, [date, pricingRules, setPricingRule]);

    const handleBooking = async () => {
        if (!result || !date) return;

        setIsBooking(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    venueId: venue.id,
                    date: date.toISOString(),
                    startTime,
                    endTime,
                    guestCount,
                    selectedPackages,
                    result
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Erro ao iniciar checkout');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsBooking(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <Card className="w-full shadow-xl border-purple-100 sticky top-24">
            <CardHeader className="bg-purple-50/50 pb-4">
                <CardTitle className="text-xl text-[#9c27c1]">Orçamento em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Date Picker */}
                <div className="space-y-2">
                    <Label>Data do Evento</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Time & Guests */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setTime(e.target.value, endTime)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setTime(startTime, e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Número de Convidados</Label>
                    <Input
                        type="number"
                        min={1}
                        max={venue.max_capacity_standing}
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                    />
                </div>

                <Separator />

                {/* Packages */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500">Serviços Adicionais</h4>
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="flex items-start space-x-3">
                            <Checkbox
                                id={pkg.id}
                                checked={selectedPackages.some(p => p.id === pkg.id)}
                                onCheckedChange={() => togglePackage(pkg)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor={pkg.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {pkg.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    {pkg.price_type === 'per_person'
                                        ? `${formatCurrency(pkg.price)} / pessoa`
                                        : formatCurrency(pkg.price)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Results */}
                {result ? (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Locação do Espaço</span>
                            <span>{formatCurrency(result.rentalFee)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Consumação / Serviços</span>
                            <span>{formatCurrency(result.venueConsumption + result.ocasionExtras)}</span>
                        </div>

                        {result.minSpendGap > 0 && (
                            <div className="flex justify-between text-orange-600 bg-orange-50 p-2 rounded">
                                <span className="flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Complemento Mínimo
                                </span>
                                <span>{formatCurrency(result.minSpendGap)}</span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Taxa de Serviço (10%)</span>
                            <span>{formatCurrency(result.platformFee)}</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total Estimado</span>
                            <span className="font-bold text-2xl text-[#9c27c1]">{formatCurrency(result.totalAmount)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                        Selecione data e horário para ver o preço.
                    </div>
                )}

            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-[#9c27c1] hover:bg-[#8a22ab] text-lg h-12"
                    disabled={!result || isBooking}
                    onClick={handleBooking}
                >
                    {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reservar Agora'}
                </Button>
            </CardFooter>
        </Card>
    );
}
