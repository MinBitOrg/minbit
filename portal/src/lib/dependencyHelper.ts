import { Service } from '@/types/service';

export interface DependencyWarning {
  type: 'missing' | 'suggested' | 'removal';
  message: string;
  serviceId: string;
  serviceName: string;
  required: boolean;
}

export function checkDependencies(
  services: Service[],
  selectedServiceIds: string[]
): DependencyWarning[] {
  const warnings: DependencyWarning[] = [];
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));

  selectedServices.forEach(service => {
    service.dependencies.forEach(dep => {
      if (!selectedServiceIds.includes(dep.serviceId)) {
        const depService = services.find(s => s.id === dep.serviceId);
        if (depService) {
          warnings.push({
            type: dep.required ? 'missing' : 'suggested',
            message: dep.required
              ? `${service.name} requires ${depService.name}`
              : `${service.name} works best with ${depService.name}`,
            serviceId: dep.serviceId,
            serviceName: depService.name,
            required: dep.required,
          });
        }
      }
    });
  });

  return warnings;
}

export function checkRemovalImpact(
  services: Service[],
  selectedServiceIds: string[],
  serviceToRemove: string
): DependencyWarning[] {
  const warnings: DependencyWarning[] = [];
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));

  selectedServices.forEach(service => {
    const dependsOnRemoved = service.dependencies.find(
      dep => dep.serviceId === serviceToRemove
    );
    
    if (dependsOnRemoved) {
      warnings.push({
        type: 'removal',
        message: `${service.name} depends on the service you're removing`,
        serviceId: serviceToRemove,
        serviceName: service.name,
        required: dependsOnRemoved.required,
      });
    }
  });

  return warnings;
}

export function detectPortConflicts(
  services: Service[],
  selectedServiceIds: string[]
): { conflict: boolean; message: string }[] {
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const conflicts: { conflict: boolean; message: string }[] = [];
  const portMap = new Map<number, string[]>();

  selectedServices.forEach(service => {
    service.ports.forEach(port => {
      if (!portMap.has(port.host)) {
        portMap.set(port.host, []);
      }
      portMap.get(port.host)!.push(service.name);
    });
  });

  portMap.forEach((serviceNames, port) => {
    if (serviceNames.length > 1) {
      conflicts.push({
        conflict: true,
        message: `Port ${port} conflict: ${serviceNames.join(', ')}`,
      });
    }
  });

  return conflicts;
}

export function checkGPURequirements(
  services: Service[],
  selectedServiceIds: string[]
): boolean {
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  return selectedServices.some(s => s.tags.includes('gpu-required'));
}
