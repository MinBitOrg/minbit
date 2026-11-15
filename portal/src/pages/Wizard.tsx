import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWizardStore, UseCase } from '@/stores/wizardStore';
import { getServiceById } from '@/lib/services';
import WizardLayout from '@/components/wizard/WizardLayout';
import StepWelcome from '@/components/wizard/StepWelcome';
import StepUseCase from '@/components/wizard/StepUseCase';
import StepServices from '@/components/wizard/StepServices';
import StepConfigure from '@/components/wizard/StepConfigure';
import StepReview from '@/components/wizard/StepReview';
import StepDownload from '@/components/wizard/StepDownload';
import ErrorBoundary from '@/components/wizard/ErrorBoundary';
import KeyboardShortcuts from '@/components/wizard/KeyboardShortcuts';
import MinBitAssistant from '@/components/wizard/MinBitAssistant';
import { Rocket } from 'lucide-react';

const Wizard = () => {
  const { currentStep, initFromUrlParams, selectedServices } = useWizardStore();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const servicesParam = searchParams.get('services');
  const useCaseParam = searchParams.get('useCase') as UseCase | null;
  
  // Initialize from URL parameters on mount
  useEffect(() => {
    if (serviceParam || servicesParam || useCaseParam) {
      initFromUrlParams({
        service: serviceParam || undefined,
        services: servicesParam || undefined,
        useCase: useCaseParam || undefined,
      });
    }
  }, [serviceParam, servicesParam, useCaseParam, initFromUrlParams]);
  
  // Get pre-selected service info for visual indicator
  const preSelectedService = serviceParam ? getServiceById(serviceParam) : null;
  const preSelectedServices = servicesParam 
    ? servicesParam.split(',').map(id => getServiceById(id.trim())).filter(Boolean)
    : [];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome />;
      case 2:
        return <StepUseCase />;
      case 3:
        return <StepServices />;
      case 4:
        return <StepConfigure />;
      case 5:
        return <StepReview />;
      case 6:
        return <StepDownload />;
      default:
        return <StepWelcome />;
    }
  };

  return (
    <ErrorBoundary>
      <KeyboardShortcuts />
      <WizardLayout>
        {/* Single service pre-selection */}
        {preSelectedService && selectedServices.includes(preSelectedService.id) && !servicesParam && (
          <MinBitAssistant type="success" title="Starting with your selection">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span>
                <strong>{preSelectedService.name}</strong> has been pre-selected. 
                You can add more services or continue with the configuration.
              </span>
            </div>
          </MinBitAssistant>
        )}
        
        {/* Multiple services pre-selection */}
        {preSelectedServices.length > 0 && (
          <MinBitAssistant type="success" title="Starting with your stack">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span>
                <strong>{preSelectedServices.length} services</strong> pre-selected: {' '}
                {preSelectedServices.map(s => s?.name).join(', ')}. 
                You can modify your stack or continue with the configuration.
              </span>
            </div>
          </MinBitAssistant>
        )}
        
        {renderStep()}
      </WizardLayout>
    </ErrorBoundary>
  );
};

export default Wizard;
