'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Amenity {
    id: string;
    name: string;
    slug: string;
}

interface SearchFiltersProps {
    amenities: Amenity[];
}

export function SearchFilters({ amenities }: SearchFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentAmenities = searchParams.get('amenities')?.split(',') || [];

    const handleAmenityChange = (slug: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        let newAmenities = [...currentAmenities];

        if (checked) {
            newAmenities.push(slug);
        } else {
            newAmenities = newAmenities.filter((a) => a !== slug);
        }

        if (newAmenities.length > 0) {
            params.set('amenities', newAmenities.join(','));
        } else {
            params.delete('amenities');
        }

        router.push(`/search?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('amenities');
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-4">Amenidades</h3>
                <div className="space-y-3">
                    {amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={amenity.slug}
                                checked={currentAmenities.includes(amenity.slug)}
                                onCheckedChange={(checked) => handleAmenityChange(amenity.slug, checked as boolean)}
                            />
                            <Label
                                htmlFor={amenity.slug}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {amenity.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {currentAmenities.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full text-xs"
                >
                    Limpar filtros
                </Button>
            )}
        </div>
    );
}
