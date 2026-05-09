import { runAudit, AuditResult, Recommendation } from '@/lib/auditEngine'

// Mock the pricing data module
jest.mock('@/lib/pricingData', () => ({
  getIndividualPlanCost: jest.fn((tool: string, plan?: string) => {
    const pricing: Record<string, { monthly: number; annual: number; features: string[] }> = {
      'chatgpt-plus': { monthly: 25, annual: 240, features: ['GPT-4', 'Priority access'] },
      'chatgpt-pro': { monthly: 50, annual: 480, features: ['GPT-4', 'Advanced features'] },
      'claude-pro': { monthly: 20, annual: 192, features: ['Claude 2', 'High usage'] },
      'copilot-individual': { monthly: 10, annual: 96, features: ['GitHub Copilot', 'IDE integration'] },
      'copilot-team': { monthly: 19, annual: 180, features: ['Team management', 'License management'] }
    }
    const key = plan ? `${tool}-${plan}` : `${tool}-plus`
    return pricing[key] || null
  }),
  getTeamPlanCost: jest.fn((tool: string, plan?: string) => {
    const pricing: Record<string, { monthly: number; annual: number; features: string[] }> = {
      'chatgpt-team': { monthly: 30, annual: 288, features: ['Team collaboration', 'Admin controls'] },
      'chatgpt-enterprise': { monthly: 60, annual: 576, features: ['Advanced security', 'Custom integrations'] },
      'copilot-team': { monthly: 19, annual: 180, features: ['Team management', 'License management'] }
    }
    const key = plan ? `${tool}-${plan}` : `${tool}-team`
    return pricing[key] || null
  }),
  getIndividualPlanCostLegacy: jest.fn((tool: string) => {
    const pricing: Record<string, number> = {
      'chatgpt': 25,
      'claude': 20,
      'copilot': 10,
      'gemini': 20
    }
    return pricing[tool] || 20
  }),
  getToolCategory: jest.fn((tool: string) => {
    const categories: Record<string, string> = {
      chatgpt: 'text-generation',
      claude: 'text-generation',
      copilot: 'code-assistant'
    }
    return categories[tool] || 'other'
  }),
  getAlternativeTools: jest.fn((tool: string) => {
    const alternatives: Record<string, string[]> = {
      chatgpt: ['claude'],
      claude: ['chatgpt'],
      copilot: []
    }
    return alternatives[tool] || []
  })
}))

