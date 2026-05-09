#!/bin/bash

# Install testing dependencies for AI Spend Audit
echo "Installing testing dependencies..."

npm install --save-dev jest @types/jest @testing-library/jest-dom @testing-library/react @testing-library/user-event jest-environment-jsdom

echo "Testing dependencies installed successfully!"
echo ""
echo "You can now run tests with:"
echo "  npm test                 # Run all tests"
echo "  npm run test:watch       # Run tests in watch mode"
echo "  npm run test:coverage    # Run tests with coverage"
