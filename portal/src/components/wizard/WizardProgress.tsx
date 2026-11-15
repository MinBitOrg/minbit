import { Check } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Welcome' },
  { number: 2, label: 'Use Case' },
  { number: 3, label: 'Services' },
  { number: 4, label: 'Configure' },
  { number: 5, label: 'Review' },
  { number: 6, label: 'Download' },
];

const WizardProgress = () => {
  const { currentStep, goToStep } = useWizardStore();

  return (
    <nav className="w-full" aria-label="Wizard progress">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isClickable = currentStep >= step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && goToStep(step.number)}
                disabled={!isClickable}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isActive && 'border-primary text-primary bg-background',
                  !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground',
                  isClickable && 'cursor-pointer hover:border-primary hover:scale-110',
                  !isClickable && 'cursor-not-allowed opacity-50'
                )}
                aria-label={`Step ${step.number}: ${step.label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-semibold" aria-hidden="true">{step.number}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-2 hidden sm:block">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Label */}
      <div className="sm:hidden text-center mt-4">
        <p className="text-sm font-medium text-foreground">
          Step {currentStep}: {steps[currentStep - 1]?.label}
        </p>
      </div>
    </nav>
  );
};

export default WizardProgress;
