import { 
  getIndividualPlanCost, 
  getTeamPlanCost, 
  getToolCategory, 
  getAlternativeTools 
} from '@/lib/pricingData'

describe('Basic Pricing Tests', () => {
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

  test('should return team pricing for valid tool and plan', () => {
    const result = getTeamPlanCost('chatgpt', 'team')
    
    expect(result).toEqual({
      monthly: 30,
      annual: 288,
      features: ['Team collaboration', 'Admin controls']
    })
  })

  test('should return null for invalid team tool', () => {
    const result = getTeamPlanCost('invalid-tool', 'team')
    expect(result).toBeNull()
  })

  test('should return correct category for known tools', () => {
    expect(getToolCategory('chatgpt')).toBe('text-generation')
    expect(getToolCategory('claude')).toBe('text-generation')
    expect(getToolCategory('copilot')).toBe('code-assistant')
    expect(getToolCategory('cursor')).toBe('code-assistant')
  })

  test('should return "other" for unknown tools', () => {
    expect(getToolCategory('unknown-tool')).toBe('other')
    expect(getToolCategory('')).toBe('other')
  })

  test('should return alternatives for known tools', () => {
    expect(getAlternativeTools('chatgpt')).toContain('claude')
    expect(getAlternativeTools('chatgpt')).toContain('gemini')
    expect(getAlternativeTools('claude')).toContain('chatgpt')
    expect(getAlternativeTools('copilot')).toContain('cursor')
  })

  test('should return empty array for unknown tools', () => {
    expect(getAlternativeTools('unknown-tool')).toEqual([])
    expect(getAlternativeTools('')).toEqual([])
  })

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
