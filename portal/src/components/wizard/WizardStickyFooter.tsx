import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/stores/wizardStore';
import { wizardStepConfig, getRemainingTime } from '@/data/wizardStepConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardStickyFooterProps {
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  onBeforeNext?: () => boolean; // Return false to prevent navigation
}

const WizardStickyFooter = ({
  onNext,
  onBack,
  canGoNext = true,
  showSkip = false,
  onSkip,
  onBeforeNext,
}: WizardStickyFooterProps) => {
  const { currentStep, nextStep, prevStep } = useWizardStore();
  
  const handleNext = () => {
    // If onBeforeNext returns false, don't proceed
    if (onBeforeNext && !onBeforeNext()) {
      return;
    }
    
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      prevStep();
    }
  };
  
  const remainingTime = getRemainingTime(currentStep);
  const stepLabel = wizardStepConfig[currentStep]?.label || '';
  
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-10">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        {/* Progress Info */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Step {currentStep} of 6
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{stepLabel}</span>
          </div>
          <div className="text-right">
            <span className="hidden sm:inline">Est: </span>
            ~{remainingTime} min remaining
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {showSkip && onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="hidden sm:inline-flex"
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {currentStep === 6 ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStickyFooter;
