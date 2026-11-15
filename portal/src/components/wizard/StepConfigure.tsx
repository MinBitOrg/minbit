import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWizardStore } from '@/stores/wizardStore';
import { getAllServices } from '@/lib/services';
import MinBitAssistant from './MinBitAssistant';
import WizardStickyFooter from './WizardStickyFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle } from 'lucide-react';

const StepConfigure = () => {
  const { 
    selectedServices, 
    serviceConfigs, 
    updateServiceConfig, 
    projectName,
    setProjectName,
    nextStep,
  } = useWizardStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const services = getAllServices();
  const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id));

  const handleConfigChange = (serviceId: string, key: string, value: string | number | boolean) => {
    updateServiceConfig(serviceId, key, value);
    // Clear validation error for this field when changed
    if (validationErrors[serviceId]) {
      setValidationErrors(prev => ({
        ...prev,
        [serviceId]: prev[serviceId].filter(err => !err.includes(key)),
      }));
    }
  };

  const getConfigValue = (serviceId: string, key: string, defaultValue: string | number | boolean) => {
    return serviceConfigs[serviceId]?.[key] ?? defaultValue;
  };

  // Validate required fields
  const validateConfiguration = (): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    if (!projectName || projectName.trim() === '') {
      isValid = false;
    }

    selectedServiceObjects.forEach(service => {
      const serviceErrors: string[] = [];
      
      service.configOptions.forEach(option => {
        if (option.required) {
          const value = getConfigValue(service.id, option.key, option.default);
          if (value === '' || value === null || value === undefined) {
            serviceErrors.push(`${option.label} is required`);
            isValid = false;
          }
        }
      });

      if (serviceErrors.length > 0) {
        errors[service.id] = serviceErrors;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateConfiguration()) {
      nextStep();
    } else {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-state="open"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const hasErrors = (serviceId: string) => {
    return validationErrors[serviceId] && validationErrors[serviceId].length > 0;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configure Services</h2>
        <p className="text-muted-foreground">
          Set configuration options for your selected services
        </p>
      </div>

      <MinBitAssistant type="tip" title="Configuration Tips">
        Most services work great with default settings. Only change what you need. 
        You can always modify these values later in your <code className="px-1 py-0.5 rounded bg-muted text-xs">.env</code> file.
      </MinBitAssistant>

      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="projectName">
          Project Name <span className="text-destructive" aria-label="required">*</span>
        </Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="my-ai-stack"
          maxLength={50}
          className={!projectName.trim() ? 'border-destructive' : ''}
          aria-invalid={!projectName.trim()}
          aria-describedby={!projectName.trim() ? 'projectName-error' : undefined}
        />
        {!projectName.trim() && (
          <p id="projectName-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            Project name is required
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          This will be used for container names and file naming
        </p>
      </div>

      {/* Service Configurations */}
      <div className="space-y-4">
        <h3 className="font-semibold">Service Settings</h3>
        
        <Accordion type="multiple" className="space-y-2">
          {selectedServiceObjects.map(service => (
            <AccordionItem 
              key={service.id} 
              value={service.id} 
              className={`border rounded-lg px-4 ${hasErrors(service.id) ? 'border-destructive' : ''}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{service.name}</span>
                  {hasErrors(service.id) && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {service.configOptions.length} options
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {hasErrors(service.id) && (
                  <MinBitAssistant type="warning" title="Required fields missing">
                    <ul className="text-sm space-y-1">
                      {validationErrors[service.id].map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </MinBitAssistant>
                )}
                
                {service.configOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No configuration options available. This service uses default settings.
                  </p>
                ) : (
                  service.configOptions.map(option => (
                    <div key={option.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${service.id}-${option.key}`}>
                          {option.label}
                          {option.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>

                      {option.type === 'text' && (
                        <Input
                          id={`${service.id}-${option.key}`}
                          value={getConfigValue(service.id, option.key, option.default) as string}
                          onChange={(e) => handleConfigChange(service.id, option.key, e.target.value)}
                          placeholder={option.default as string}
                        />
                      )}

                      {option.type === 'number' && (
                        <Input
                          id={`${service.id}-${option.key}`}
                          type="number"
                          value={getConfigValue(service.id, option.key, option.default) as number}
                          onChange={(e) => handleConfigChange(service.id, option.key, parseInt(e.target.value))}
                          placeholder={String(option.default)}
                        />
                      )}

                      {option.type === 'boolean' && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${service.id}-${option.key}`}
                            checked={getConfigValue(service.id, option.key, option.default) as boolean}
                            onCheckedChange={(checked) => handleConfigChange(service.id, option.key, checked)}
                          />
                          <Label htmlFor={`${service.id}-${option.key}`} className="text-sm text-muted-foreground">
                            {option.description}
                          </Label>
                        </div>
                      )}

                      {option.type === 'select' && option.options && (
                        <Select
                          value={getConfigValue(service.id, option.key, option.default) as string}
                          onValueChange={(value) => handleConfigChange(service.id, option.key, value)}
                        >
                          <SelectTrigger id={`${service.id}-${option.key}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {option.options.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <MinBitAssistant type="warning" title="Validation Errors">
          Please fill in all required fields before proceeding to review.
        </MinBitAssistant>
      )}

      <WizardStickyFooter 
        canGoNext={Object.keys(validationErrors).length === 0}
        onNext={handleContinue}
      />
    </div>
  );
};

export default StepConfigure;
