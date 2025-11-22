import { create } from 'zustand';
import { Package, PricingRule } from '@/types';

interface CalculatorState {
    date: Date | undefined;
    startTime: string;
    endTime: string;
    guestCount: number;
    selectedPackages: Package[];
    pricingRule: PricingRule | null;

    setDate: (date: Date | undefined) => void;
    setTime: (start: string, end: string) => void;
    setGuestCount: (count: number) => void;
    togglePackage: (pkg: Package) => void;
    setPricingRule: (rule: PricingRule | null) => void;
    reset: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
    date: undefined,
    startTime: '09:00',
    endTime: '13:00',
    guestCount: 10,
    selectedPackages: [],
    pricingRule: null,

    setDate: (date) => set({ date }),
    setTime: (startTime, endTime) => set({ startTime, endTime }),
    setGuestCount: (guestCount) => set({ guestCount }),
    togglePackage: (pkg) => set((state) => {
        const exists = state.selectedPackages.find((p) => p.id === pkg.id);
        if (exists) {
            return { selectedPackages: state.selectedPackages.filter((p) => p.id !== pkg.id) };
        }
        return { selectedPackages: [...state.selectedPackages, pkg] };
    }),
    setPricingRule: (pricingRule) => set({ pricingRule }),
    reset: () => set({
        date: undefined,
        startTime: '09:00',
        endTime: '13:00',
        guestCount: 10,
        selectedPackages: [],
        pricingRule: null
    })
}));
