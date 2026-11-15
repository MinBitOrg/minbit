import { describe, it, expect } from 'vitest';
import { 
  generateDockerCompose, 
  generateEnvFile, 
  generateReadme, 
  getStartupOrder 
} from './configGenerator';
import { Service } from '@/types/service';

// Mock service data for testing
const mockOllama: Service = {
  id: 'ollama',
  name: 'Ollama',
  category: 'llm-runners',
  description: 'Get up and running with large language models locally',
  longDescription: 'Ollama makes it easy to run open-source LLMs.',
  complexity: 'beginner',
  tags: ['popular', 'recommended', 'cpu-only'],
  dockerImage: 'ollama/ollama',
  dockerImageTag: 'latest',
  ports: [{ container: 11434, host: 11434, description: 'Ollama API' }],
  healthCheck: {
    test: ['CMD', 'curl', '-f', 'http://localhost:11434/api/tags'],
    interval: '30s',
    timeout: '10s',
    retries: 3,
    startPeriod: '60s',
  },
  volumes: [{ source: 'ollama-data', target: '/root/.ollama', description: 'Model storage' }],
  internalApiUrl: 'http://ollama:11434',
  resourceRequirements: { minRam: '4GB', recommendedRam: '16GB', minCpu: 4, diskSpace: '20GB' },
  dependencies: [],
  configOptions: [{ key: 'OLLAMA_MODELS', label: 'Models', type: 'text', default: 'llama3.2', description: 'Models to pull' }],
  environmentVariables: {},
  officialDocs: 'https://ollama.ai/docs',
  githubRepo: 'https://github.com/ollama/ollama',
  postDeployInstructions: '### Ollama First Steps\n\n1. Pull a model: `docker exec ollama ollama pull llama3.2`',
};

const mockOpenWebUI: Service = {
  id: 'open-webui',
  name: 'Open WebUI',
  category: 'chat-uis',
  description: 'User-friendly WebUI for LLMs',
  complexity: 'beginner',
  tags: ['popular', 'recommended', 'cpu-only'],
  dockerImage: 'ghcr.io/open-webui/open-webui',
  dockerImageTag: 'main',
  ports: [{ container: 8080, host: 3000, description: 'Web interface' }],
  healthCheck: {
    test: ['CMD', 'curl', '-f', 'http://localhost:8080/health'],
    interval: '30s',
    timeout: '10s',
    retries: 3,
    startPeriod: '30s',
  },
  volumes: [
    { source: 'webui-data', target: '/app/backend/data', description: 'User data' },
  ],
  internalApiUrl: 'http://open-webui:8080',
  connectsTo: [{ serviceId: 'ollama', envVar: 'OLLAMA_BASE_URL' }],
  dependencies: [
    { serviceId: 'ollama', required: false, description: 'Recommended LLM backend' },
  ],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://docs.openwebui.com',
  githubRepo: 'https://github.com/open-webui/open-webui',
};

const mockQdrant: Service = {
  id: 'qdrant',
  name: 'Qdrant',
  category: 'vector-dbs',
  description: 'Vector search engine',
  complexity: 'intermediate',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'qdrant/qdrant',
  dockerImageTag: 'latest',
  ports: [
    { container: 6333, host: 6333, description: 'HTTP API' },
    { container: 6334, host: 6334, description: 'gRPC API' },
  ],
  healthCheck: {
    test: ['CMD', 'curl', '-f', 'http://localhost:6333/readyz'],
    interval: '30s',
    timeout: '10s',
    retries: 3,
  },
  volumes: [
    { source: 'qdrant-data', target: '/qdrant/storage', description: 'Vector storage' },
  ],
  internalApiUrl: 'http://qdrant:6333',
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://qdrant.tech/documentation',
  githubRepo: 'https://github.com/qdrant/qdrant',
};

const mockVllm: Service = {
  id: 'vllm',
  name: 'vLLM',
  category: 'llm-runners',
  description: 'High-throughput inference engine',
  complexity: 'advanced',
  tags: ['gpu-required', 'popular'],
  dockerImage: 'vllm/vllm-openai',
  dockerImageTag: 'latest',
  ports: [{ container: 8000, host: 8000, description: 'API' }],
  healthCheck: {
    test: ['CMD', 'curl', '-f', 'http://localhost:8000/health'],
    interval: '30s',
    timeout: '10s',
    retries: 3,
    startPeriod: '120s',
  },
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://docs.vllm.ai',
  githubRepo: 'https://github.com/vllm-project/vllm',
};

