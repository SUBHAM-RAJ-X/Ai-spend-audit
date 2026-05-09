import { saveToStorage, getFromStorage, clearStorage } from '@/utils/storage'

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('saveToStorage', () => {
    test('should save data to localStorage', () => {
      const testData = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]

      saveToStorage(testData)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(testData)
      )
    })

    test('should handle empty array', () => {
      const testData: any[] = []

      saveToStorage(testData)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(testData)
      )
    })

    test('should handle null data', () => {
      saveToStorage(null as any)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(null)
      )
    })

    test('should handle undefined data', () => {
      saveToStorage(undefined as any)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(undefined)
      )
    })

    test('should handle complex objects', () => {
      const complexData = [
        {
          name: 'chatgpt',
          plan: 'plus',
          monthlySpend: 25,
          seats: 1,
          metadata: {
            category: 'text-generation',
            features: ['GPT-4', 'Priority access'],
            renewalDate: '2024-12-01'
          }
        }
      ]

      saveToStorage(complexData)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(complexData)
      )
    })
  })

  describe('getFromStorage', () => {
    test('should retrieve data from localStorage', () => {
      const testData = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]
      
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(testData))

      const result = getFromStorage()

      expect(result).toEqual(testData)
      expect(localStorage.getItem).toHaveBeenCalledWith('ai-spend-audit-tools')
    })

    test('should return null when localStorage is empty', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      const result = getFromStorage()

      expect(result).toBeNull()
    })

    test('should return null when localStorage data is malformed', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid json')

      const result = getFromStorage()

      expect(result).toBeNull()
    })

    test('should return null when localStorage throws error', () => {
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = getFromStorage()

      expect(result).toBeNull()
    })

    test('should handle empty array in localStorage', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([]))

      const result = getFromStorage()

      expect(result).toEqual([])
    })

    test('should handle large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `tool-${i}`,
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      }))
      
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(largeData))

      const result = getFromStorage()

      expect(result).toHaveLength(1000)
      expect(result![0]).toEqual({
        name: 'tool-0',
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      })
    })
  })

  describe('clearStorage', () => {
    test('should clear data from localStorage', () => {
      clearStorage()

      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-spend-audit-tools')
    })

    test('should handle errors when clearing storage', () => {
      ;(localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Clear error')
      })

      expect(() => clearStorage()).not.toThrow()
    })
  })

  describe('Storage Integration', () => {
    test('should save and retrieve data correctly', () => {
      const testData = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 },
        { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
      ]

      // Mock the getItem to return what was set
      let storedData: string | null = null
      ;(localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
        if (key === 'ai-spend-audit-tools') {
          storedData = value
        }
      })
      ;(localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'ai-spend-audit-tools') {
          return storedData
        }
        return null
      })

      // Save data
      saveToStorage(testData)

      // Retrieve data
      const result = getFromStorage()

      expect(result).toEqual(testData)
    })

    test('should handle multiple save operations', () => {
      const testData1 = [{ name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }]
      const testData2 = [{ name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }]

      let storedData: string | null = null
      ;(localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
        if (key === 'ai-spend-audit-tools') {
          storedData = value
        }
      })
      ;(localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'ai-spend-audit-tools') {
          return storedData
        }
        return null
      })

      // Save first set of data
      saveToStorage(testData1)
      let result = getFromStorage()
      expect(result).toEqual(testData1)

      // Save second set of data
      saveToStorage(testData2)
      result = getFromStorage()
      expect(result).toEqual(testData2)
    })
  })

  describe('Data Validation', () => {
    test('should validate data structure on save', () => {
      const invalidData = { invalid: 'structure' }

      saveToStorage(invalidData as any)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-spend-audit-tools',
        JSON.stringify(invalidData)
      )
    })

    test('should handle circular references', () => {
      const circularData: any = { name: 'chatgpt' }
      circularData.self = circularData

      expect(() => saveToStorage(circularData)).toThrow()
    })
  })

  describe('Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        name: `tool-${i}`,
        plan: 'plus',
        monthlySpend: 25,
        seats: 1,
        metadata: {
          id: i,
          description: `Tool number ${i} with additional data`,
          tags: [`tag-${i}`, `category-${i % 10}`]
        }
      }))

      const startTime = performance.now()
      saveToStorage(largeData)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    test('should retrieve large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        name: `tool-${i}`,
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      }))

      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(largeData))

      const startTime = performance.now()
      const result = getFromStorage()
      const endTime = performance.now()

      expect(result).toHaveLength(10000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })
  })

  describe('Edge Cases', () => {
    test('should handle very long tool names', () => {
      const longName = 'a'.repeat(1000)
      const testData = [{ name: longName, plan: 'plus', monthlySpend: 25, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle special characters in tool names', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const testData = [{ name: specialChars, plan: 'plus', monthlySpend: 25, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle unicode characters in tool names', () => {
      const unicodeName = '🤖 AI工具 🚀'
      const testData = [{ name: unicodeName, plan: 'plus', monthlySpend: 25, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle extremely large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER
      const testData = [{ name: 'chatgpt', plan: 'plus', monthlySpend: largeNumber, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle negative numbers', () => {
      const testData = [{ name: 'chatgpt', plan: 'plus', monthlySpend: -25, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle decimal numbers', () => {
      const testData = [{ name: 'chatgpt', plan: 'plus', monthlySpend: 24.99, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })
  })
})
