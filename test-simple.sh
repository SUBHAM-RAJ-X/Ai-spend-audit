#!/bin/bash

# Simple test runner for AI Spend Audit
echo "🧪 Running AI Spend Audit Tests..."
echo ""

# Check if dependencies are installed
if ! npm list jest &>/dev/null; then
    echo "❌ Jest not found. Installing dependencies..."
    npm install --save-dev jest @types/jest @testing-library/jest-dom @testing-library/react @testing-library/user-event jest-environment-jsdom
    echo ""
fi

# Run basic tests first
echo "📋 Running basic tests (type-safe)..."
npm test -- --testPathPattern="basic.test.ts"
echo ""

# Check if basic tests passed
if [ $? -eq 0 ]; then
    echo "✅ Basic tests passed!"
    echo ""
    echo "🚀 Want to run pricing tests?"
    echo "   npm test -- --testPathPattern=\"pricing.basic.test.ts\""
    echo ""
    echo "💾 Want to run storage tests?"
    echo "   npm test -- --testPathPattern=\"storage.basic.test.ts\""
    echo ""
    echo "📊 Want coverage report?"
    echo "   npm run test:coverage"
else
    echo "❌ Some tests failed. Check the output above."
    exit 1
fi
