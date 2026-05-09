import { 
  getIndividualPlanCost, 
  getTeamPlanCost, 
  getToolCategory, 
  getAlternativeTools 
} from '@/lib/pricingData'

describe('Pricing Data', () => {
  describe('getIndividualPlanCost', () => {
    test('should return correct pricing for ChatGPT Plus plan', () => {
      const result = getIndividualPlanCost('chatgpt', 'plus')
      
      expect(result).toEqual({
        monthly: 25,
        annual: 240,
        features: ['GPT-4', 'Priority access']
      })
    })

    test('should return correct pricing for Claude Pro plan', () => {
      const result = getIndividualPlanCost('claude', 'pro')
      
      expect(result).toEqual({
        monthly: 20,
        annual: 192,
        features: ['Claude 2', 'High usage']
      })
    })

    test('should return correct pricing for GitHub Copilot Individual plan', () => {
      const result = getIndividualPlanCost('copilot', 'individual')
      
      expect(result).toEqual({
        monthly: 10,
        annual: 96,
        features: ['GitHub Copilot', 'IDE integration']
      })
    })

    test('should return null for invalid tool', () => {
      const result = getIndividualPlanCost('invalid-tool', 'plus')
      expect(result).toBeNull()
    })

    test('should return null for invalid plan', () => {
      const result = getIndividualPlanCost('chatgpt', 'invalid-plan')
      expect(result).toBeNull()
    })

    test('should return null for empty tool name', () => {
      const result = getIndividualPlanCost('', 'plus')
      expect(result).toBeNull()
    })

    test('should return null for empty plan name', () => {
      const result = getIndividualPlanCost('chatgpt', '')
      expect(result).toBeNull()
    })
  })

  describe('getTeamPlanCost', () => {
    test('should return correct pricing for ChatGPT Team plan', () => {
      const result = getTeamPlanCost('chatgpt', 'team')
      
      expect(result).toEqual({
        monthly: 30,
        annual: 288,
        features: ['Team collaboration', 'Admin controls']
      })
    })

    test('should return correct pricing for GitHub Copilot Team plan', () => {
      const result = getTeamPlanCost('copilot', 'team')
      
      expect(result).toEqual({
        monthly: 19,
        annual: 180,
        features: ['Team management', 'License management']
      })
    })

    test('should return correct pricing for ChatGPT Enterprise plan', () => {
      const result = getTeamPlanCost('chatgpt', 'enterprise')
      
      expect(result).toEqual({
        monthly: 60,
        annual: 576,
        features: ['Advanced security', 'Custom integrations']
      })
    })

    test('should return null for invalid tool', () => {
      const result = getTeamPlanCost('invalid-tool', 'team')
      expect(result).toBeNull()
    })

    test('should return null for invalid plan', () => {
      const result = getTeamPlanCost('chatgpt', 'invalid-plan')
      expect(result).toBeNull()
    })

    test('should return null for tools without team plans', () => {
      const result = getTeamPlanCost('cursor', 'team')
      expect(result).toBeNull()
    })
  })

  describe('getToolCategory', () => {
    test('should return correct category for ChatGPT', () => {
      const result = getToolCategory('chatgpt')
      expect(result).toBe('text-generation')
    })

    test('should return correct category for Claude', () => {
      const result = getToolCategory('claude')
      expect(result).toBe('text-generation')
    })

    test('should return correct category for GitHub Copilot', () => {
      const result = getToolCategory('copilot')
      expect(result).toBe('code-assistant')
    })

    test('should return correct category for OpenAI API', () => {
      const result = getToolCategory('openai-api')
      expect(result).toBe('api-platform')
    })

    test('should return correct category for Anthropic API', () => {
      const result = getToolCategory('anthropic-api')
      expect(result).toBe('api-platform')
    })

    test('should return correct category for Cursor', () => {
      const result = getToolCategory('cursor')
      expect(result).toBe('code-assistant')
    })

    test('should return correct category for Gemini', () => {
      const result = getToolCategory('gemini')
      expect(result).toBe('text-generation')
    })

    test('should return "other" for unknown tool', () => {
      const result = getToolCategory('unknown-tool')
      expect(result).toBe('other')
    })

    test('should return "other" for empty string', () => {
      const result = getToolCategory('')
      expect(result).toBe('other')
    })
  })

  describe('getAlternativeTools', () => {
    test('should return alternatives for ChatGPT', () => {
      const result = getAlternativeTools('chatgpt')
      expect(result).toContain('claude')
      expect(result).toContain('gemini')
    })

    test('should return alternatives for Claude', () => {
      const result = getAlternativeTools('claude')
      expect(result).toContain('chatgpt')
      expect(result).toContain('gemini')
    })

    test('should return alternatives for GitHub Copilot', () => {
      const result = getAlternativeTools('copilot')
      expect(result).toContain('cursor')
    })

    test('should return alternatives for Cursor', () => {
      const result = getAlternativeTools('cursor')
      expect(result).toContain('copilot')
    })

    test('should return empty array for unknown tool', () => {
      const result = getAlternativeTools('unknown-tool')
      expect(result).toEqual([])
    })

    test('should return empty array for empty string', () => {
      const result = getAlternativeTools('')
      expect(result).toEqual([])
    })
  })

  describe('Data Consistency', () => {
    test('should have consistent pricing structure across all tools', () => {
      const tools = ['chatgpt', 'claude', 'copilot', 'cursor', 'gemini', 'openai-api', 'anthropic-api']
      
      tools.forEach(tool => {
        // Test individual plans if they exist
        const individualPlans = ['basic', 'plus', 'pro', 'individual', 'business']
        individualPlans.forEach(plan => {
          const cost = getIndividualPlanCost(tool, plan)
          if (cost) {
            expect(cost).toHaveProperty('monthly')
            expect(cost).toHaveProperty('annual')
            expect(cost).toHaveProperty('features')
            expect(typeof cost.monthly).toBe('number')
            expect(typeof cost.annual).toBe('number')
            expect(Array.isArray(cost.features)).toBe(true)
            expect(cost.annual).toBeLessThanOrEqual(cost.monthly * 12) // Annual should be cheaper or equal
          }
        })

        // Test team plans if they exist
        const teamPlans = ['team', 'enterprise']
        teamPlans.forEach(plan => {
          const cost = getTeamPlanCost(tool, plan)
          if (cost) {
            expect(cost).toHaveProperty('monthly')
            expect(cost).toHaveProperty('annual')
            expect(cost).toHaveProperty('features')
            expect(typeof cost.monthly).toBe('number')
            expect(typeof cost.annual).toBe('number')
            expect(Array.isArray(cost.features)).toBe(true)
            expect(cost.annual).toBeLessThanOrEqual(cost.monthly * 12)
          }
        })
      })
    })

    test('should have reasonable pricing values', () => {
      const tools = ['chatgpt', 'claude', 'copilot']
      
      tools.forEach(tool => {
        const individualCost = getIndividualPlanCost(tool, 'plus') || getIndividualPlanCost(tool, 'pro') || getIndividualPlanCost(tool, 'individual')
        if (individualCost) {
          expect(individualCost.monthly).toBeGreaterThan(0)
          expect(individualCost.monthly).toBeLessThan(1000) // Reasonable upper limit
          expect(individualCost.annual).toBeGreaterThan(0)
          expect(individualCost.annual).toBeLessThan(12000) // Reasonable upper limit
        }
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle case sensitivity correctly', () => {
      const result1 = getIndividualPlanCost('ChatGPT', 'plus')
      const result2 = getIndividualPlanCost('chatgpt', 'plus')
      
      expect(result1).toBeNull() // Should be case sensitive
      expect(result2).not.toBeNull()
    })

    test('should handle whitespace in tool names', () => {
      const result = getIndividualPlanCost(' chatgpt ', 'plus')
      expect(result).toBeNull() // Should not trim whitespace
    })

    test('should handle special characters in tool names', () => {
      const result = getIndividualPlanCost('chatgpt@#$', 'plus')
      expect(result).toBeNull()
    })
  })

  describe('Performance', () => {
    test('should retrieve pricing data quickly', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        getIndividualPlanCost('chatgpt', 'plus')
        getTeamPlanCost('chatgpt', 'team')
        getToolCategory('chatgpt')
        getAlternativeTools('chatgpt')
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete 1000 operations in under 100ms
    })
  })
})
