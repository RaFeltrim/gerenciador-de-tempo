# Running Tests Guide

This project has three types of tests: Unit Tests (Jest), E2E/Component Tests (Cypress), and API Tests (Robot Framework).

## Prerequisites

### For Unit and Cypress Tests
```bash
npm install
```

### For Robot Framework Tests
You need Python 3.x installed, then:
```bash
pip install -r requirements.txt
```

Or install Robot Framework manually:
```bash
pip install robotframework
pip install robotframework-requests
```

## Running Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Running Cypress Tests

### E2E Tests

**Important:** Before running E2E tests, you need to start the Next.js development server in a separate terminal:

```bash
# Terminal 1: Start the dev server
npm run dev
```

Then in another terminal:

```bash
# Open Cypress GUI for E2E tests
npm run cypress:open:e2e

# Run E2E tests headlessly
npm run cypress:run:e2e
```

### Component Tests

```bash
# Open Cypress GUI for component tests (no dev server needed)
npm run cypress:open:component

# Run component tests headlessly
npm run cypress:run:component
```

### Run All Cypress Tests

```bash
# Run both E2E and component tests
npm run cypress:run
```

## Running Robot Framework Tests

**Important:** Before running Robot Framework tests, you need to start the Next.js development server:

```bash
# Terminal 1: Start the dev server
npm run dev
```

Then in another terminal:

```bash
# Run all Robot tests
npm run test:robot

# Or use robot command directly
robot tests/robot/

# Run specific test file
npm run test:robot:parse-task
# Or: robot tests/robot/parse-task-api.robot
```

## Configuration Files

- **Jest**: `jest.config.js` and `jest.setup.ts`
- **Cypress**: `cypress.config.ts`
- **Robot Framework**: Test files are in `tests/robot/`

## Cypress Configuration

The project uses Cypress 15.7.0 with:
- **Base URL**: http://localhost:3000
- **E2E tests**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`
- **Component tests**: `cypress/component/**/*.cy.{js,jsx,ts,tsx}`

## Troubleshooting

### Cypress E2E Tests Failing with 404
Make sure the Next.js dev server is running on port 3000 before running E2E tests.

### Robot Framework Tests Failing
1. Ensure Robot Framework is installed: `pip install robotframework robotframework-requests`
2. Ensure the Next.js dev server is running on port 3000
3. Check Python version: `python --version` (requires Python 3.x)

### Component Tests Not Working
Component tests don't require the dev server but need the proper Cypress configuration. Make sure `cypress.config.ts` exists.

## CI/CD

For continuous integration, you can run tests in the following order:

1. Unit tests (no server needed):
   ```bash
   npm test
   ```

2. Build the app:
   ```bash
   npm run build
   ```

3. Start the production server and run E2E tests:
   ```bash
   npm start &
   npm run cypress:run:e2e
   ```

4. Run component tests:
   ```bash
   npm run cypress:run:component
   ```

5. Run Robot Framework tests (with server running):
   ```bash
   npm run test:robot
   ```
