export interface StepConfig {
  label: string;
  estimatedMinutes: number;
}

export const wizardStepConfig: Record<number, StepConfig> = {
  1: { label: 'Welcome', estimatedMinutes: 1 },
  2: { label: 'Use Case', estimatedMinutes: 2 },
  3: { label: 'Services', estimatedMinutes: 3 },
  4: { label: 'Configure', estimatedMinutes: 5 },
  5: { label: 'Review', estimatedMinutes: 2 },
  6: { label: 'Download', estimatedMinutes: 1 },
};

export const getTotalEstimatedTime = () => {
  return Object.values(wizardStepConfig).reduce(
    (sum, step) => sum + step.estimatedMinutes,
    0
  );
};

export const getRemainingTime = (currentStep: number) => {
  let remaining = 0;
  for (let step = currentStep; step <= 6; step++) {
    remaining += wizardStepConfig[step]?.estimatedMinutes || 0;
  }
  return remaining;
};
