import { useState, useMemo, useCallback } from 'react';
import { Plus, Minus, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWizardStore } from '@/stores/wizardStore';
import { getAllServices } from '@/lib/services';
import { Service, ServiceCategory } from '@/types/service';
import MinBitAssistant from './MinBitAssistant';
import WizardStickyFooter from './WizardStickyFooter';
import { CATEGORY_LABELS, CATEGORY_LABELS_SINGULAR, COMPLEXITY_COLORS } from '@/data/constants';
import { cn } from '@/lib/utils';
import { checkDependencies, checkRemovalImpact, detectPortConflicts, checkGPURequirements } from '@/lib/dependencyHelper';

const StepServices = () => {
  const { selectedServices, toggleService, addService, useCase } = useWizardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const services = getAllServices();

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  const categories = Array.from(new Set(services.map(s => s.category))) as ServiceCategory[];

  // Check for dependency warnings and suggestions
  const dependencyWarnings = useMemo(
    () => checkDependencies(services, selectedServices),
    [services, selectedServices]
  );

  const portConflicts = useMemo(
    () => detectPortConflicts(services, selectedServices),
    [services, selectedServices]
  );

  const requiresGPU = useMemo(
    () => checkGPURequirements(services, selectedServices),
    [services, selectedServices]
  );

  const handleToggleService = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // If removing a service, check for dependents
    if (selectedServices.includes(serviceId)) {
      const removalWarnings = checkRemovalImpact(services, selectedServices, serviceId);
      if (removalWarnings.length > 0 && removalWarnings.some(w => w.required)) {
        // Show warning but still allow removal
        console.warn('Removing service with dependents:', removalWarnings);
      }
      toggleService(serviceId);
    } else {
      // If adding a service, auto-suggest dependencies
      toggleService(serviceId);
      
      // Auto-add required dependencies
      service.dependencies.forEach(dep => {
        if (dep.required && !selectedServices.includes(dep.serviceId)) {
          addService(dep.serviceId);
        }
      });
    }
  }, [services, selectedServices, toggleService, addService]);

  const handleAddSuggestedService = useCallback((serviceId: string) => {
    addService(serviceId);
  }, [addService]);

  const getDependencyWarning = useCallback((service: Service): string | null => {
    for (const dep of service.dependencies) {
      if (dep.required && !selectedServices.includes(dep.serviceId)) {
        const depService = services.find(s => s.id === dep.serviceId);
        return `Requires ${depService?.name || dep.serviceId}`;
      }
    }
    return null;
  }, [services, selectedServices]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select Services</h2>
        <p className="text-muted-foreground">
          Choose the AI tools you want to include in your stack
        </p>
      </div>

      {useCase && useCase !== 'custom' && (
        <MinBitAssistant type="info" title="Pre-selected services">
          We've pre-selected recommended services for your use case. Feel free to add or remove services as needed.
        </MinBitAssistant>
      )}

      {/* Dependency Warnings */}
      {dependencyWarnings.filter(w => w.type === 'missing').length > 0 && (
        <MinBitAssistant type="warning" title="Missing Dependencies">
          <ul className="space-y-2">
            {dependencyWarnings
              .filter(w => w.type === 'missing')
              .map((warning, idx) => (
                <li key={idx} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{warning.message}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSuggestedService(warning.serviceId)}
                  >
                    Add {warning.serviceName}
                  </Button>
                </li>
              ))}
          </ul>
        </MinBitAssistant>
      )}

      {/* Suggested Dependencies */}
      {dependencyWarnings.filter(w => w.type === 'suggested').length > 0 && (
        <MinBitAssistant type="info" title="Recommended Add-ons">
          <ul className="space-y-2">
            {dependencyWarnings
              .filter(w => w.type === 'suggested')
              .map((warning, idx) => (
                <li key={idx} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{warning.message}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSuggestedService(warning.serviceId)}
                  >
                    Add {warning.serviceName}
                  </Button>
                </li>
              ))}
          </ul>
        </MinBitAssistant>
      )}

      {/* Port Conflicts */}
      {portConflicts.length > 0 && (
        <MinBitAssistant type="warning" title="Port Conflicts">
          <ul className="space-y-1">
            {portConflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                {conflict.message}
              </li>
            ))}
          </ul>
          <p className="text-sm mt-2">You'll need to modify port mappings before deployment.</p>
        </MinBitAssistant>
      )}

      {/* GPU Warning */}
      {requiresGPU && (
        <MinBitAssistant type="info" title="GPU Required">
          Some selected services require a GPU. Ensure your system has NVIDIA GPU with CUDA support.
        </MinBitAssistant>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search services by name or description"
          />
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {CATEGORY_LABELS[category]}
            </Button>
          ))}
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid sm:grid-cols-2 gap-4" role="list" aria-label="Available services">
        {filteredServices.map(service => {
          const isSelected = selectedServices.includes(service.id);
          const dependencyWarning = getDependencyWarning(service);

          return (
            <button
              key={service.id}
              onClick={() => handleToggleService(service.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleService(service.id);
                }
              }}
              className={cn(
                'text-left p-4 rounded-lg border-2 transition-all',
                'hover:border-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
              )}
              aria-pressed={isSelected}
              aria-label={`${service.name}${isSelected ? ', currently selected' : ''}. ${service.description}`}
              role="listitem"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS_SINGULAR[service.category]}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs border", COMPLEXITY_COLORS[service.complexity])}>
                      {service.complexity}
                    </Badge>
                    {service.tags.includes('gpu-required') && (
                      <Badge variant="destructive" className="text-xs">GPU</Badge>
                    )}
                    {service.tags.includes('popular') && (
                      <Badge variant="default" className="text-xs">Popular</Badge>
                    )}
                  </div>

                  {dependencyWarning && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ⚠️ {dependencyWarning}
                    </p>
                  )}
                </div>

                <div 
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border" aria-live="polite">
          <p className="text-sm font-medium mb-2">
            Selected services ({selectedServices.length}):
          </p>
          <div className="flex gap-2 flex-wrap">
            {selectedServices.map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              return service ? (
                <Badge key={serviceId} variant="default">
                  {service.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      <WizardStickyFooter canGoNext={selectedServices.length > 0} />
    </div>
  );
};

export default StepServices;
