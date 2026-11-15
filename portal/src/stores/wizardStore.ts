import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UseCase = 'chatbot' | 'rag' | 'simple-rag' | 'workflow' | 'custom' | null;

export interface ServiceConfig {
  [key: string]: string | number | boolean;
}

export interface WizardState {
  // State
  currentStep: number;
  useCase: UseCase;
  selectedServices: string[];
  serviceConfigs: Record<string, ServiceConfig>;
  projectName: string;
  
  // Navigation actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Use case actions
  setUseCase: (useCase: UseCase) => void;
  
  // Service actions
  toggleService: (serviceId: string) => void;
  addService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  
  // Config actions
  updateServiceConfig: (serviceId: string, key: string, value: string | number | boolean) => void;
  setProjectName: (name: string) => void;
  
  // Utility actions
  resetWizard: () => void;
  initFromUrlParams: (params: { service?: string; services?: string; useCase?: UseCase }) => void;
}

const STORAGE_KEY = 'minbit-wizard';
const SCHEMA_VERSION = 1;

const initialState = {
  currentStep: 1,
  useCase: null as UseCase,
  selectedServices: [] as string[],
  serviceConfigs: {} as Record<string, ServiceConfig>,
  projectName: 'my-ai-stack',
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Navigation
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 6) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      
      goToStep: (step: number) => set({ 
        currentStep: Math.max(1, Math.min(step, 6)) 
      }),
      
      // Use case
      setUseCase: (useCase: UseCase) => set({ useCase }),
      
      // Services
      toggleService: (serviceId: string) => set((state) => {
        const isSelected = state.selectedServices.includes(serviceId);
        return {
          selectedServices: isSelected
            ? state.selectedServices.filter(id => id !== serviceId)
            : [...state.selectedServices, serviceId],
        };
      }),
      
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
        serviceConfigs: Object.fromEntries(
          Object.entries(state.serviceConfigs).filter(([id]) => id !== serviceId)
        ),
      })),
      
      // Configuration
      updateServiceConfig: (serviceId: string, key: string, value: string | number | boolean) => 
        set((state) => ({
          serviceConfigs: {
            ...state.serviceConfigs,
            [serviceId]: {
              ...state.serviceConfigs[serviceId],
              [key]: value,
            },
          },
        })),
      
      setProjectName: (name: string) => set({ projectName: name }),
      
      // Reset
      resetWizard: () => set(initialState),
      
      // Initialize from URL parameters
      initFromUrlParams: (params: { service?: string; services?: string; useCase?: UseCase }) => {
        const updates: Partial<typeof initialState> = {};
        
        // Handle multiple services (comma-separated)
        if (params.services) {
          const serviceIds = params.services.split(',').map(s => s.trim()).filter(Boolean);
          updates.selectedServices = serviceIds;
          updates.currentStep = 3; // Services step
        }
        // Handle single service (legacy support)
        else if (params.service) {
          updates.selectedServices = [params.service];
          updates.currentStep = 3; // Services step
        }
        
        // If use case is provided, set it
        if (params.useCase) {
          updates.useCase = params.useCase;
          if (!params.service && !params.services) {
            updates.currentStep = 2; // Use case step
          }
        }
        
        set(updates);
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // Partial persistence - only persist what's needed
      partialize: (state) => ({
        currentStep: state.currentStep,
        useCase: state.useCase,
        selectedServices: state.selectedServices,
        serviceConfigs: state.serviceConfigs,
        projectName: state.projectName,
      }),
    }
  )
);
