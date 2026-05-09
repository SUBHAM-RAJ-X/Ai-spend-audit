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

describe('Storage Utils - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
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
  })

  describe('getFromStorage', () => {
    test('should retrieve data from localStorage', () => {
      const testData = [
        { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
      ]
      
      localStorageMock.getItem = jest.fn().mockReturnValue(JSON.stringify(testData))

      const result = getFromStorage()

      expect(result).toEqual(testData)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ai-spend-audit-tools')
    })

    test('should return null when localStorage is empty', () => {
      localStorageMock.getItem = jest.fn().mockReturnValue(null)

      const result = getFromStorage()

      expect(result).toBeNull()
    })

    test('should return null when localStorage data is malformed', () => {
      localStorageMock.getItem = jest.fn().mockReturnValue('invalid json')

      const result = getFromStorage()

      expect(result).toBeNull()
    })

    test('should handle empty array in localStorage', () => {
      localStorageMock.getItem = jest.fn().mockReturnValue(JSON.stringify([]))

      const result = getFromStorage()

      expect(result).toEqual([])
    })
  })

  describe('clearStorage', () => {
    test('should clear data from localStorage', () => {
      clearStorage()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ai-spend-audit-tools')
    })

    test('should handle errors when clearing storage', () => {
      localStorageMock.removeItem = jest.fn().mockImplementation(() => {
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
      localStorageMock.setItem = jest.fn().mockImplementation((key, value) => {
        if (key === 'ai-spend-audit-tools') {
          storedData = value
        }
      })
      localStorageMock.getItem = jest.fn().mockImplementation((key) => {
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
      localStorageMock.setItem = jest.fn().mockImplementation((key, value) => {
        if (key === 'ai-spend-audit-tools') {
          storedData = value
        }
      })
      localStorageMock.getItem = jest.fn().mockImplementation((key) => {
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

    test('should handle negative numbers', () => {
      const testData = [{ name: 'chatgpt', plan: 'plus', monthlySpend: -25, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })

    test('should handle decimal numbers', () => {
      const testData = [{ name: 'chatgpt', plan: 'plus', monthlySpend: 24.99, seats: 1 }]

      expect(() => saveToStorage(testData)).not.toThrow()
    })
  })

  describe('Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
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
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        name: `tool-${i}`,
        plan: 'plus',
        monthlySpend: 25,
        seats: 1
      }))

      localStorageMock.getItem = jest.fn().mockReturnValue(JSON.stringify(largeData))

      const startTime = performance.now()
      const result = getFromStorage()
      const endTime = performance.now()

      expect(result).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })
  })
})
