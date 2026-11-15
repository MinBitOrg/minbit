import { ReactNode } from 'react';
import WizardProgress from './WizardProgress';

interface WizardLayoutProps {
  children: ReactNode;
}

const WizardLayout = ({ children }: WizardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              MinBit Configuration Wizard
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Build your perfect AI stack in 6 steps
            </p>
          </header>

          {/* Progress Indicator */}
          <WizardProgress />

          {/* Step Content */}
          <main className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