const mockLmStudio: Service = {
  id: 'lm-studio',
  name: 'LM Studio',
  category: 'llm-runners',
  description: 'Desktop application for running LLMs',
  complexity: 'beginner',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'N/A',
  dockerImageTag: 'N/A',
  isExternalService: true,
  externalServiceNote: 'LM Studio is a desktop application, not a Docker service.',
  ports: [{ container: 1234, host: 1234, description: 'API' }],
  internalApiUrl: 'http://host.docker.internal:1234',
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://lmstudio.ai/docs',
  githubRepo: 'https://github.com/lmstudio-ai/lmstudio.js',
};

// Mock service with required dependency
const mockLibreChat: Service = {
  id: 'librechat',
  name: 'LibreChat',
  category: 'chat-uis',
  description: 'Enhanced ChatGPT clone',
  complexity: 'intermediate',
  tags: ['popular', 'cpu-only'],
  dockerImage: 'librechat/librechat',
  dockerImageTag: 'latest',
  ports: [{ container: 3000, host: 3000, description: 'Web interface' }],
  healthCheck: {
    test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health'],
    interval: '30s',
    timeout: '10s',
    retries: 3,
    startPeriod: '60s',
  },
  dependencies: [
    { serviceId: 'mongodb', required: true, description: 'MongoDB database' },
  ],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://www.librechat.ai/docs',
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
  healthCheck: {
    test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"],
    interval: '30s',
    timeout: '10s',
    retries: 3,
  },
  volumes: [
    { source: 'mongodb-data', target: '/data/db', description: 'Database files' },
  ],
  dependencies: [],
  configOptions: [],
  environmentVariables: {},
  officialDocs: 'https://www.mongodb.com/docs',
  githubRepo: 'https://github.com/mongodb/mongo',
};

describe('generateDockerCompose', () => {
  it('generates valid YAML with single service', () => {
    const result = generateDockerCompose([mockOllama], {}, 'test-project');
    
    expect(result).toContain('version: "3.8"');
    expect(result).toContain('ollama:');
    expect(result).toContain('image: ollama/ollama:latest');
    expect(result).toContain('container_name: test-project-ollama');
    expect(result).toContain('restart: unless-stopped');
  });

  it('includes health checks from service data', () => {
    const result = generateDockerCompose([mockOllama], {}, 'test-project');
    
    expect(result).toContain('healthcheck:');
    expect(result).toContain('interval: 30s');
    expect(result).toContain('timeout: 10s');
    expect(result).toContain('retries: 3');
  });

  it('includes volumes from service data', () => {
    const result = generateDockerCompose([mockOllama], {}, 'test-project');
    
    expect(result).toContain('volumes:');
    expect(result).toContain('ollama-data:/root/.ollama');
  });

  it('includes port mappings', () => {
    const result = generateDockerCompose([mockOllama], {}, 'test-project');
    
    expect(result).toContain('ports:');
    expect(result).toContain('"11434:11434"');
  });

  it('creates network configuration', () => {
    const result = generateDockerCompose([mockOllama], {}, 'test-project');
    
    expect(result).toContain('networks:');
    expect(result).toContain('test-project-network:');
    expect(result).toContain('driver: bridge');
  });

  it('applies service configs to environment', () => {
    const configs = {
      ollama: { OLLAMA_MODELS: 'mistral' },
    };
    const result = generateDockerCompose([mockOllama], configs, 'test-project');
    
    expect(result).toContain('OLLAMA_MODELS: mistral');
  });

  it('adds GPU support for gpu-required services', () => {
    const result = generateDockerCompose([mockVllm], {}, 'test-project');
    
    expect(result).toContain('deploy:');
    expect(result).toContain('resources:');
    expect(result).toContain('driver: nvidia');
    expect(result).toContain('capabilities:');
    expect(result).toContain('gpu');
  });

  it('excludes external services from docker-compose', () => {
    const result = generateDockerCompose([mockOllama, mockLmStudio], {}, 'test-project');
    
    expect(result).toContain('ollama:');
    expect(result).not.toContain('lm-studio:');
  });

  it('adds service discovery URLs based on connectsTo', () => {
    const result = generateDockerCompose(
      [mockOllama, mockOpenWebUI], 
      {}, 
      'test-project'
    );
    
    expect(result).toContain('OLLAMA_BASE_URL: http://ollama:11434');
  });

  it('adds depends_on with service_healthy for dependencies with health checks', () => {
    const result = generateDockerCompose(
      [mockMongoDB, mockLibreChat], 
      {}, 
      'test-project'
    );
    
    expect(result).toContain('depends_on:');
    expect(result).toContain('mongodb:');
    expect(result).toContain('condition: service_healthy');
  });

  it('handles multiple services correctly', () => {
    const result = generateDockerCompose(
      [mockOllama, mockOpenWebUI, mockQdrant], 
      {}, 
      'test-project'
    );
    
    expect(result).toContain('ollama:');
    expect(result).toContain('open-webui:');
    expect(result).toContain('qdrant:');
  });
});

