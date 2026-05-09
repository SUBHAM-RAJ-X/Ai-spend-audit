// Pricing info
export type ToolName = 'chatgpt' | 'claude' | 'copilot' | 'gemini' | 'cursor' | 'openai-api' | 'anthropic-api';

export interface PricingPlan {
  monthly: number;
  annual: number;
  features: string[];
}

export type ToolData = {
  [key in ToolName]: {
    individual?: Record<string, PricingPlan>;
    team?: Record<string, PricingPlan>;
  };
};

interface ChatGPTPricing {
  plus: number;
  team: number;
  enterprise: number;
  api: number;
}

interface ClaudePricing {
  pro: number;
  team: number;
  enterprise: number;
  api: number;
}

interface CopilotPricing {
  individual: number;
  business: number;
  enterprise: number;
}

interface GeminiPricing {
  pro: number;
  advanced: number;
  ultra: number;
  api: number;
}

interface CursorPricing {
  pro: number;
  business: number;
}

interface OpenAIAPIPricing {
  api: number;
}

interface AnthropicAPIPricing {
  api: number;
}

interface PricingData {
  chatgpt: ChatGPTPricing;
  claude: ClaudePricing;
  copilot: CopilotPricing;
  gemini: GeminiPricing;
  cursor: CursorPricing;
  'openai-api': OpenAIAPIPricing;
  'anthropic-api': AnthropicAPIPricing;
}

export const pricingData: PricingData = {
  chatgpt: {
    plus: 20,
    team: 25,
    enterprise: 60,
    api: 20 // per 1M tokens
  },
  claude: {
    pro: 20,
    team: 25,
    enterprise: 60,
    api: 15 // per 1M tokens
  },
  copilot: {
    individual: 10,
    business: 19,
    enterprise: 39
  },
  gemini: {
    pro: 20,
    advanced: 20,
    ultra: 40,
    api: 7 // per 1M tokens
  },
  cursor: {
    pro: 20,
    business: 40
  },
  'openai-api': {
    api: 20 // per 1M tokens
  },
  'anthropic-api': {
    api: 15 // per 1M tokens
  }
};

export const toolCategories = {
  coding: ['copilot', 'chatgpt', 'claude', 'gemini', 'cursor'],
  writing: ['chatgpt', 'claude', 'gemini'],
  research: ['chatgpt', 'claude', 'gemini'],
  api: ['openai-api', 'anthropic-api']
};

export const categoryAlternatives = {
  coding: {
    primary: 'copilot',
    alternatives: ['chatgpt', 'claude'],
    cheapest: 'copilot'
  },
  writing: {
    primary: 'chatgpt',
    alternatives: ['claude', 'gemini'],
    cheapest: 'gemini'
  },
  research: {
    primary: 'chatgpt',
    alternatives: ['claude', 'gemini'],
    cheapest: 'gemini'
  }
};

// Helper function to get individual plan cost based on tool type and plan
export function getIndividualPlanCost(toolName: string, plan?: string): PricingPlan | null {
  const pricingPlans: Record<string, PricingPlan> = {
    'chatgpt-basic': { monthly: 20, annual: 192, features: ['GPT-3.5', 'Limited usage'] },
    'chatgpt-plus': { monthly: 25, annual: 240, features: ['GPT-4', 'Priority access'] },
    'chatgpt-pro': { monthly: 50, annual: 480, features: ['GPT-4', 'Advanced features'] },
    'claude-pro': { monthly: 20, annual: 192, features: ['Claude 2', 'High usage'] },
    'claude-business': { monthly: 30, annual: 288, features: ['Claude 2', 'Team features'] },
    'copilot-individual': { monthly: 10, annual: 96, features: ['GitHub Copilot', 'IDE integration'] },
    'cursor-pro': { monthly: 20, annual: 192, features: ['Advanced AI', 'Code completion'] },
    'gemini-pro': { monthly: 20, annual: 192, features: ['Gemini Pro', 'Text generation'] }
  };

  const key = plan ? `${toolName}-${plan}` : `${toolName}-plus`;
  return pricingPlans[key] || null;
}

// Helper function to get team plan cost based on tool type and plan
export function getTeamPlanCost(toolName: string, plan?: string): PricingPlan | null {
  const pricingPlans: Record<string, PricingPlan> = {
    'chatgpt-team': { monthly: 30, annual: 288, features: ['Team collaboration', 'Admin controls'] },
    'chatgpt-enterprise': { monthly: 60, annual: 576, features: ['Advanced security', 'Custom integrations'] },
    'claude-team': { monthly: 25, annual: 240, features: ['Team management', 'Usage analytics'] },
    'copilot-team': { monthly: 19, annual: 180, features: ['Team management', 'License management'] },
    'copilot-enterprise': { monthly: 39, annual: 374, features: ['Advanced security', 'Compliance'] },
    'cursor-team': { monthly: 25, annual: 240, features: ['Team collaboration', 'Shared workspace'] }
  };

  const key = plan ? `${toolName}-${plan}` : `${toolName}-team`;
  return pricingPlans[key] || null;
}

// Helper function to get tool category
export function getToolCategory(toolName: string): string {
  const categories: Record<string, string> = {
    'chatgpt': 'text-generation',
    'claude': 'text-generation',
    'copilot': 'code-assistant',
    'cursor': 'code-assistant',
    'gemini': 'text-generation',
    'openai-api': 'api-platform',
    'anthropic-api': 'api-platform'
  };
  return categories[toolName] || 'other';
}

// Helper function to get alternative tools
export function getAlternativeTools(toolName: string): string[] {
  const alternatives: Record<string, string[]> = {
    'chatgpt': ['claude', 'gemini'],
    'claude': ['chatgpt', 'gemini'],
    'copilot': ['cursor'],
    'cursor': ['copilot'],
    'gemini': ['chatgpt', 'claude']
  };
  return alternatives[toolName] || [];
}

// Helper function to get individual plan cost based on tool type (legacy)
export function getIndividualPlanCostLegacy(toolName: ToolName): number {
  switch (toolName) {
    case 'chatgpt':
      return pricingData.chatgpt.plus;
    case 'claude':
      return pricingData.claude.pro;
    case 'copilot':
      return pricingData.copilot.individual;
    case 'gemini':
      return pricingData.gemini.pro;
    case 'cursor':
      return pricingData.cursor.pro;
    case 'openai-api':
      return pricingData['openai-api'].api;
    case 'anthropic-api':
      return pricingData['anthropic-api'].api;
    default:
      return 20;
  }
}

// Helper function to get team plan cost based on tool type (legacy)
export function getTeamPlanCostLegacy(toolName: ToolName): number {
  switch (toolName) {
    case 'chatgpt':
      return pricingData.chatgpt.team;
    case 'claude':
      return pricingData.claude.team;
    case 'copilot':
      return pricingData.copilot.business; // Use business as team equivalent
    case 'gemini':
      return 25; // Gemini doesn't have team, use default
    case 'cursor':
      return pricingData.cursor.business;
    case 'openai-api':
      return pricingData['openai-api'].api;
    case 'anthropic-api':
      return pricingData['anthropic-api'].api;
    default:
      return 25;
  }
}