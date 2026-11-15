export interface UseCase {
  id: 'chatbot' | 'rag' | 'simple-rag' | 'workflow' | 'custom';
  name: string;
  description: string;
  longDescription: string;
  icon: string; // Lucide icon name
  complexity: 'beginner' | 'intermediate' | 'advanced';
  recommendedServices: string[]; // Service IDs in priority order
  estimatedSetupTime: string;
  idealFor: string[];
  considerations: string[];
}

export const useCases: UseCase[] = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Local ChatGPT-style interface with your own models',
    longDescription: 'Run a complete AI chatbot locally with your choice of LLM models. Perfect for privacy-focused conversations, testing models, or building chat applications without cloud dependencies.',
    icon: 'MessageSquare',
    complexity: 'beginner',
    recommendedServices: ['ollama', 'open-webui'],
    estimatedSetupTime: '5-10 minutes',
    idealFor: [
      'First-time self-hosters',
      'Privacy-conscious users',
      'Model testing and comparison',
      'Offline AI conversations',
    ],
    considerations: [
      'Ollama provides the LLM backend',
      'Open WebUI offers a beautiful chat interface',
      'Start with smaller models (7B) for faster responses',
      'GPU recommended but CPU works for smaller models',
    ],
  },
  {
    id: 'simple-rag',
    name: 'Simple RAG',
    description: 'All-in-one document Q&A with AnythingLLM',
    longDescription: 'Get started with Retrieval-Augmented Generation in minutes. AnythingLLM provides everything you need—document processing, vector storage, and chat interface—in a single container.',
    icon: 'FileText',
    complexity: 'beginner',
    recommendedServices: ['ollama', 'anythingllm'],
    estimatedSetupTime: '5-10 minutes',
    idealFor: [
      'Document Q&A systems',
      'Quick RAG prototypes',
      'Personal knowledge bases',
      'Teams wanting simple setup',
    ],
    considerations: [
      'AnythingLLM includes built-in vector database',
      'No separate Qdrant/Chroma needed',
      'Ollama provides the local LLM backend',
      'Perfect for getting started with RAG',
    ],
  },
  {
    id: 'rag',
    name: 'RAG System',
    description: 'Retrieval-Augmented Generation with vector database',
    longDescription: 'Build a complete RAG pipeline to query your own documents. Combines LLMs, vector search, and workflow orchestration for intelligent document question-answering.',
    icon: 'Database',
    complexity: 'intermediate',
    recommendedServices: ['ollama', 'open-webui', 'qdrant', 'langflow'],
    estimatedSetupTime: '15-30 minutes',
    idealFor: [
      'Document Q&A systems',
      'Knowledge base search',
      'Research assistants',
      'Enterprise document management',
    ],
    considerations: [
      'Qdrant stores document embeddings',
      'LangFlow orchestrates the RAG pipeline',
      'Requires document preprocessing',
      'Vector embeddings take disk space (plan accordingly)',
    ],
  },
  {
    id: 'workflow',
    name: 'Workflow Automation',
    description: 'AI-powered automation and orchestration',
    longDescription: 'Create sophisticated automation workflows with AI integration. Perfect for building agents, automating tasks, and connecting AI to external systems and APIs.',
    icon: 'Workflow',
    complexity: 'intermediate',
    recommendedServices: ['n8n', 'ollama'],
    estimatedSetupTime: '10-20 minutes',
    idealFor: [
      'Task automation',
      'AI agent development',
      'System integrations',
      'Scheduled AI jobs',
    ],
    considerations: [
      'n8n provides visual workflow builder',
      'Ollama optional but enables AI-powered nodes',
      'Can connect to external APIs and services',
      'Great for prototyping AI agents',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Stack',
    description: 'Build your own AI infrastructure from scratch',
    longDescription: 'Start with a blank slate and choose exactly the services you need. For experienced users who know their requirements and want full control over their stack.',
    icon: 'Settings',
    complexity: 'advanced',
    recommendedServices: [],
    estimatedSetupTime: 'Varies',
    idealFor: [
      'Experienced self-hosters',
      'Specific use cases not covered above',
      'Combining multiple patterns',
      'Experimentation and learning',
    ],
    considerations: [
      'You\'ll need to understand service dependencies',
      'Consider resource requirements (CPU/RAM/GPU)',
      'Plan your network ports carefully',
      'Review official docs for each service',
    ],
  },
];

// Helper function to get use case by ID
export function getUseCaseById(id: string): UseCase | undefined {
  return useCases.find(uc => uc.id === id);
}

// Helper function to get recommended services for a use case
export function getRecommendedServices(useCaseId: string): string[] {
  const useCase = getUseCaseById(useCaseId);
  return useCase?.recommendedServices || [];
}
