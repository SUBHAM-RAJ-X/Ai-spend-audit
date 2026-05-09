// CORE LOGIC
import { pricingData, toolCategories, categoryAlternatives, getIndividualPlanCostLegacy, getTeamPlanCostLegacy } from './pricingData';

type ToolName = 'chatgpt' | 'claude' | 'copilot' | 'gemini';
type PlanType = 'plus' | 'pro' | 'individual' | 'team' | 'business' | 'enterprise' | 'api' | 'advanced';
type Category = 'coding' | 'writing' | 'research';

type ToolInput = {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export interface Recommendation {
  type: string;
  description: string;
  savings: number;
  targetPlan?: string;
}

export type AuditResult = {
  name: string;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  recommendation: string;
  savings: number;
  reason: string;
  recommendations: Recommendation[];
};

type AuditOutput = {
  results: AuditResult[];
  totalSavings: number;
  annualSavings: number;
};

// Type guards
function isValidToolName(name: string): name is ToolName {
  return ['chatgpt', 'claude', 'copilot', 'gemini'].includes(name.toLowerCase());
}

function isValidCategory(category: string): category is Category {
  return ['coding', 'writing', 'research'].includes(category);
}

// Plan optimization rules
function optimizePlan(tool: ToolInput): { recommendation: string; savings: number; reason: string } {
  const toolName = tool.name.toLowerCase();
  
  if (!isValidToolName(toolName)) {
    return {
      recommendation: 'Keep current plan',
      savings: 0,
      reason: 'Tool not recognized for optimization'
    };
  }

  // Rule 1: Team plan optimization for low seat counts
  if (tool.plan === 'team' && tool.seats <= 2) {
    const individualCost = getIndividualPlanCostLegacy(toolName);
    const currentCost = tool.monthlySpend;
    const recommendedCost = individualCost * tool.seats;
    
    if (recommendedCost < currentCost) {
      return {
        recommendation: `Switch to ${toolName === 'chatgpt' ? 'Plus' : toolName === 'claude' ? 'Pro' : 'Individual'} plan`,
        savings: currentCost - recommendedCost,
        reason: `Team plan overpriced for ${tool.seats} seat${tool.seats === 1 ? '' : 's'}`
      };
    }
  }

  // Rule 2: Enterprise plan optimization for small teams
  if (tool.plan === 'enterprise' && tool.seats <= 5) {
    const teamCost = getTeamPlanCostLegacy(toolName);
    const recommendedCost = teamCost * tool.seats;
    
    if (recommendedCost < tool.monthlySpend) {
      return {
        recommendation: 'Switch to Team plan',
        savings: tool.monthlySpend - recommendedCost,
        reason: `Enterprise plan unnecessary for ${tool.seats} seat${tool.seats === 1 ? '' : 's'}`
      };
    }
  }

  // Rule 3: API usage optimization
  if (tool.plan === 'api' && tool.monthlySpend > 100) {
    const teamCost = getTeamPlanCostLegacy(toolName);
    
    if (teamCost < tool.monthlySpend) {
      return {
        recommendation: 'Switch to Team plan',
        savings: tool.monthlySpend - teamCost,
        reason: 'Team plan cheaper for high API usage'
      };
    }
  }

  return {
    recommendation: 'Keep current plan',
    savings: 0,
    reason: 'Current plan is optimal'
  };
}

// Alternative tool recommendations
function findAlternatives(tool: ToolInput, allTools: ToolInput[]): { recommendation: string; savings: number; reason: string } {
  const toolName = tool.name.toLowerCase();
  
  if (!isValidToolName(toolName)) {
    return {
      recommendation: 'Keep current tool',
      savings: 0,
      reason: 'Tool not recognized for alternative analysis'
    };
  }

  // Find which categories this tool belongs to
  const categories: Category[] = Object.keys(toolCategories).filter((cat): cat is Category => 
    isValidCategory(cat) && toolCategories[cat].includes(toolName)
  );

  for (const category of categories) {
    const alternatives = categoryAlternatives[category];
    
    // Check if user already has the cheaper alternative
    const hasCheaperAlternative = allTools.some(t => {
      const tName = t.name.toLowerCase();
      return tName === alternatives.cheapest && tName !== toolName;
    });
    
    if (hasCheaperAlternative && isValidToolName(alternatives.cheapest)) {
      const cheapestCost = getIndividualPlanCostLegacy(alternatives.cheapest);
      
      if (cheapestCost < tool.monthlySpend) {
        return {
          recommendation: `Use ${alternatives.cheapest} instead`,
          savings: tool.monthlySpend - cheapestCost,
          reason: `Already have ${alternatives.cheapest} for ${category}`
        };
      }
    }
    
    // Suggest switching to cheaper alternative if not already owned
    if (alternatives.cheapest !== toolName && isValidToolName(alternatives.cheapest)) {
      const cheapestCost = getIndividualPlanCostLegacy(alternatives.cheapest);
      
      if (cheapestCost < tool.monthlySpend) {
        return {
          recommendation: `Switch to ${alternatives.cheapest}`,
          savings: tool.monthlySpend - cheapestCost,
          reason: `${alternatives.cheapest} cheaper for ${category}`
        };
      }
    }
  }

  return {
    recommendation: 'Keep current tool',
    savings: 0,
    reason: 'No cheaper alternatives available'
  };
}

// Main audit function
export function runAudit(tools: ToolInput[]): AuditOutput {
  let totalSavings = 0;

  const results = tools.map((tool) => {
    // Apply plan optimization
    const planOptimization = optimizePlan(tool);
    
    // Apply alternative tool analysis
    const alternativeAnalysis = findAlternatives(tool, tools);
    
    // Choose the optimization with higher savings
    const bestOptimization = planOptimization.savings >= alternativeAnalysis.savings 
      ? planOptimization 
      : alternativeAnalysis;

    totalSavings += bestOptimization.savings;

    // Create recommendations array
    const recommendations: Recommendation[] = [];
    
    if (bestOptimization.savings > 0) {
      recommendations.push({
        type: bestOptimization.recommendation.includes('Switch') ? 'downgrade' : 'optimization',
        description: bestOptimization.recommendation,
        savings: bestOptimization.savings,
        targetPlan: bestOptimization.recommendation.includes('Switch to') ? 
          bestOptimization.recommendation.split('Switch to ')[1].split(' ')[0] : undefined
      });
    }

    // Add annual billing recommendation
    if (tool.monthlySpend > 0) {
      const annualSavings = Math.floor(tool.monthlySpend * 12 * 0.1); // 10% annual discount
      recommendations.push({
        type: 'annual-billing',
        description: 'Switch to annual billing',
        savings: annualSavings
      });
    }

    return {
      name: tool.name,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      seats: tool.seats,
      recommendation: bestOptimization.recommendation,
      savings: bestOptimization.savings,
      reason: bestOptimization.reason,
      recommendations,
    };
  });

  return {
    results,
    totalSavings,
    annualSavings: totalSavings * 12,
  };
}

// Scaling improvements for future:
// 1. Add real-time pricing API integration
// 2. Implement usage-based analytics (tokens, calls, features)
// 3. Add contract term analysis (annual vs monthly)
// 4. Include team role-based optimization
// 5. Add feature comparison matrix
// 6. Implement seasonal usage patterns
// 7. Add compliance and security requirements
// 8. Create ROI calculation based on productivity metrics