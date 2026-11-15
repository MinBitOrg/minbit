import { MessageSquare, Database, Workflow, Settings, FileText } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import { useCases, UseCase } from '@/data/useCases';
import MinBitAssistant from './MinBitAssistant';
import WizardStickyFooter from './WizardStickyFooter';
import { COMPLEXITY_TEXT_COLORS } from '@/data/constants';
import { cn } from '@/lib/utils';

const iconMap = {
  MessageSquare,
  Database,
  Workflow,
  Settings,
  FileText,
};

const StepUseCase = () => {
  const { useCase, setUseCase, addService } = useWizardStore();

  const handleSelectUseCase = (selectedCase: UseCase) => {
    setUseCase(selectedCase.id);
    
    // Pre-populate recommended services
    if (selectedCase.recommendedServices.length > 0) {
      selectedCase.recommendedServices.forEach(serviceId => {
        addService(serviceId);
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Use Case</h2>
        <p className="text-muted-foreground">
          Select a pre-configured stack or build your own from scratch
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6" role="list" aria-label="Available use cases">
        {useCases.map((uc) => {
          const Icon = iconMap[uc.icon as keyof typeof iconMap] || Settings;
          const isSelected = useCase === uc.id;

          return (
            <button
              key={uc.id}
              onClick={() => handleSelectUseCase(uc)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectUseCase(uc);
                }
              }}
              className={cn(
                'text-left p-4 sm:p-6 rounded-lg border-2 transition-all',
                'hover:border-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
              )}
              aria-pressed={isSelected}
              aria-label={`${uc.name}${isSelected ? ', currently selected' : ''}. ${uc.description}`}
              role="listitem"
              tabIndex={0}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{uc.name}</h3>
                      <p className={cn('text-xs font-medium', COMPLEXITY_TEXT_COLORS[uc.complexity])}>
                        {uc.complexity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {uc.description}
                </p>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Setup time:</span>
                    <span>{uc.estimatedSetupTime}</span>
                  </div>
                  {uc.recommendedServices.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Services:</span>
                      <span>{uc.recommendedServices.length} pre-selected</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {useCase && (
        <MinBitAssistant type="success" title="Great choice!">
          {useCases.find(uc => uc.id === useCase)?.longDescription}
        </MinBitAssistant>
      )}

      <WizardStickyFooter canGoNext={!!useCase} />
    </div>
  );
};

export default StepUseCase;
