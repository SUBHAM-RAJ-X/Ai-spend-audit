# Testing Guide

## Overview
This guide explains how to run and write tests for the AI Spend Audit application using Jest.

## Quick Setup

### 1. Install Dependencies
```bash
# Run the installation script
bash install-testing-deps.sh

# Or install manually
npm install --save-dev jest @types/jest @testing-library/jest-dom @testing-library/react @testing-library/user-event jest-environment-jsdom
```

### 2. Update package.json
Add these scripts to your package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Configure Jest
The project already includes:
- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Test setup and mocks

## Test Files

### Working Tests (Type-Safe)
- `basic.test.ts` - Core audit logic tests (recommended)
- `pricing.basic.test.ts` - Pricing data tests
- `storage.basic.test.ts` - Storage utility tests

### Advanced Tests (Have Type Issues)
- `auditEngine.simple.test.ts` - Core audit logic tests
- `pricingData.simple.test.ts` - Pricing data tests
- `utils.simple.test.ts` - Storage utility tests
- `integration.simple.test.ts` - Integration tests
- `auditEngine.test.ts` - Comprehensive audit engine tests
- `pricingData.test.ts` - Detailed pricing data tests
- `utils.test.ts` - Advanced utility tests
- `integration.test.ts` - Complex integration tests

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test auditEngine.test.ts
```

## Test Structure

### Test Files Location
```
__tests__/
├── auditEngine.test.ts      # Core audit logic tests
├── pricingData.test.ts      # Pricing data tests
├── utils.test.ts             # Utility function tests
└── integration.test.ts      # Integration tests
```

### Test Categories

#### 1. Unit Tests (`auditEngine.test.ts`)
- Test individual functions in isolation
- Mock external dependencies
- Focus on business logic
- Include edge cases

#### 2. Data Tests (`pricingData.test.ts`)
- Test data retrieval functions
- Validate data consistency
- Test edge cases with invalid inputs

#### 3. Utility Tests (`utils.test.ts`)
- Test helper functions
- Test localStorage integration
- Include performance tests

#### 4. Integration Tests (`integration.test.ts`)
- Test complete workflows
- Test component interactions
- Test real-world scenarios

## Writing Tests

### Basic Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks()
  })

  test('should do something specific', () => {
    // Arrange
    const input = { /* test data */ }
    
    // Act
    const result = functionUnderTest(input)
    
    // Assert
    expect(result).toBe(expectedOutput)
  })
})
```

### Mocking External Dependencies
```typescript
// Mock a module
jest.mock('@/lib/pricingData', () => ({
  getIndividualPlanCost: jest.fn(),
  getTeamPlanCost: jest.fn(),
  // ... other mocked functions
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock
```

### Testing Edge Cases
```typescript
test('should handle null input gracefully', () => {
  expect(() => functionUnderTest(null)).not.toThrow()
  const result = functionUnderTest(null)
  expect(result).toBeNull()
})

test('should handle empty arrays', () => {
  const result = functionUnderTest([])
  expect(result).toEqual([])
})
```

## Test Coverage

### Coverage Goals
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### Coverage Report
Run `npm run test:coverage` to generate:
- Terminal coverage summary
- HTML report in `coverage/lcov-report/index.html`
- LCOV data for CI integration

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow "should do something" pattern
- Include edge case descriptions

### 2. Test Structure
- Arrange, Act, Assert pattern
- One assertion per test when possible
- Use beforeEach for common setup

### 3. Mocking Strategy
- Mock external dependencies
- Use consistent mock data
- Clear mocks between tests

### 4. Edge Cases
- Test null/undefined inputs
- Test empty arrays/objects
- Test extreme values
- Test error conditions

### 5. Performance Tests
- Test with large datasets
- Measure execution time
- Test memory usage

## Example Test Cases

### Audit Engine Tests
```typescript
describe('Savings Calculations', () => {
  test('should calculate savings for overpriced plans', () => {
    const tools = [
      { name: 'chatgpt', plan: 'pro', monthlySpend: 60, seats: 1 }
    ]
    
    const result = runAudit(tools)
    
    expect(result.totalSavings).toBe(10) // $60 - $50 = $10
  })
})
```

### Integration Tests
```typescript
describe('Full Workflow', () => {
  test('should complete audit from input to results', () => {
    // Save to storage
    saveToStorage(testTools)
    
    // Retrieve from storage
    const stored = getFromStorage()
    
    // Run audit
    const results = runAudit(stored!)
    
    // Validate results
    expect(results.results).toHaveLength(testTools.length)
  })
})
```

## Debugging Tests

### 1. Console Logging
```typescript
test('debug test', () => {
  console.log('Debug info:', data)
  // ... test logic
})
```

### 2. Test Only
```typescript
test.only('run only this test', () => {
  // ... test logic
})
```

### 3. Debugger in Jest
```bash
npm test -- --runInBand
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Common Issues

#### 1. Module Not Found
```bash
# Clear Jest cache
npm test -- --clearCache
```

#### 2. TypeScript Errors
```bash
# Check TypeScript compilation
npm run type-check
```

#### 3. Mock Issues
```typescript
// Clear specific mock
jest.clearAllMocks()
jest.resetModules()
```

### Performance Issues
- Use `test.only` to run single tests
- Check for infinite loops in test data
- Mock expensive operations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Contributing Tests

When adding new features:
1. Write unit tests for new functions
2. Write integration tests for workflows
3. Update existing tests if needed
4. Maintain coverage above 90%

Run tests before submitting:
```bash
npm test
npm run test:coverage
```