describe('getStartupOrder', () => {
  it('returns services in dependency order', () => {
    const services = [mockLibreChat, mockMongoDB];
    const order = getStartupOrder(services, ['librechat', 'mongodb']);
    
    // MongoDB should come before LibreChat
    const mongoIndex = order.indexOf('mongodb');
    const libreChatIndex = order.indexOf('librechat');
    expect(mongoIndex).toBeLessThan(libreChatIndex);
  });

  it('handles services without dependencies', () => {
    const services = [mockOllama, mockQdrant];
    const order = getStartupOrder(services, ['ollama', 'qdrant']);
    
    expect(order).toContain('ollama');
    expect(order).toContain('qdrant');
    expect(order.length).toBe(2);
  });

  it('handles missing dependencies gracefully', () => {
    // LibreChat depends on mongodb, but mongodb is not in selected
    const order = getStartupOrder([mockLibreChat], ['librechat']);
    
    expect(order).toContain('librechat');
    expect(order.length).toBe(1);
  });
});

describe('generateEnvFile', () => {
  it('generates header with date', () => {
    const result = generateEnvFile([mockOllama], {});
    
    expect(result).toContain('# MinBit Portal - Stack Configuration');
    expect(result).toContain('# Generated:');
  });

  it('includes service config options', () => {
    const result = generateEnvFile([mockOllama], {});
    
    expect(result).toContain('# Ollama Configuration');
    expect(result).toContain('OLLAMA_MODELS=llama3.2');
  });

  it('applies custom config values', () => {
    const configs = {
      ollama: { OLLAMA_MODELS: 'mistral,codellama' },
    };
    const result = generateEnvFile([mockOllama], configs);
    
    expect(result).toContain('OLLAMA_MODELS=mistral,codellama');
  });

  it('excludes external services', () => {
    const result = generateEnvFile([mockOllama, mockLmStudio], {});
    
    expect(result).toContain('Ollama');
    expect(result).not.toContain('LM Studio');
  });

  it('marks secret fields with warning', () => {
    const serviceWithSecret: Service = {
      ...mockOllama,
      configOptions: [
        {
          key: 'API_KEY',
          label: 'API Key',
          type: 'text',
          default: '',
          description: 'Your API key',
          required: true,
        },
      ],
    };
    const result = generateEnvFile([serviceWithSecret], {});
    
    expect(result).toContain('⚠️ CHANGE THIS');
  });
});

describe('generateReadme', () => {
  it('includes project name and metadata', () => {
    const result = generateReadme([mockOllama], 'my-ai-stack', 'chatbot');
    
    expect(result).toContain('# my-ai-stack');
    expect(result).toContain('**Use Case:** Chatbot');
    expect(result).toContain('**Services:** Ollama');
  });

  it('includes quick start commands', () => {
    const result = generateReadme([mockOllama], 'test', null);
    
    expect(result).toContain('## Quick Start');
    expect(result).toContain('docker compose up -d');
    expect(result).toContain('docker compose logs -f');
  });

  it('includes service details with ports', () => {
    const result = generateReadme([mockOllama], 'test', null);
    
    expect(result).toContain('### Ollama');
    expect(result).toContain('http://localhost:11434');
  });

  it('includes resource requirements', () => {
    const result = generateReadme([mockOllama], 'test', null);
    
    expect(result).toContain('**Min RAM** | 4GB');
    expect(result).toContain('recommended: 16GB');
  });

  it('includes GPU prerequisites for GPU services', () => {
    const result = generateReadme([mockVllm], 'test', null);
    
    expect(result).toContain('NVIDIA GPU with CUDA support');
    expect(result).toContain('NVIDIA Container Toolkit');
  });

  it('includes external services section when present', () => {
    const result = generateReadme([mockOllama, mockLmStudio], 'test', null);
    
    expect(result).toContain('## External Services');
    expect(result).toContain('LM Studio');
    expect(result).toContain('not Docker containers');
  });

  it('includes troubleshooting section', () => {
    const result = generateReadme([mockOllama], 'test', null);
    
    expect(result).toContain('## Troubleshooting');
    expect(result).toContain("Services won't start");
  });

  it('includes backup commands', () => {
    const result = generateReadme([mockOllama], 'test', null);
    
    expect(result).toContain('## Backup & Recovery');
    expect(result).toContain('docker volume ls');
  });
});
