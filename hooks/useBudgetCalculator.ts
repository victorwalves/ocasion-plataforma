import { useCalculatorStore } from '@/lib/store/calculator';
import { calculateBudget } from '@/lib/utils/pricing-engine';
import { useMemo } from 'react';

export function useBudgetCalculator() {
    const store = useCalculatorStore();

    const result = useMemo(() => {
        if (!store.date || !store.pricingRule) return null;

        return calculateBudget({
            date: store.date,
            startTime: store.startTime,
            endTime: store.endTime,
            guestCount: store.guestCount,
            selectedPackages: store.selectedPackages,
            pricingRule: store.pricingRule
        });
    }, [
        store.date,
        store.startTime,
        store.endTime,
        store.guestCount,
        store.selectedPackages,
        store.pricingRule
    ]);

    return {
        ...store,
        result,
        isValid: !!result
    };
}
