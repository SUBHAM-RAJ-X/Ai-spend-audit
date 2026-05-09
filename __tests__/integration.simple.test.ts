import { runAudit } from '@/lib/auditEngine'
import { saveToStorage, getFromStorage, clearStorage } from '@/utils/storage'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock pricing data
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

describe('Integration Tests - Simple', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup localStorage mock to actually store data
    let storage: Record<string, string> = {}
    localStorageMock.getItem = jest.fn((key: string) => storage[key] || null)
    localStorageMock.setItem = jest.fn((key: string, value: string) => {
      storage[key] = value
    })
    localStorageMock.removeItem = jest.fn((key: string) => {
      delete storage[key]
    })
    localStorageMock.clear = jest.fn(() => {
      storage = {}
    })
  })

  describe('Full Audit Workflow', () => {
    test('should complete full audit workflow from input to results', () => {
      // Step 1: User inputs tools
      const inputTools = [
        { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 },
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 },
        { name: 'copilot', plan: 'team', monthlySpend: 25, seats: 2 }
      ]

      // Step 2: Save to storage
      saveToStorage(inputTools)

      // Step 3: Retrieve from storage
      const storedTools = getFromStorage()
      expect(storedTools).toEqual(inputTools)

      // Step 4: Run audit
      const auditResults = runAudit(storedTools!)

      // Step 5: Validate results
      expect(auditResults.results).toHaveLength(3)
      expect(auditResults.totalSavings).toBeGreaterThanOrEqual(0)
      expect(auditResults.annualSavings).toBeGreaterThanOrEqual(0)

      // Step 6: Validate specific tool results
      const chatgptResult = auditResults.results.find(r => r.name === 'chatgpt')
      expect(chatgptResult).toBeDefined()
      expect(chatgptResult?.currentPlan).toBe('pro')
      expect(chatgptResult?.currentSpend).toBe(60)
    })

    test('should handle workflow with no tools', () => {
      // Step 1: Start with empty tools
      const emptyTools: any[] = []

      // Step 2: Save empty array
      saveToStorage(emptyTools)

      // Step 3: Retrieve and run audit
      const storedTools = getFromStorage()
      const auditResults = runAudit(storedTools!)

      // Step 4: Validate empty results
      expect(auditResults.results).toHaveLength(0)
      expect(auditResults.totalSavings).toBe(0)
      expect(auditResults.annualSavings).toBe(0)
    })

    test('should handle workflow with single tool', () => {
      const singleTool = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      saveToStorage(singleTool)
      const storedTools = getFromStorage()
      const auditResults = runAudit(storedTools!)

      expect(auditResults.results).toHaveLength(1)
      expect(auditResults.results[0].name).toBe('chatgpt')
    })
  })

  describe('Storage and Audit Integration', () => {
    test('should persist audit data across multiple operations', () => {
      // Initial save
      const tools1 = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]
      saveToStorage(tools1)

      // Add more tools
      const tools2 = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 },
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
      ]
      saveToStorage(tools2)

      // Verify latest data is stored
      const storedTools = getFromStorage()
      expect(storedTools).toEqual(tools2)

      // Run audit on stored data
      const auditResults = runAudit(storedTools!)
      expect(auditResults.results).toHaveLength(2)
    })

    test('should handle storage corruption gracefully', () => {
      // Save valid data first
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]
      saveToStorage(tools)

      // Simulate retrieval failure
      localStorageMock.getItem = jest.fn().mockReturnValue('invalid json')

      const storedTools = getFromStorage()
      expect(storedTools).toBeNull()

      // Should handle null input gracefully
      const auditResults = runAudit([])
      expect(auditResults.results).toHaveLength(0)
    })
  })

  describe('Complex Scenarios', () => {
    test('should handle enterprise scenario with many tools', () => {
      const enterpriseTools = [
        { name: 'chatgpt', plan: 'enterprise', monthlySpend: 60, seats: 5 },
        { name: 'claude', plan: 'business', monthlySpend: 30, seats: 3 },
        { name: 'copilot', plan: 'enterprise', monthlySpend: 39, seats: 4 },
        { name: 'cursor', plan: 'pro', monthlySpend: 40, seats: 2 },
        { name: 'gemini', plan: 'pro', monthlySpend: 30, seats: 3 }
      ]

      saveToStorage(enterpriseTools)
      const storedTools = getFromStorage()
      const auditResults = runAudit(storedTools!)

      expect(auditResults.results).toHaveLength(5)
      expect(auditResults.totalSavings).toBeGreaterThanOrEqual(0)
      
      // Should have recommendations for optimization
      const totalRecommendations = auditResults.results.reduce(
        (sum, result) => sum + result.recommendations.length, 0
      )
      expect(totalRecommendations).toBeGreaterThan(0)
    })

    test('should handle mixed individual and team plans', () => {
      const mixedTools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }, // Individual
        { name: 'copilot', plan: 'team', monthlySpend: 38, seats: 2 }, // Team
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 } // Individual
      ]

      const auditResults = runAudit(mixedTools)

      expect(auditResults.results).toHaveLength(3)
      
      // Should have different types of recommendations
      const recommendationTypes = new Set()
      auditResults.results.forEach(result => {
        result.recommendations.forEach(rec => {
          recommendationTypes.add(rec.type)
        })
      })
      
      expect(recommendationTypes.size).toBeGreaterThan(0)
    })

    test('should handle scenario with no optimization opportunities', () => {
      const optimizedTools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }, // Optimal price
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }, // Optimal price
        { name: 'copilot', plan: 'individual', monthlySpend: 10, seats: 1 } // Optimal price
      ]

      const auditResults = runAudit(optimizedTools)

      expect(auditResults.totalSavings).toBeGreaterThanOrEqual(0)
      
      // Should still have annual billing recommendations
      const annualBillingRecs = auditResults.results.flatMap(result => 
        result.recommendations.filter(rec => rec.type === 'annual-billing')
      )
      expect(annualBillingRecs.length).toBe(3)
    })
  })

  describe('Error Handling Integration', () => {
    test('should handle malformed data in storage', () => {
      // Save malformed data directly to storage
      localStorageMock.setItem('ai-spend-audit-tools', '{"invalid": "json"}')

      const storedTools = getFromStorage()
      expect(storedTools).toBeNull()

      // Should handle null input gracefully
      const auditResults = runAudit([])
      expect(auditResults.results).toHaveLength(0)
    })

    test('should handle partial data corruption', () => {
      const partialCorruptedTools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 },
        { name: '', plan: '', monthlySpend: 0, seats: 0 }, // Corrupted entry
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
      ] as any

      expect(() => runAudit(partialCorruptedTools)).not.toThrow()
      
      const auditResults = runAudit(partialCorruptedTools)
      expect(auditResults.results).toHaveLength(3)
    })

    test('should handle concurrent storage operations', () => {
      const tools1 = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]
      const tools2 = [
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
      ]

      // Simulate concurrent saves
      saveToStorage(tools1)
      saveToStorage(tools2)

      const storedTools = getFromStorage()
      expect(storedTools).toEqual(tools2) // Last save should win
    })
  })

  describe('Performance Integration', () => {
    test('should handle large dataset efficiently', () => {
      const largeTools = Array.from({ length: 100 }, (_, i) => ({
        name: i % 2 === 0 ? 'chatgpt' : 'claude',
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      }))

      const startTime = performance.now()
      
      saveToStorage(largeTools)
      const storedTools = getFromStorage()
      const auditResults = runAudit(storedTools!)
      
      const endTime = performance.now()

      expect(auditResults.results).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(500) // Should complete in under 500ms
    })

    test('should handle rapid successive operations', () => {
      const tools = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      const startTime = performance.now()

      // Perform many operations rapidly
      for (let i = 0; i < 50; i++) {
        saveToStorage(tools)
        getFromStorage()
        runAudit(tools)
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete 50 operations in under 1 second
    })
  })
})
