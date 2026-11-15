import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWizardStore } from '@/stores/wizardStore';
import { getAllServices } from '@/lib/services';
import { useCases } from '@/data/useCases';
import MinBitAssistant from './MinBitAssistant';
import WizardStickyFooter from './WizardStickyFooter';
import CodeEditor from './CodeEditor';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Edit2, RotateCcw, AlertCircle } from 'lucide-react';
import { generateDockerCompose, generateEnvFile, generateReadme } from '@/lib/configGenerator';
import { detectPortConflicts } from '@/lib/dependencyHelper';
import { useToast } from '@/hooks/use-toast';
import { load as yamlLoad } from 'js-yaml';

interface EditedFiles {
  dockerCompose: string | null;
  envFile: string | null;
  readme: string | null;
}

interface ValidationErrors {
  dockerCompose: string | null;
  envFile: string | null;
  readme: string | null;
}

const StepReview = () => {
  const { 
    useCase, 
    selectedServices,
    serviceConfigs,
    projectName, 
  } = useWizardStore();

  const { toast } = useToast();
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({
    dockerCompose: false,
    envFile: false,
    readme: false,
  });
  const [editedFiles, setEditedFiles] = useState<EditedFiles>({
    dockerCompose: null,
    envFile: null,
    readme: null,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    dockerCompose: null,
    envFile: null,
    readme: null,
  });

  const services = getAllServices();
  const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id));
  const useCaseObject = useCases.find(uc => uc.id === useCase);

  // Calculate total resources
  const totalPorts = selectedServiceObjects.reduce((acc, service) => acc + service.ports.length, 0);
  const requiresGPU = selectedServiceObjects.some(s => s.tags.includes('gpu-required'));

  // Generate configuration files
  const generatedDockerCompose = useMemo(
    () => generateDockerCompose(selectedServiceObjects, serviceConfigs, projectName),
    [selectedServiceObjects, serviceConfigs, projectName]
  );

  const generatedEnvFile = useMemo(
    () => generateEnvFile(selectedServiceObjects, serviceConfigs),
    [selectedServiceObjects, serviceConfigs]
  );

  const generatedReadme = useMemo(
    () => generateReadme(selectedServiceObjects, projectName, useCase),
    [selectedServiceObjects, projectName, useCase]
  );

  // Current values (edited or generated)
  const dockerCompose = editedFiles.dockerCompose ?? generatedDockerCompose;
  const envFile = editedFiles.envFile ?? generatedEnvFile;
  const readme = editedFiles.readme ?? generatedReadme;

  // Check for port conflicts
  const portConflicts = useMemo(
    () => detectPortConflicts(services, selectedServices),
    [services, selectedServices]
  );

  // Track if files have been modified
  const isModified = {
    dockerCompose: editedFiles.dockerCompose !== null && editedFiles.dockerCompose !== generatedDockerCompose,
    envFile: editedFiles.envFile !== null && editedFiles.envFile !== generatedEnvFile,
    readme: editedFiles.readme !== null && editedFiles.readme !== generatedReadme,
  };

  // Validate YAML
  const validateYaml = useCallback((content: string): string | null => {
    try {
      yamlLoad(content);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Invalid YAML syntax';
    }
  }, []);

  // Handle file content changes
  const handleDockerComposeChange = useCallback((value: string) => {
    setEditedFiles(prev => ({ ...prev, dockerCompose: value }));
    const error = validateYaml(value);
    setValidationErrors(prev => ({ ...prev, dockerCompose: error }));
  }, [validateYaml]);

  const handleEnvFileChange = useCallback((value: string) => {
    setEditedFiles(prev => ({ ...prev, envFile: value }));
    // Basic .env validation (no complex syntax to validate)
    setValidationErrors(prev => ({ ...prev, envFile: null }));
  }, []);

  const handleReadmeChange = useCallback((value: string) => {
    setEditedFiles(prev => ({ ...prev, readme: value }));
    // Markdown doesn't need validation
    setValidationErrors(prev => ({ ...prev, readme: null }));
  }, []);

  // Reset file to generated version
  const handleReset = useCallback((fileKey: keyof EditedFiles) => {
    setEditedFiles(prev => ({ ...prev, [fileKey]: null }));
    setValidationErrors(prev => ({ ...prev, [fileKey]: null }));
    toast({
      title: 'Reset to default',
      description: 'File has been reset to the generated version.',
    });
  }, [toast]);

  // Toggle edit mode
  const toggleEdit = useCallback((fileKey: string) => {
    setIsEditing(prev => ({ ...prev, [fileKey]: !prev[fileKey] }));
  }, []);

  const handleCopyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      toast({
        title: 'Copied!',
        description: `${fileName} copied to clipboard`,
      });
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Check if there are any validation errors preventing download
  const hasValidationErrors = Object.values(validationErrors).some(error => error !== null);

  // Store edited files in wizard store for download
  const handleContinue = useCallback(() => {
    if (hasValidationErrors) {
      toast({
        title: 'Fix validation errors',
        description: 'Please fix the errors before continuing.',
        variant: 'destructive',
      });
      return false;
    }
    // Store in session storage for download step
    sessionStorage.setItem('minbit-edited-files', JSON.stringify({
      dockerCompose: editedFiles.dockerCompose,
      envFile: editedFiles.envFile,
      readme: editedFiles.readme,
    }));
    return true;
  }, [hasValidationErrors, editedFiles, toast]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Review & Customize</h2>
        <p className="text-muted-foreground">
          Review and edit your configuration files before downloading
        </p>
      </div>

      {/* Project Overview */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Project Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project Name:</span>
              <p className="font-medium">{projectName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Use Case:</span>
              <p className="font-medium">{useCaseObject?.name || 'Custom'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Services:</span>
              <p className="font-medium">{selectedServices.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Ports:</span>
              <p className="font-medium">{totalPorts}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Services */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Selected Services</h3>
        <div className="grid gap-3 sm:grid-cols-2" role="list" aria-label="Selected services configuration">
          {selectedServiceObjects.map(service => (
            <Card key={service.id} className="p-4" role="listitem">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{service.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {service.complexity}
                    </Badge>
                    {service.tags.includes('gpu-required') && (
                      <Badge variant="destructive" className="text-xs">GPU</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ports: {service.ports.map(p => p.host).join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuration Editor */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configuration Files</h3>
        <Tabs defaultValue="docker-compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="docker-compose" className="text-xs sm:text-sm px-2 py-2 gap-1">
              <span className="hidden sm:inline">docker-compose.yml</span>
              <span className="sm:hidden">compose</span>
              {isModified.dockerCompose && (
                <span className="w-2 h-2 rounded-full bg-primary" title="Modified" />
              )}
            </TabsTrigger>
            <TabsTrigger value="env" className="text-xs sm:text-sm px-2 py-2 gap-1">
              .env
              {isModified.envFile && (
                <span className="w-2 h-2 rounded-full bg-primary" title="Modified" />
              )}
            </TabsTrigger>
            <TabsTrigger value="readme" className="text-xs sm:text-sm px-2 py-2 gap-1">
              README
              {isModified.readme && (
                <span className="w-2 h-2 rounded-full bg-primary" title="Modified" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="docker-compose" className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Docker Compose configuration
                </p>
                {validationErrors.dockerCompose && (
                  <div className="flex items-center gap-1 text-destructive text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Invalid YAML</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isModified.dockerCompose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('dockerCompose')}
                    aria-label="Reset docker-compose.yml to default"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEdit('dockerCompose')}
                  aria-label={isEditing.dockerCompose ? 'View mode' : 'Edit mode'}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {isEditing.dockerCompose ? 'View' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(dockerCompose, 'docker-compose.yml')}
                  aria-label="Copy docker-compose.yml to clipboard"
                >
                  {copiedFile === 'docker-compose.yml' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <CodeEditor
              value={dockerCompose}
              onChange={isEditing.dockerCompose ? handleDockerComposeChange : undefined}
              language="yaml"
              readOnly={!isEditing.dockerCompose}
              height="400px"
            />
            {validationErrors.dockerCompose && (
              <p className="text-xs text-destructive mt-2">
                {validationErrors.dockerCompose}
              </p>
            )}
          </TabsContent>

          <TabsContent value="env" className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Environment variables
              </p>
              <div className="flex gap-2">
                {isModified.envFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('envFile')}
                    aria-label="Reset .env to default"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEdit('envFile')}
                  aria-label={isEditing.envFile ? 'View mode' : 'Edit mode'}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {isEditing.envFile ? 'View' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(envFile, '.env')}
                  aria-label="Copy .env to clipboard"
                >
                  {copiedFile === '.env' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <CodeEditor
              value={envFile}
              onChange={isEditing.envFile ? handleEnvFileChange : undefined}
              language="env"
              readOnly={!isEditing.envFile}
              height="400px"
            />
          </TabsContent>

          <TabsContent value="readme" className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Setup instructions
              </p>
              <div className="flex gap-2">
                {isModified.readme && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset('readme')}
                    aria-label="Reset README to default"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEdit('readme')}
                  aria-label={isEditing.readme ? 'View mode' : 'Edit mode'}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {isEditing.readme ? 'View' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(readme, 'README.md')}
                  aria-label="Copy README to clipboard"
                >
                  {copiedFile === 'README.md' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <CodeEditor
              value={readme}
              onChange={isEditing.readme ? handleReadmeChange : undefined}
              language="markdown"
              readOnly={!isEditing.readme}
              height="400px"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Warnings */}
      {portConflicts.length > 0 && (
        <MinBitAssistant type="warning" title="Port Conflicts Detected">
          <ul className="space-y-1">
            {portConflicts.map((conflict, idx) => (
              <li key={idx}>{conflict.message}</li>
            ))}
          </ul>
          <p className="mt-2">Edit the docker-compose.yml above to resolve port conflicts.</p>
        </MinBitAssistant>
      )}

      {requiresGPU && (
        <MinBitAssistant type="warning" title="GPU Required">
          Your stack includes services that require a GPU. Make sure your system has a compatible 
          NVIDIA GPU with CUDA support and Docker GPU runtime configured.
        </MinBitAssistant>
      )}

      {hasValidationErrors && (
        <MinBitAssistant type="warning" title="Validation Errors">
          Please fix the validation errors before downloading your configuration.
        </MinBitAssistant>
      )}

      <MinBitAssistant type="info" title="Production Ready">
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Health checks configured for service readiness</li>
          <li>Volumes set up for data persistence</li>
          <li>Services use Docker DNS for inter-service communication</li>
          <li>Startup order optimized based on dependencies</li>
        </ul>
      </MinBitAssistant>

      <WizardStickyFooter 
        canGoNext={!hasValidationErrors} 
        onBeforeNext={handleContinue}
      />
    </div>
  );
};

export default StepReview;
