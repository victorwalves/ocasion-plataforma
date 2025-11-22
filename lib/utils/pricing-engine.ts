import { CalculationInput, CalculationResult } from '@/types';
import { differenceInMinutes, parse } from 'date-fns';

export function calculateBudget(input: CalculationInput): CalculationResult {
    const { startTime, endTime, guestCount, selectedPackages, pricingRule } = input;

    // 1. Calculate Duration
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());
    let durationInMinutes = differenceInMinutes(end, start);
    if (durationInMinutes < 0) durationInMinutes += 24 * 60; // Handle overnight (simple version)
    const durationInHours = durationInMinutes / 60;

    // 2. Rental Fee (Passo A)
    let rentalFee = 0;
    if (pricingRule.pricing_model === 'hourly') {
        rentalFee = durationInHours * pricingRule.base_price;
    } else if (pricingRule.pricing_model === 'daily') {
        rentalFee = pricingRule.base_price;
    } else if (pricingRule.pricing_model === 'per_person') {
        rentalFee = guestCount * pricingRule.base_price;
    }

    // 3. Venue Consumption (Passo B)
    // Packages where venue_id is NOT null (or logically belonging to venue)
    // Note: In our schema, venue-specific packages have venue_id, global have null.
    // However, the prompt implies "Consumação do Espaço" vs "Extras Ocasion".
    // We assume venue_id != null are venue packages.
    const venuePackages = selectedPackages.filter(p => p.venue_id !== null);
    const venueConsumption = venuePackages.reduce((total, pkg) => {
        const cost = pkg.price_type === 'per_person' ? pkg.price * guestCount : pkg.price;
        return total + cost;
    }, 0);

    // 4. Minimum Spend Gap (Passo C)
    const currentVenueTotal = rentalFee + venueConsumption;
    const minSpend = pricingRule.minimum_spend || 0;
    let minSpendGap = 0;
    let venueSubtotal = currentVenueTotal;

    if (currentVenueTotal < minSpend) {
        minSpendGap = minSpend - currentVenueTotal;
        venueSubtotal = minSpend;
    }

    // 5. Ocasion Extras (Passo D)
    const ocasionPackages = selectedPackages.filter(p => p.venue_id === null);
    const ocasionExtras = ocasionPackages.reduce((total, pkg) => {
        const cost = pkg.price_type === 'per_person' ? pkg.price * guestCount : pkg.price;
        return total + cost;
    }, 0);

    // 6. Fees & Total (Passo E)
    // Platform fee is 10% of everything? Or just venue?
    // PRD says: (VENUE_SUBTOTAL + OCASION_EXTRAS) * 0.10
    const platformFee = (venueSubtotal + ocasionExtras) * 0.10;
    const totalAmount = venueSubtotal + ocasionExtras + platformFee;

    return {
        rentalFee,
        venueConsumption,
        venueSubtotal,
        minSpendGap,
        ocasionExtras,
        platformFee,
        totalAmount,
        breakdown: {
            hoursDuration: durationInHours,
            appliedMinSpend: minSpend
        }
    };
}
