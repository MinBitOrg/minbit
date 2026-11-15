import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MarketplaceState {
  selectedServices: string[];
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  toggleService: (serviceId: string) => void;
  clearSelection: () => void;
  isSelected: (serviceId: string) => boolean;
}

const STORAGE_KEY = 'minbit-marketplace-selection';

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      selectedServices: [],
      
      addService: (serviceId: string) => set((state) => {
        if (state.selectedServices.includes(serviceId)) {
          return state;
        }
        return {
          selectedServices: [...state.selectedServices, serviceId],
        };
      }),
      
      removeService: (serviceId: string) => set((state) => ({
        selectedServices: state.selectedServices.filter(id => id !== serviceId),
      })),
      
      toggleService: (serviceId: string) => {
        const { selectedServices } = get();
        if (selectedServices.includes(serviceId)) {
          get().removeService(serviceId);
        } else {
          get().addService(serviceId);
        }
      },
      
      clearSelection: () => set({ selectedServices: [] }),
      
      isSelected: (serviceId: string) => {
        return get().selectedServices.includes(serviceId);
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
