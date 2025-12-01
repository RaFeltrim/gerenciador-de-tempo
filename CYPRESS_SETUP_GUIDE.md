# Cypress Setup Guide

## Problem Solved

The Cypress tests were failing with errors like:
```
cy.visit() failed trying to load: /
We failed looking for this file at the path: /Users/Submarino/Desktop/Geral/Projetos/Gerenciador-de-tempo/
The internal Cypress web server responded with: > 404: Not Found
```

This was happening because:
1. **Missing `cypress.config.ts`**: Cypress didn't know how to serve the Next.js application
2. **Missing support files**: No E2E or component test setup files existed
3. **Missing configuration for component tests**: Component testing wasn't configured at all

## What Was Added

### 1. Cypress Configuration (`cypress.config.ts`)

Created a complete Cypress configuration file that:
- Configures E2E tests to use `http://localhost:3000` as the base URL
- Sets up component testing with Next.js + Webpack
- Defines test file patterns for both E2E and component tests
- Configures viewport size (1280x720)
- Disables video recording but enables screenshot on failure

### 2. Cypress Support Files

Created three support files in `cypress/support/`:
- **`e2e.ts`**: Setup file for E2E tests
- **`component.ts`**: Setup file for component tests with React 18 mount support
- **`commands.ts`**: Place for custom Cypress commands (extensible)

### 3. TypeScript Configuration (`cypress/tsconfig.json`)

Created a TypeScript configuration specifically for Cypress to properly type-check test files.

### 4. NPM Scripts

Added convenient scripts to `package.json`:
- `npm run cypress:open` - Open Cypress GUI
- `npm run cypress:open:e2e` - Open E2E tests in GUI
- `npm run cypress:open:component` - Open component tests in GUI
- `npm run cypress:run` - Run all tests headlessly
- `npm run cypress:run:e2e` - Run E2E tests headlessly
- `npm run cypress:run:component` - Run component tests headlessly

### 5. Robot Framework Support

Added Python-based API testing support:
- Created `requirements.txt` with Robot Framework dependencies
- Added npm scripts: `npm run test:robot` and `npm run test:robot:parse-task`

### 6. Documentation

Created comprehensive testing guides:
- **`RUNNING_TESTS.md`**: Complete guide for all test types (Jest, Cypress, Robot Framework)
- **`CYPRESS_SETUP_GUIDE.md`**: This file explaining the Cypress setup

### 7. Updated `.gitignore`

Added entries to exclude:
- Cypress artifacts (screenshots, videos, downloads)
- Robot Framework results
- Python cache files

## How to Run Tests Now

### Prerequisites

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **For Robot Framework tests, install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running E2E Tests

**IMPORTANT**: E2E tests require the Next.js dev server to be running!

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run E2E tests
npm run cypress:run:e2e

# Or open the Cypress GUI
npm run cypress:open:e2e
```

### Running Component Tests

Component tests don't require the dev server:

```bash
# Run component tests
npm run cypress:run:component

# Or open the Cypress GUI
npm run cypress:open:component
```

### Running Robot Framework Tests

**IMPORTANT**: Robot Framework tests also require the Next.js dev server!

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run Robot tests
npm run test:robot

# Or run directly with robot command
robot tests/robot/
```

## Test Files Structure

```
├── cypress/
│   ├── e2e/                          # E2E test files
│   │   ├── auth-flow.cy.ts
│   │   ├── login-and-create-task.cy.ts
│   │   └── task-management.cy.ts
│   ├── component/                     # Component test files
│   │   └── PomodoroTimer.cy.tsx
│   ├── support/                       # Support files
│   │   ├── commands.ts
│   │   ├── component.ts
│   │   └── e2e.ts
│   └── tsconfig.json                  # TypeScript config for Cypress
├── tests/
│   └── robot/                         # Robot Framework tests
│       └── parse-task-api.robot
├── cypress.config.ts                  # Main Cypress configuration
└── requirements.txt                   # Python dependencies
```

## Configuration Details

### E2E Configuration
- **Base URL**: `http://localhost:3000`
- **Spec Pattern**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`
- **Support File**: `cypress/support/e2e.ts`
- **Viewport**: 1280x720
- **Video**: Disabled
- **Screenshots**: Enabled on failure

### Component Configuration
- **Framework**: Next.js with Webpack bundler
- **Spec Pattern**: `cypress/component/**/*.cy.{js,jsx,ts,tsx}`
- **Support File**: `cypress/support/component.ts`
- **Viewport**: 1280x720

## Troubleshooting

### "cy.visit() failed trying to load"
**Solution**: Make sure the Next.js dev server is running on port 3000:
```bash
npm run dev
```

### "The testing type selected (component) is not configured"
**Solution**: This is now fixed! The `cypress.config.ts` file includes component testing configuration.

### "Cannot find module 'cypress'"
**Solution**: Run `npm install` to install all dependencies including Cypress.

### Robot Framework command not found
**Solution**: Install Robot Framework with pip:
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install robotframework robotframework-requests
```

## Next Steps

1. **Start the dev server**: `npm run dev`
2. **Open Cypress GUI**: `npm run cypress:open:e2e`
3. **Watch the tests run**: The E2E tests should now successfully connect to your Next.js app
4. **For CI/CD**: Use the headless commands (`npm run cypress:run:e2e`)

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Install dependencies
  run: npm install

- name: Build Next.js app
  run: npm run build

- name: Start Next.js server
  run: npm start &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run Cypress E2E tests
  run: npm run cypress:run:e2e

- name: Run Cypress Component tests
  run: npm run cypress:run:component
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Robot Framework Documentation](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)
