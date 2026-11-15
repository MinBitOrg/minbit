import { describe, it, expect } from 'vitest';
import { 
  checkDependencies, 
  checkRemovalImpact, 
  detectPortConflicts, 
  checkGPURequirements 
} from './dependencyHelper';
import { Service } from '@/types/service';

// Mock services for testing
const mockOllama: Service = {
  id: 'ollama',
  name: 'Ollama',
  category: 'llm-runners',
  description: 'LLM runner',
  complexity: 'beginner',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'ollama/ollama',
  dockerImageTag: 'latest',
  ports: [{ container: 11434, host: 11434, description: 'API' }],
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://ollama.ai',
  githubRepo: 'https://github.com/ollama/ollama',
};

const mockOpenWebUI: Service = {
  id: 'open-webui',
  name: 'Open WebUI',
  category: 'chat-uis',
  description: 'Chat UI',
  complexity: 'beginner',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'ghcr.io/open-webui/open-webui',
  dockerImageTag: 'main',
  ports: [{ container: 8080, host: 3000, description: 'Web' }],
  dependencies: [
    { serviceId: 'ollama', required: false, description: 'Recommended backend' },
  ],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://docs.openwebui.com',
  githubRepo: 'https://github.com/open-webui/open-webui',
};

const mockLibreChat: Service = {
  id: 'librechat',
  name: 'LibreChat',
  category: 'chat-uis',
  description: 'Chat UI with multi-modal support',
  complexity: 'intermediate',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'librechat/librechat',
  dockerImageTag: 'latest',
  ports: [{ container: 3000, host: 3000, description: 'Web' }],
  dependencies: [
    { serviceId: 'mongodb', required: true, description: 'Required database' },
  ],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://www.librechat.ai',
  githubRepo: 'https://github.com/danny-avila/LibreChat',
};

const mockMongoDB: Service = {
  id: 'mongodb',
  name: 'MongoDB',
  category: 'vector-dbs',
  description: 'Document database',
  complexity: 'intermediate',
  tags: ['cpu-only'],
  dockerImage: 'mongo',
  dockerImageTag: 'latest',
  ports: [{ container: 27017, host: 27017, description: 'MongoDB' }],
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://mongodb.com',
  githubRepo: 'https://github.com/mongodb/mongo',
};

const mockVllm: Service = {
  id: 'vllm',
  name: 'vLLM',
  category: 'llm-runners',
  description: 'GPU inference engine',
  complexity: 'advanced',
  tags: ['gpu-required', 'popular'],
  dockerImage: 'vllm/vllm-openai',
  dockerImageTag: 'latest',
  ports: [{ container: 8000, host: 8000, description: 'API' }],
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://docs.vllm.ai',
  githubRepo: 'https://github.com/vllm-project/vllm',
};

const mockFlowise: Service = {
  id: 'flowise',
  name: 'Flowise',
  category: 'workflow-agents',
  description: 'LLM flow builder',
  complexity: 'beginner',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'flowiseai/flowise',
  dockerImageTag: 'latest',
  ports: [{ container: 3000, host: 3000, description: 'Web' }], // Same port as LibreChat!
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://docs.flowiseai.com',
  githubRepo: 'https://github.com/FlowiseAI/Flowise',
};

const allServices = [
  mockOllama,
  mockOpenWebUI,
  mockLibreChat,
  mockMongoDB,
  mockVllm,
  mockFlowise,
];

describe('checkDependencies', () => {
  it('returns empty array when no dependencies are missing', () => {
    const warnings = checkDependencies(allServices, ['ollama']);
    expect(warnings).toEqual([]);
  });

  it('detects missing required dependencies', () => {
    const warnings = checkDependencies(allServices, ['librechat']);
    
    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('missing');
    expect(warnings[0].serviceId).toBe('mongodb');
    expect(warnings[0].required).toBe(true);
    expect(warnings[0].message).toContain('requires');
  });

  it('suggests optional dependencies', () => {
    const warnings = checkDependencies(allServices, ['open-webui']);
    
    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('suggested');
    expect(warnings[0].serviceId).toBe('ollama');
    expect(warnings[0].required).toBe(false);
    expect(warnings[0].message).toContain('works best with');
  });

  it('returns empty when all dependencies are selected', () => {
    const warnings = checkDependencies(allServices, ['librechat', 'mongodb']);
    expect(warnings).toEqual([]);
  });

  it('handles multiple services with dependencies', () => {
    const warnings = checkDependencies(allServices, ['open-webui', 'librechat']);
    
    expect(warnings.length).toBe(2);
    expect(warnings.some(w => w.serviceId === 'ollama')).toBe(true);
    expect(warnings.some(w => w.serviceId === 'mongodb')).toBe(true);
  });
});

describe('checkRemovalImpact', () => {
  it('returns empty array when no services depend on removed service', () => {
    const warnings = checkRemovalImpact(allServices, ['ollama', 'vllm'], 'vllm');
    expect(warnings).toEqual([]);
  });

  it('detects impact when removing a dependency', () => {
    const warnings = checkRemovalImpact(
      allServices, 
      ['ollama', 'open-webui'], 
      'ollama'
    );
    
    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('removal');
    expect(warnings[0].serviceName).toBe('Open WebUI');
  });

  it('detects required dependency removal', () => {
    const warnings = checkRemovalImpact(
      allServices, 
      ['mongodb', 'librechat'], 
      'mongodb'
    );
    
    expect(warnings.length).toBe(1);
    expect(warnings[0].required).toBe(true);
    expect(warnings[0].serviceName).toBe('LibreChat');
  });
});

describe('detectPortConflicts', () => {
  it('returns empty array when no port conflicts exist', () => {
    const conflicts = detectPortConflicts(allServices, ['ollama', 'open-webui']);
    expect(conflicts).toEqual([]);
  });

  it('detects port conflicts between services', () => {
    // LibreChat and Flowise both use port 3000
    const conflicts = detectPortConflicts(allServices, ['librechat', 'flowise']);
    
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].conflict).toBe(true);
    expect(conflicts[0].message).toContain('Port 3000');
    expect(conflicts[0].message).toContain('LibreChat');
    expect(conflicts[0].message).toContain('Flowise');
  });

  it('handles multiple port conflicts', () => {
    // Create a service that conflicts with Ollama
    const conflictingService: Service = {
      ...mockVllm,
      id: 'conflict-service',
      name: 'Conflict Service',
      ports: [{ container: 8000, host: 11434, description: 'Conflicts with Ollama' }],
    };
    
    const conflicts = detectPortConflicts(
      [...allServices, conflictingService], 
      ['ollama', 'conflict-service']
    );
    
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].message).toContain('Port 11434');
  });
});

describe('checkGPURequirements', () => {
  it('returns false when no GPU services are selected', () => {
    const requiresGPU = checkGPURequirements(allServices, ['ollama', 'open-webui']);
    expect(requiresGPU).toBe(false);
  });

  it('returns true when GPU service is selected', () => {
    const requiresGPU = checkGPURequirements(allServices, ['ollama', 'vllm']);
    expect(requiresGPU).toBe(true);
  });

  it('returns true for single GPU service', () => {
    const requiresGPU = checkGPURequirements(allServices, ['vllm']);
    expect(requiresGPU).toBe(true);
  });

  it('handles empty selection', () => {
    const requiresGPU = checkGPURequirements(allServices, []);
    expect(requiresGPU).toBe(false);
  });
});
