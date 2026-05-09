import { runAudit, AuditResult, Recommendation } from '@/lib/auditEngine'

// Mock the pricing data module with simpler structure
jest.mock('@/lib/pricingData', () => ({
  getIndividualPlanCostLegacy: jest.fn((tool: string) => {
    const pricing: Record<string, number> = {
      'chatgpt': 25,
      'claude': 20,
      'copilot': 10,
      'gemini': 20
    }
    return pricing[tool] || 20
  }),
  getTeamPlanCost: jest.fn((tool: string) => {
    const pricing: Record<string, number> = {
      'chatgpt': 30,
      'claude': 25,
      'copilot': 19,
      'gemini': 25
    }
    return pricing[tool] || 25
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
  }),
  toolCategories: {
    coding: ['copilot', 'chatgpt', 'claude'],
    writing: ['chatgpt', 'claude'],
    research: ['chatgpt', 'claude']
  },
  categoryAlternatives: {
    coding: { cheapest: 'copilot' },
    writing: { cheapest: 'claude' },
    research: { cheapest: 'claude' }
  }
}))

describe('Audit Engine - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
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
      expect(typeof auditResult.recommendation).toBe('string')
      expect(typeof auditResult.savings).toBe('number')
      expect(typeof auditResult.reason).toBe('string')
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
      
      // Check each result has proper structure
      result.results.forEach((auditResult: AuditResult) => {
        expect(auditResult.name).toBeDefined()
        expect(auditResult.currentPlan).toBeDefined()
        expect(auditResult.currentSpend).toBeGreaterThan(0)
        expect(Array.isArray(auditResult.recommendations)).toBe(true)
      })
    })

    test('should handle empty tools array', () => {
      const tools: any[] = []

      const result = runAudit(tools)

      expect(result.results).toHaveLength(0)
      expect(result.totalSavings).toBe(0)
      expect(result.annualSavings).toBe(0)
    })
  })

  describe('Recommendations Structure', () => {
    test('should generate recommendations array', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)
      const auditResult = result.results[0] as AuditResult

      expect(Array.isArray(auditResult.recommendations)).toBe(true)
      
      // Should have at least annual billing recommendation
      expect(auditResult.recommendations.length).toBeGreaterThan(0)
      
      // Check recommendation structure
      auditResult.recommendations.forEach((rec: Recommendation) => {
        expect(rec.type).toBeDefined()
        expect(rec.description).toBeDefined()
        expect(rec.savings).toBeGreaterThanOrEqual(0)
        expect(typeof rec.savings).toBe('number')
      })
    })

    test('should include annual billing recommendation', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)
      const auditResult = result.results[0] as AuditResult

      const annualBillingRec = auditResult.recommendations.find(
        (rec: Recommendation) => rec.type === 'annual-billing'
      )
      
      expect(annualBillingRec).toBeDefined()
      expect(annualBillingRec?.description).toBe('Switch to annual billing')
      expect(annualBillingRec?.savings).toBeGreaterThan(0)
    })
  })

  describe('Savings Calculations', () => {
    test('should calculate annual savings correctly', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.annualSavings).toBe(result.totalSavings * 12)
    })

    test('should handle zero monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 0, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBeGreaterThanOrEqual(0)
      expect(result.annualSavings).toBeGreaterThanOrEqual(0)
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
      
      const auditResult = result.results[0] as AuditResult
      expect(auditResult.name).toBe('unknown-tool')
      expect(Array.isArray(auditResult.recommendations)).toBe(true)
    })

    test('should handle very high monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 10000, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
      expect(result.totalSavings).toBeGreaterThanOrEqual(0)
    })

    test('should handle zero seats', () => {
      const tools = [
        { name: 'copilot', plan: 'team', monthlySpend: 50, seats: 0 }
      ]

      const result = runAudit(tools)

      expect(result.results).toHaveLength(1)
    })

    test('should handle negative monthly spend', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: -10, seats: 1 }
      ]

      const result = runAudit(tools)

      expect(result.totalSavings).toBeGreaterThanOrEqual(0)
      expect(result.results).toHaveLength(1)
    })
  })

  describe('Performance', () => {
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
  })
})
