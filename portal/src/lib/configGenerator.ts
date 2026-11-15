import { dump } from 'js-yaml';
import { Service } from '@/types/service';

export interface DockerComposeHealthCheck {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  start_period?: string;
}

export interface DockerComposeService {
  image: string;
  container_name: string;
  ports: string[];
  environment: Record<string, string>;
  volumes?: string[];
  restart: string;
  networks?: string[];
  depends_on?: Record<string, { condition: string }>;
  healthcheck?: DockerComposeHealthCheck;
  deploy?: {
    resources?: {
      reservations?: {
        devices?: Array<{
          driver: string;
          count: string;
          capabilities: string[];
        }>;
      };
    };
  };
}

export interface DockerCompose {
  version: string;
  services: Record<string, DockerComposeService>;
  networks: Record<string, { driver: string }>;
  volumes?: Record<string, unknown>;
}

/**
 * Calculate startup order based on dependencies using topological sort
 */
export function getStartupOrder(services: Service[], selectedServiceIds: string[]): string[] {
  const order: string[] = [];
  const remaining = new Set(selectedServiceIds);
  const added = new Set<string>();

  // Keep iterating until all services are ordered
  while (remaining.size > 0) {
    let addedThisRound = false;
    
    for (const serviceId of remaining) {
      const service = services.find(s => s.id === serviceId);
      if (!service) continue;

      // Check if all dependencies are already added
      const depsReady = service.dependencies
        .filter(dep => dep.required && selectedServiceIds.includes(dep.serviceId))
        .every(dep => added.has(dep.serviceId));

      if (depsReady) {
        order.push(serviceId);
        added.add(serviceId);
        remaining.delete(serviceId);
        addedThisRound = true;
      }
    }

    // Break infinite loop if no progress (circular dependency)
    if (!addedThisRound) {
      // Add remaining services in any order
      for (const serviceId of remaining) {
        order.push(serviceId);
      }
      break;
    }
  }

  return order;
}

/**
 * Build service discovery environment variables based on connectsTo field
 */
function buildServiceDiscoveryEnv(
  service: Service, 
  allServices: Service[]
): Record<string, string> {
  const env: Record<string, string> = {};
  
  if (!service.connectsTo) return env;
  
  for (const connection of service.connectsTo) {
    const targetService = allServices.find(s => s.id === connection.serviceId);
    if (targetService?.internalApiUrl) {
      env[connection.envVar] = targetService.internalApiUrl;
    }
  }
  
  return env;
}

/**
 * Generate docker-compose.yml content from services
 * All configuration is now data-driven from services.json
 */
