import { useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';

const KeyboardShortcuts = () => {
  const { currentStep, nextStep, prevStep } = useWizardStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Navigation shortcuts
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'ArrowRight' && currentStep < 6) {
        e.preventDefault();
        // Only allow forward navigation if we can access that step
        const canProceed = currentStep < 6;
        if (canProceed) {
          // Note: This will only work if the step's continue button would work
          // We're not enforcing validation here - that's handled by the step components
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, nextStep, prevStep]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
