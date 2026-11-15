import WizardStickyFooter from './WizardStickyFooter';
import { Rocket, Github, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MinBitAssistant from './MinBitAssistant';

const StepWelcome = () => {

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">
          Welcome to MinBit Portal
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your open-source AI infrastructure builder. This wizard will guide you through 
          selecting and configuring the perfect stack of self-hosted AI tools.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2 text-center p-4 sm:p-6 rounded-lg border border-border bg-muted/30">
          <div className="text-xl sm:text-2xl font-bold text-primary">18+</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Open-source AI services
          </p>
        </div>
        <div className="space-y-2 text-center p-4 sm:p-6 rounded-lg border border-border bg-muted/30">
          <div className="text-xl sm:text-2xl font-bold text-primary">6 Steps</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Guided configuration
          </p>
        </div>
        <div className="space-y-2 text-center p-4 sm:p-6 rounded-lg border border-border bg-muted/30">
          <div className="text-xl sm:text-2xl font-bold text-primary">5-10min</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Average setup time
          </p>
        </div>
      </div>

      <MinBitAssistant type="tip" title="What you'll get">
        <ul className="space-y-1 list-disc list-inside">
          <li>Custom <code className="px-1 py-0.5 rounded bg-muted text-xs">docker-compose.yml</code> for your stack</li>
          <li>Pre-configured environment variables</li>
          <li>Setup instructions and documentation</li>
          <li>Dependency checks and warnings</li>
        </ul>
      </MinBitAssistant>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
          <a 
            href="https://github.com/minbit-portal" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="View MinBit Portal on GitHub (opens in new tab)"
          >
            <Github className="w-4 h-4 mr-2" aria-hidden="true" />
            View on GitHub
          </a>
        </Button>
        <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
          <a href="/docs" aria-label="Read documentation">
            <Book className="w-4 h-4 mr-2" aria-hidden="true" />
            Documentation
          </a>
        </Button>
      </div>
      
      <WizardStickyFooter canGoNext={true} />
    </div>
  );
};

export default StepWelcome;
