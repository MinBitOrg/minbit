export type ServiceCategory = "llm-runners" | "chat-uis" | "workflow-agents" | "vector-dbs";

export type ServiceComplexity = "beginner" | "intermediate" | "advanced";

export type ServiceTag = 
  | "gpu-required" 
  | "cpu-only" 
  | "cloud-ready" 
  | "self-hosted"
  | "popular"
  | "recommended";

export interface ServiceDependency {
  serviceId: string;
  required: boolean;
  description?: string;
}

export interface ServiceConfigOption {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  default: string | number | boolean;
  description: string;
  options?: string[]; // For select type
  required?: boolean;
}

export interface ServicePort {
  container: number;
  host: number;
  description: string;
}

export interface ServiceHealthCheck {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  startPeriod?: string;
}

export interface ServiceVolume {
  source: string;
  target: string;
  description: string;
}

export interface ServiceResourceRequirements {
  minRam: string;
  recommendedRam: string;
  minCpu: number;
  gpuVram?: string;
  diskSpace?: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  longDescription?: string;
  complexity: ServiceComplexity;
  tags: ServiceTag[];
  
  // Docker/deployment info
  dockerImage: string;
  dockerImageTag: string;
  ports: ServicePort[];
  
  // Production-ready enhancements (data-driven)
  healthCheck?: ServiceHealthCheck;
  volumes?: ServiceVolume[];
  internalApiUrl?: string; // URL for other services to connect (e.g., http://ollama:11434)
  resourceRequirements?: ServiceResourceRequirements;
  
  // External service flag (for non-Docker services like LM Studio)
  isExternalService?: boolean;
  externalServiceNote?: string;
  
  // Service discovery - which services this connects to
  connectsTo?: {
    serviceId: string;
    envVar: string; // Environment variable to set for connection
  }[];
  
  // Dependencies
  dependencies: ServiceDependency[];
  
  // Configuration
  configOptions: ServiceConfigOption[];
  environmentVariables: Record<string, string>;
  
  // Resources
  officialDocs: string;
  githubRepo: string;
  
  // Documentation
  postDeployInstructions?: string; // Markdown content for post-deployment setup steps
  
  // UI metadata
  logoUrl?: string;
  popular?: boolean;
  recommended?: boolean;
}
