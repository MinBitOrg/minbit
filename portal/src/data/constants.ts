import { ServiceCategory, ServiceComplexity } from '@/types/service';

// Category display labels (with "all" for filtering)
export const CATEGORY_LABELS: Record<ServiceCategory | 'all', string> = {
  all: 'All Services',
  'llm-runners': 'LLM Runners',
  'chat-uis': 'Chat UIs',
  'workflow-agents': 'Workflow Agents',
  'vector-dbs': 'Vector Databases',
};

// Singular forms for context (e.g., "This is a Chat UI")
export const CATEGORY_LABELS_SINGULAR: Record<ServiceCategory, string> = {
  'llm-runners': 'LLM Runner',
  'chat-uis': 'Chat UI',
  'workflow-agents': 'Workflow Agent',
  'vector-dbs': 'Vector Database',
};

// Complexity badge styling - WCAG AA compliant colors
export const COMPLEXITY_COLORS: Record<ServiceComplexity, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

// Complexity text colors for non-badge contexts
export const COMPLEXITY_TEXT_COLORS: Record<ServiceComplexity, string> = {
  beginner: 'text-emerald-600 dark:text-emerald-400',
  intermediate: 'text-amber-600 dark:text-amber-400',
  advanced: 'text-rose-600 dark:text-rose-400',
};

// Icon mapping for categories (Lucide icon names)
export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  'llm-runners': 'Cpu',
  'chat-uis': 'MessageSquare',
  'workflow-agents': 'Workflow',
  'vector-dbs': 'Database',
};

// Use case icon mapping
export const USE_CASE_ICONS: Record<string, string> = {
  MessageSquare: 'MessageSquare',
  Database: 'Database',
  Workflow: 'Workflow',
  Settings: 'Settings',
  FileText: 'FileText',
};

// Service count for documentation/display
export const TOTAL_SERVICES = 18;
