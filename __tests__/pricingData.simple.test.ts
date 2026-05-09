import { 
  getIndividualPlanCost, 
  getTeamPlanCost, 
  getToolCategory, 
  getAlternativeTools 
} from '@/lib/pricingData'

describe('Pricing Data - Simple Tests', () => {
  describe('getIndividualPlanCost', () => {
    test('should return pricing for valid tool and plan', () => {
      const result = getIndividualPlanCost('chatgpt', 'plus')
      
      expect(result).toEqual({
        monthly: 25,
        annual: 240,
        features: ['GPT-4', 'Priority access']
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

    test('should return default plan when no plan specified', () => {
      const result = getIndividualPlanCost('chatgpt')
      
      expect(result).toEqual({
        monthly: 25,
        annual: 240,
        features: ['GPT-4', 'Priority access']
      })
    })
  })

  describe('getTeamPlanCost', () => {
    test('should return pricing for valid tool and plan', () => {
      const result = getTeamPlanCost('chatgpt', 'team')
      
      expect(result).toEqual({
        monthly: 30,
        annual: 288,
        features: ['Team collaboration', 'Admin controls']
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

    test('should return default plan when no plan specified', () => {
      const result = getTeamPlanCost('chatgpt')
      
      expect(result).toEqual({
        monthly: 30,
        annual: 288,
        features: ['Team collaboration', 'Admin controls']
      })
    })
  })

  describe('getToolCategory', () => {
    test('should return correct category for known tools', () => {
      expect(getToolCategory('chatgpt')).toBe('text-generation')
      expect(getToolCategory('claude')).toBe('text-generation')
      expect(getToolCategory('copilot')).toBe('code-assistant')
      expect(getToolCategory('cursor')).toBe('code-assistant')
    })

    test('should return "other" for unknown tools', () => {
      expect(getToolCategory('unknown-tool')).toBe('other')
    })

    test('should return "other" for empty string', () => {
      expect(getToolCategory('')).toBe('other')
    })
  })

  describe('getAlternativeTools', () => {
    test('should return alternatives for known tools', () => {
      expect(getAlternativeTools('chatgpt')).toContain('claude')
      expect(getAlternativeTools('chatgpt')).toContain('gemini')
      expect(getAlternativeTools('claude')).toContain('chatgpt')
      expect(getAlternativeTools('copilot')).toContain('cursor')
    })

    test('should return empty array for unknown tools', () => {
      expect(getAlternativeTools('unknown-tool')).toEqual([])
    })

    test('should return empty array for empty string', () => {
      expect(getAlternativeTools('')).toEqual([])
    })
  })

  describe('Data Consistency', () => {
    test('should have consistent pricing structure', () => {
      const tools = ['chatgpt', 'claude', 'copilot']
      
      tools.forEach(tool => {
        const individualCost = getIndividualPlanCost(tool, 'plus') || getIndividualPlanCost(tool, 'pro') || getIndividualPlanCost(tool, 'individual')
        if (individualCost) {
          expect(individualCost).toHaveProperty('monthly')
          expect(individualCost).toHaveProperty('annual')
          expect(individualCost).toHaveProperty('features')
          expect(typeof individualCost.monthly).toBe('number')
          expect(typeof individualCost.annual).toBe('number')
          expect(Array.isArray(individualCost.features)).toBe(true)
          expect(individualCost.annual).toBeLessThanOrEqual(individualCost.monthly * 12)
        }
      })
    })

    test('should have reasonable pricing values', () => {
      const tools = ['chatgpt', 'claude', 'copilot']
      
      tools.forEach(tool => {
        const individualCost = getIndividualPlanCost(tool, 'plus') || getIndividualPlanCost(tool, 'pro') || getIndividualPlanCost(tool, 'individual')
        if (individualCost) {
          expect(individualCost.monthly).toBeGreaterThan(0)
          expect(individualCost.monthly).toBeLessThan(1000)
          expect(individualCost.annual).toBeGreaterThan(0)
          expect(individualCost.annual).toBeLessThan(12000)
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

    test('should handle special characters', () => {
      const result = getIndividualPlanCost('chatgpt@#$', 'plus')
      expect(result).toBeNull()
    })
  })
})
