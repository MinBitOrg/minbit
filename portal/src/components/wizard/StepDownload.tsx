import { useState } from 'react';
import { Download, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/stores/wizardStore';
import MinBitAssistant from './MinBitAssistant';
import { useNavigate } from 'react-router-dom';
import { downloadStack } from '@/lib/downloadStack';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const StepDownload = () => {
  const wizardState = useWizardStore();
  const { resetWizard, projectName } = wizardState;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloaded, setDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadStack(wizardState);
      setDownloaded(true);
      toast({
        title: 'Download successful!',
        description: `${projectName}.zip has been downloaded.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to generate configuration',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartOver = () => {
    resetWizard();
  };

  const handleGoToMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">
          Configuration Complete!
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI stack configuration is ready. Download the files and deploy to your server.
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={handleDownload}
          disabled={downloaded || isDownloading}
          className="min-w-[200px]"
          aria-label={`Download ${projectName} configuration`}
        >
          <Download className={cn("w-5 h-5 mr-2", isDownloading && "animate-bounce")} aria-hidden="true" />
          {isDownloading ? 'Generating...' : downloaded ? 'Downloaded!' : `Download ${projectName}.zip`}
        </Button>
      </div>

      {downloaded && (
        <MinBitAssistant type="success" title="Download successful!">
          Your configuration files have been downloaded. Extract the ZIP and follow the instructions below.
        </MinBitAssistant>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Quick Start Guide</h3>
        
      <div className="space-y-4 text-sm">
        <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
              1
            </span>
            Extract the ZIP file
          </div>
          <div className="ml-8 text-muted-foreground">
            <code className="px-2 py-1 rounded bg-muted text-xs block overflow-x-auto">
              unzip {projectName}.zip && cd {projectName}
            </code>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
              2
            </span>
            Review and customize .env file
          </div>
          <div className="ml-8 text-muted-foreground text-xs sm:text-sm">
            Check environment variables and update as needed for your environment
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
              3
            </span>
            Start your stack
          </div>
          <div className="ml-8 space-y-2">
            <code className="block px-2 py-1 rounded bg-muted text-xs overflow-x-auto">
              docker compose up -d
            </code>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Wait for all containers to start. First launch may take several minutes.
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
              4
            </span>
            Access your services
          </div>
          <div className="ml-8 text-muted-foreground text-xs sm:text-sm">
            Check README.md for URLs and default credentials for each service
          </div>
        </div>
      </div>
      </div>

      <MinBitAssistant type="tip" title="Need help?">
        <ul className="space-y-1 text-xs sm:text-sm">
          <li>📖 Check the README.md in your download for detailed instructions</li>
          <li>📚 Visit our <a href="/docs" className="text-primary hover:underline">documentation</a> for troubleshooting</li>
          <li>💬 Join our <a href="/support" className="text-primary hover:underline">community</a> for support</li>
          <li>🐛 Report issues on <a href="https://github.com/minbit-portal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a></li>
        </ul>
      </MinBitAssistant>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={handleStartOver}>
          Start New Configuration
        </Button>
        <Button variant="outline" onClick={handleGoToMarketplace}>
          <FileText className="w-4 h-4 mr-2" />
          Browse Services
        </Button>
      </div>
    </div>
  );
};

export default StepDownload;
