export type PricingModel = 'hourly' | 'daily' | 'per_person';
export type PackagePriceType = 'fixed' | 'per_person';
export type PackageCategory = 'food' | 'beverage' | 'staff' | 'equipment' | 'photography' | 'dj';

export interface PricingRule {
    id: string;
    venue_id: string;
    day_of_week: number;
    pricing_model: PricingModel;
    base_price: number;
    minimum_spend: number;
    min_hours: number;
}

export interface Package {
    id: string;
    venue_id: string | null;
    name: string;
    description: string | null;
    price: number;
    price_type: PackagePriceType;
    category: PackageCategory;
}

export interface Venue {
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    slug: string;
    address_street: string;
    address_neighborhood: string;
    address_city: string;
    max_capacity_seated: number;
    max_capacity_standing: number;
    amenities: string[];
    images: string[];
    is_active: boolean;
    pricing_rules?: PricingRule[];
    packages?: Package[];
}

export interface CalculationInput {
    date: Date;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    guestCount: number;
    selectedPackages: Package[];
    pricingRule: PricingRule;
}

export interface CalculationResult {
    rentalFee: number;
    venueConsumption: number;
    venueSubtotal: number;
    minSpendGap: number;
    ocasionExtras: number;
    platformFee: number;
    totalAmount: number;
    breakdown: {
        hoursDuration: number;
        appliedMinSpend: number;
    };
}