describe('Audit Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Audit Functionality', () => {
    test('should run audit with single tool', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result).toBeDefined()
      expect(result.results).toHaveLength(1)
      expect(result.totalSavings).toBeGreaterThanOrEqual(0)
      expect(result.annualSavings).toBeGreaterThanOrEqual(0)
      
      // Check structure
      const auditResult = result.results[0] as AuditResult
      expect(auditResult.name).toBe('chatgpt')
      expect(auditResult.currentPlan).toBe('plus')
      expect(auditResult.currentSpend).toBe(25)
      expect(Array.isArray(auditResult.recommendations)).toBe(true)
    })

    test('should run audit with multiple tools', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 },
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 },
        { name: 'copilot', plan: 'individual', monthlySpend: 10, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(3)
      expect(result.totalSavings).toBeGreaterThanOrEqual(0)
      expect(result.annualSavings).toBeGreaterThanOrEqual(0)
    })

    test('should handle empty tools array', () => {
      const tools: any[] = []

      const result = runAudit(tools)

      expect(result.results).toHaveLength(0)
      expect(result.totalSavings).toBe(0)
      expect(result.annualSavings).toBe(0)
    })
  })

  describe('Savings Calculations', () => {
    test('should calculate potential savings for overpriced plans', () => {
      const tools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 } // Overpriced
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBeGreaterThan(0)
      expect(result.results[0].recommendations).toHaveLength(1)
      expect(result.results[0].recommendations[0].savings).toBeGreaterThan(0)
    })

    test('should calculate zero savings for correctly priced plans', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 } // Correct price
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBe(0)
      expect(result.results[0].recommendations).toHaveLength(0)
    })

    test('should calculate annual savings correctly', () => {
      const tools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 } // Should save $10/month
      ]

      const result = runAudit(tools)

      expect(result.annualSavings).toBe(result.totalSavings * 12)
    })

    test('should handle team plan calculations', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 25, seats: 2 } // Overpriced team plan
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
      expect(result.results[0].recommendations).toBeDefined()
    })
  })

  describe('Recommendation Generation', () => {
    test('should generate downgrade recommendations for overpriced plans', () => {
      const tools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results[0].recommendations).toHaveLength(1)
      expect(result.results[0].recommendations[0].type).toBe('downgrade')
      expect(result.results[0].recommendations[0].targetPlan).toBeDefined()
    })

    test('should generate annual billing recommendations', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)

      const annualBillingRec = result.results[0].recommendations.find(
        rec => rec.type === 'annual-billing'
      )
      expect(annualBillingRec).toBeDefined()
      expect(annualBillingRec?.savings).toBe(60) // $25 * 12 - $240 = $60
    })

    test('should generate alternative tool recommendations', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 30, seats: 1 }
      ]

      const result = runAudit(tools)

      const alternativeRec = result.results[0].recommendations.find(
        rec => rec.type === 'alternative-tool'
      )
      expect(alternativeRec).toBeDefined()
    })

    test('should generate team optimization recommendations', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 50, seats: 3 }
      ]

      const result = runAudit(tools)

      const teamRec = result.results[0].recommendations.find(
        rec => rec.type === 'team-optimization'
      )
      expect(teamRec).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    test('should handle unknown tools gracefully', () => {
      const tools = [
        { name: 'unknown-tool', plan: 'basic', monthlySpend: 50, seats: 1 }
      ]

      expect(() => runAudit(tools)).not.toThrow()
      
      const result = runAudit(tools)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].recommendations).toHaveLength(0) // No recommendations for unknown tools
    })

    test('should handle unknown plans gracefully', () => {
      const tools = [
        { name: 'chatgpt', plan: 'unknown-plan', monthlySpend: 50, seats: 1 }
      ]

      expect(() => runAudit(tools)).not.toThrow()
      
      const result = runAudit(tools)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].recommendations).toHaveLength(0)
    })

    test('should handle zero monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 0, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBe(0)
      expect(result.results).toHaveLength(1)
    })

    test('should handle very high monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 10000, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBeGreaterThan(0)
      expect(result.results).toHaveLength(1)
    })

    test('should handle zero seats', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 50, seats: 0 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
    })

    test('should handle very high seat count', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 1000, seats: 1000 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
    })

    test('should handle negative monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: -10, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBe(0)
      expect(result.results).toHaveLength(1)
    })

    test('should handle decimal monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 24.99, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
      expect(typeof result.totalSavings).toBe('number')
    })
  })

  describe('Data Validation', () => {
    test('should validate tool data structure', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results[0]).toHaveProperty('name')
      expect(result.results[0]).toHaveProperty('currentPlan')
      expect(result.results[0]).toHaveProperty('currentSpend')
      expect(result.results[0]).toHaveProperty('recommendations')
      expect(Array.isArray(result.results[0].recommendations)).toBe(true)
    })

    test('should validate recommendation structure', () => {
      const tools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 }
      ]

      const result = runAudit(tools)
      const recommendation = result.results[0].recommendations[0]

      expect(recommendation).toHaveProperty('type')
      expect(recommendation).toHaveProperty('description')
      expect(recommendation).toHaveProperty('savings')
      expect(typeof recommendation.savings).toBe('number')
    })

    test('should handle malformed tool data', () => {
      const malformedTools = [
        { name: '', plan: '', monthlySpend: 0, seats: 0 },
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ] as any

      expect(() => runAudit(malformedTools)).not.toThrow()
      
      const result = runAudit(malformedTools)
      expect(result.results).toHaveLength(2)
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large number of tools efficiently', () => {
      const tools = Array.from({ length: 100 }, (_, i) => ({
        name: 'chatgpt',
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      }))

      const startTime = performance.now()
      const result = runAudit(tools)
      const endTime = performance.now()

      expect(result.results).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete in under 1 second
    })

    test('should handle tools with many seats efficiently', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 1900, seats: 100 }
      ]

      const startTime = performance.now()
      const result = runAudit(tools)
      const endTime = performance.now()

      expect(result.results).toHaveLength(1)
      expect(endTime - startTime).toBeLessThan(100) // Should complete very quickly
    })
  })

  describe('Integration with Pricing Data', () => {
    test('should use correct pricing data for recommendations', () => {
      const tools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 }
      ]

      const result = runAudit(tools)

      // Should recommend downgrading to 'plus' plan which costs $50
      const downgradeRec = result.results[0].recommendations.find(
        rec => rec.type === 'downgrade'
      )
      expect(downgradeRec?.targetPlan).toBe('plus')
      expect(downgradeRec?.savings).toBe(10) // $60 - $50 = $10
    })

    test('should handle missing pricing data gracefully', () => {
      const tools = [
        { name: 'nonexistent-tool', plan: 'basic', monthlySpend: 50, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
      expect(result.results[0].recommendations).toHaveLength(0)
    })
  })
})