export function generateDockerCompose(
  services: Service[],
  serviceConfigs: Record<string, Record<string, string | number | boolean>>,
  projectName: string
): string {
  const networkName = `${projectName}-network`;
  
  const compose: DockerCompose = {
    version: '3.8',
    services: {},
    networks: {
      [networkName]: {
        driver: 'bridge',
      },
    },
    volumes: {},
  };

  // Filter out external services (like LM Studio)
  const dockerServices = services.filter(s => !s.isExternalService);
  
  // Get startup order
  const serviceOrder = getStartupOrder(dockerServices, dockerServices.map(s => s.id));
  
  // Create a map for quick lookup
  const serviceMap = new Map(services.map(s => [s.id, s]));
  
  // Process services in order
  serviceOrder.forEach((serviceId) => {
    const service = serviceMap.get(serviceId);
    if (!service || service.isExternalService) return;
    
    const config = serviceConfigs[service.id] || {};
    const containerName = `${projectName}-${service.id}`;

    // Build environment variables
    const environment: Record<string, string> = { ...service.environmentVariables };
    
    // Add config options to environment
    Object.entries(config).forEach(([key, value]) => {
      environment[key] = String(value);
    });

    // Add service discovery URLs (data-driven from connectsTo field)
    const discoveryEnv = buildServiceDiscoveryEnv(service, services);
    Object.assign(environment, discoveryEnv);

    const dockerService: DockerComposeService = {
      image: `${service.dockerImage}:${service.dockerImageTag}`,
      container_name: containerName,
      ports: service.ports.map((p) => `${p.host}:${p.container}`),
      environment,
      restart: 'unless-stopped',
      networks: [networkName],
    };

    // Add health check from service data
    if (service.healthCheck) {
      dockerService.healthcheck = {
        test: service.healthCheck.test,
        interval: service.healthCheck.interval,
        timeout: service.healthCheck.timeout,
        retries: service.healthCheck.retries,
        start_period: service.healthCheck.startPeriod,
      };
    }

    // Add volumes from service data
    if (service.volumes && service.volumes.length > 0) {
      dockerService.volumes = service.volumes.map(v => `${v.source}:${v.target}`);
      
      // Add volume definitions
      service.volumes.forEach(v => {
        if (compose.volumes) {
          compose.volumes[v.source] = {};
        }
      });
    }

    // Add depends_on with health condition
    const requiredDeps = service.dependencies
      .filter(dep => dep.required && services.some(s => s.id === dep.serviceId));
    
    if (requiredDeps.length > 0) {
      dockerService.depends_on = {};
      requiredDeps.forEach(dep => {
        if (dockerService.depends_on) {
          const depService = serviceMap.get(dep.serviceId);
          // Use service_healthy if dependency has health check
          const hasHealthCheck = depService?.healthCheck !== undefined;
          dockerService.depends_on[dep.serviceId] = {
            condition: hasHealthCheck ? 'service_healthy' : 'service_started',
          };
        }
      });
    }

    // Add GPU support if required
    if (service.tags.includes('gpu-required')) {
      dockerService.deploy = {
        resources: {
          reservations: {
            devices: [
              {
                driver: 'nvidia',
                count: 'all',
                capabilities: ['gpu'],
              },
            ],
          },
        },
      };
    }

    compose.services[service.id] = dockerService;
  });

  // Clean up empty volumes object
  if (compose.volumes && Object.keys(compose.volumes).length === 0) {
    delete compose.volumes;
  }

  return dump(compose, { 
    indent: 2, 
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
}

export function generateEnvFile(
  services: Service[],
  serviceConfigs: Record<string, Record<string, string | number | boolean>>
): string {
  const lines: string[] = [
    '# ==========================================',
    '# MinBit Portal - Stack Configuration',
    `# Generated: ${new Date().toISOString().split('T')[0]}`,
    '# ==========================================',
    '',
  ];

  // Filter out external services
  const dockerServices = services.filter(s => !s.isExternalService);

  dockerServices.forEach((service) => {
    const config = serviceConfigs[service.id] || {};
    
    lines.push(`# ${service.name} Configuration`);
    lines.push(`# ${service.description}`);
    
    // Add config options with descriptions
    service.configOptions.forEach(option => {
      const value = config[option.key] ?? option.default;
      const isSecret = option.key.toLowerCase().includes('key') || 
                      option.key.toLowerCase().includes('password') ||
                      option.key.toLowerCase().includes('secret');
      
      lines.push(`# ${option.description}${isSecret ? ' (⚠️ CHANGE THIS)' : ''}`);
      lines.push(`${option.key}=${value}`);
    });

    // Add any additional environment variables
    Object.entries(service.environmentVariables).forEach(([key, value]) => {
      if (!service.configOptions.some(opt => opt.key === key)) {
        lines.push(`${key}=${value}`);
      }
    });

    lines.push('');
  });

  // Add common settings section
  lines.push('# ==========================================');
  lines.push('# Common Settings');
  lines.push('# ==========================================');
  lines.push('');
  lines.push('# Logging level (debug, info, warn, error)');
  lines.push('LOG_LEVEL=info');
  lines.push('');

  return lines.join('\n');
}

export function generateReadme(
  services: Service[],
  projectName: string,
  useCase: string | null
): string {
  const requiresGPU = services.some((s) => s.tags.includes('gpu-required'));
  const useCaseTitle = useCase 
    ? useCase.charAt(0).toUpperCase() + useCase.slice(1).replace('-', ' ')
    : 'Custom';

  // Calculate total resource requirements
  const totalMinRam = services.reduce((acc, s) => {
    const ram = s.resourceRequirements?.minRam;
    if (ram) {
      const num = parseInt(ram.replace(/\D/g, ''));
      return acc + num;
    }
    return acc;
  }, 0);

  const lines: string[] = [
    `# ${projectName}`,
    '',
    `> Generated by [MinBit Portal](https://minbit.ai) - Your AI Infrastructure Stack`,
    '',
    `**Use Case:** ${useCaseTitle}  `,
    `**Services:** ${services.map(s => s.name).join(', ')}  `,
    `**Generated:** ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    '',
    '## Quick Start',
    '',
    '```bash',
    '# 1. Start the stack',
    'docker compose up -d',
    '',
    '# 2. Watch the logs (wait for services to be ready)',
    'docker compose logs -f',
    '',
    '# 3. Check service status',
    'docker compose ps',
    '```',
    '',
    '## Services Overview',
    '',
  ];

  // Filter out external services for the main list
  const dockerServices = services.filter(s => !s.isExternalService);
  const externalServices = services.filter(s => s.isExternalService);

  // Service details with access URLs
  dockerServices.forEach((service) => {
    lines.push(`### ${service.name}`);
    lines.push('');
    lines.push(service.description);
    lines.push('');
    lines.push('| Property | Value |');
    lines.push('|----------|-------|');
    
    service.ports.forEach((port) => {
      lines.push(`| **URL** | http://localhost:${port.host} (${port.description}) |`);
    });
    
    lines.push(`| **Image** | \`${service.dockerImage}:${service.dockerImageTag}\` |`);
    lines.push(`| **Complexity** | ${service.complexity} |`);
    
    if (service.tags.includes('gpu-required')) {
      lines.push('| **GPU** | Required (NVIDIA CUDA) |');
    }
    
    if (service.resourceRequirements) {
      const req = service.resourceRequirements;
      lines.push(`| **Min RAM** | ${req.minRam} (recommended: ${req.recommendedRam}) |`);
      if (req.gpuVram) {
        lines.push(`| **GPU VRAM** | ${req.gpuVram} |`);
      }
    }
    
    lines.push(`| **Docs** | ${service.officialDocs} |`);
    lines.push('');
  });

  // External services section
  if (externalServices.length > 0) {
    lines.push('## External Services');
    lines.push('');
    lines.push('The following services are not Docker containers and need to be installed separately:');
    lines.push('');
    
    externalServices.forEach((service) => {
      lines.push(`### ${service.name}`);
      lines.push('');
      if (service.externalServiceNote) {
        lines.push(service.externalServiceNote);
      }
      lines.push('');
      lines.push(`- **Docs:** ${service.officialDocs}`);
      lines.push(`- **API Port:** ${service.ports[0]?.host || 'N/A'}`);
      lines.push('');
    });
  }

  // Post-Deployment Steps section (NEW)
  const servicesWithPostDeploy = services.filter(s => s.postDeployInstructions);
  if (servicesWithPostDeploy.length > 0) {
    lines.push('## Post-Deployment Steps');
    lines.push('');
    lines.push('After starting the stack, follow these steps to configure each service:');
    lines.push('');

    servicesWithPostDeploy.forEach((service, index) => {
      // Replace template variables
      const instructions = service.postDeployInstructions!
        .replace(/\$\{PROJECT_NAME\}/g, projectName);
      
      lines.push(instructions);
      lines.push('');
      
      // Add separator between services (except after last one)
      if (index < servicesWithPostDeploy.length - 1) {
        lines.push('---');
        lines.push('');
      }
    });
  }

  // Prerequisites
  lines.push('## Prerequisites');
  lines.push('');
  lines.push('- Docker Engine 20.10+');
  lines.push('- Docker Compose v2.0+');
  lines.push(`- At least ${Math.max(8, totalMinRam)}GB RAM recommended`);
  
  if (requiresGPU) {
    lines.push('- NVIDIA GPU with CUDA support');
    lines.push('- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)');
  }
  
  lines.push('');

  // Management commands
  lines.push('## Management Commands');
  lines.push('');
  lines.push('```bash');
  lines.push('# Stop all services');
  lines.push('docker compose down');
  lines.push('');
  lines.push('# Stop and remove volumes (⚠️ deletes all data)');
  lines.push('docker compose down -v');
  lines.push('');
  lines.push('# View logs for a specific service');
  lines.push('docker compose logs -f <service-name>');
  lines.push('');
  lines.push('# Restart a service');
  lines.push('docker compose restart <service-name>');
  lines.push('');
  lines.push('# Update images');
  lines.push('docker compose pull');
  lines.push('docker compose up -d');
  lines.push('```');
  lines.push('');

  // Troubleshooting
  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('### Services won\'t start');
  lines.push('');
  lines.push('```bash');
  lines.push('# Check if ports are already in use');
  lines.push('netstat -tulpn | grep -E "' + dockerServices.flatMap(s => s.ports.map(p => p.host)).join('|') + '"');
  lines.push('');
  lines.push('# Check Docker logs for errors');
  lines.push('docker compose logs --tail=50');
  lines.push('```');
  lines.push('');

  if (services.some(s => s.id === 'open-webui' || s.id === 'ollama')) {
    lines.push('### Open WebUI can\'t connect to Ollama');
    lines.push('');
    lines.push('1. Wait for Ollama to fully start (check logs)');
    lines.push('2. The containers communicate via Docker network, not localhost');
    lines.push('3. Verify Ollama health: `docker compose exec ollama curl http://localhost:11434/api/tags`');
    lines.push('');
  }

  if (requiresGPU) {
    lines.push('### GPU not detected');
    lines.push('');
    lines.push('```bash');
    lines.push('# Verify NVIDIA drivers');
    lines.push('nvidia-smi');
    lines.push('');
    lines.push('# Test Docker GPU access');
    lines.push('docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi');
    lines.push('```');
    lines.push('');
  }

  lines.push('### Out of memory');
  lines.push('');
  lines.push('- Increase Docker memory limit in Docker Desktop settings');
  lines.push('- Consider using smaller models (e.g., `llama3.2:1b` instead of `llama3.2:7b`)');
  lines.push('- Reduce the number of running services');
  lines.push('');

  // Backup
  lines.push('## Backup & Recovery');
  lines.push('');
  lines.push('```bash');
  lines.push('# List volumes');
  lines.push('docker volume ls | grep ' + projectName);
  lines.push('');
  lines.push('# Backup a volume');
  lines.push('docker run --rm -v <volume-name>:/data -v $(pwd):/backup alpine tar czf /backup/<volume-name>.tar.gz /data');
  lines.push('');
  lines.push('# Restore a volume');
  lines.push('docker run --rm -v <volume-name>:/data -v $(pwd):/backup alpine tar xzf /backup/<volume-name>.tar.gz -C /');
  lines.push('```');
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('Generated by [MinBit Portal](https://minbit.ai) | [Documentation](https://docs.minbit.ai) | [Support](https://minbit.ai/support)');

  return lines.join('\n');
}
