import Link from 'next/link';
import Image from 'next/image';
import { Venue } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';

interface VenueCardProps {
    venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
    return (
        <Link href={`/venues/${venue.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={venue.images[0] || '/placeholder-venue.jpg'}
                        alt={venue.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg line-clamp-1">{venue.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                        <MapPin className="h-4 w-4" />
                        {venue.address_neighborhood}, {venue.address_city}
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {venue.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {venue.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                            </Badge>
                        ))}
                        {venue.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{venue.amenities.length - 3}
                            </Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 border-t bg-gray-50/50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Até {venue.max_capacity_standing} pessoas</span>
                    </div>
                    <div className="text-[#9c27c1] font-semibold text-sm">
                        Ver detalhes →
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
