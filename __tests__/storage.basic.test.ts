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

describe('Basic Storage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should save data to localStorage', () => {
    const testData = [
      { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 }
    ]

    saveToStorage(testData)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ai-spend-audit-tools',
      JSON.stringify(testData)
    )
  })

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

  test('should save and retrieve data correctly', () => {
    const testData = [
      { name: 'chatgpt', plan: 'plus', monthlySpend: 25, seats: 1 },
      { name: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }
    ]

    // Mock the getItem to return what was set
    let storedData: string | null = null
    localStorageMock.setItem = jest.fn().mockImplementation((key: string, value: string) => {
      if (key === 'ai-spend-audit-tools') {
        storedData = value
      }
    })
    localStorageMock.getItem = jest.fn().mockImplementation((key: string) => {
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

  test('should handle null data', () => {
    saveToStorage(null as any)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ai-spend-audit-tools',
      JSON.stringify(null)
    )
  })

  test('should handle undefined data', () => {
    saveToStorage(undefined as any)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'ai-spend-audit-tools',
      JSON.stringify(undefined)
    )
  })
})
