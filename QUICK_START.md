# Quick Start Guide - Testing

This guide will help you quickly get started with running tests in this project.

## 🚀 Quick Setup

### Step 1: Install Node Dependencies
```bash
npm install
```

### Step 2: Install Python Dependencies (Optional - for Robot Framework)
```bash
pip install -r requirements.txt
```

### Step 3: Verify Setup
Run the setup check script to verify everything is configured correctly:

**On Linux/Mac:**
```bash
bash scripts/check-test-setup.sh
```

**On Windows:**
```cmd
scripts\check-test-setup.bat
```

## 🧪 Running Tests

### Unit Tests (Jest)
No server required. Just run:
```bash
npm test
```

### Cypress E2E Tests
**Important:** Start the dev server first!

```bash
# Terminal 1 - Start the server
npm run dev

# Terminal 2 - Run tests
npm run cypress:run:e2e
```

Or use the GUI:
```bash
npm run cypress:open:e2e
```

### Cypress Component Tests
No server required:
```bash
npm run cypress:run:component
```

Or use the GUI:
```bash
npm run cypress:open:component
```

### Robot Framework Tests
**Important:** Start the dev server first!

```bash
# Terminal 1 - Start the server
npm run dev

# Terminal 2 - Run tests
npm run test:robot
```

## 📊 Test Results

### What Was Fixed
This PR fixed the following Cypress test failures:
- ❌ `cy.visit()` failing with 404 errors → ✅ Now properly configured
- ❌ "testing type (component) is not configured" → ✅ Component testing configured
- ❌ No Cypress configuration file → ✅ `cypress.config.ts` created
- ❌ Robot Framework not installable → ✅ `requirements.txt` added

### Configuration Files Created
1. **cypress.config.ts** - Main Cypress configuration
2. **cypress/support/e2e.ts** - E2E test support file
3. **cypress/support/component.ts** - Component test support file
4. **cypress/support/commands.ts** - Custom commands
5. **cypress/tsconfig.json** - TypeScript config for Cypress
6. **requirements.txt** - Python dependencies

## 📝 Test Files Location

```
├── cypress/
│   ├── e2e/
│   │   ├── auth-flow.cy.ts              (7 tests)
│   │   ├── login-and-create-task.cy.ts  (2 tests)
│   │   └── task-management.cy.ts        (8 tests)
│   └── component/
│       └── PomodoroTimer.cy.tsx         (5 tests)
├── tests/
│   └── robot/
│       └── parse-task-api.robot         (3 tests)
└── __tests__/
    └── ... (Jest unit tests)
```

## 🔧 Available Commands

| Command | Description | Needs Server? |
|---------|-------------|---------------|
| `npm test` | Run Jest unit tests | No |
| `npm run test:watch` | Run Jest in watch mode | No |
| `npm run test:coverage` | Run Jest with coverage | No |
| `npm run cypress:open` | Open Cypress GUI | N/A |
| `npm run cypress:open:e2e` | Open Cypress E2E GUI | Yes |
| `npm run cypress:open:component` | Open Cypress Component GUI | No |
| `npm run cypress:run` | Run all Cypress tests | Yes (for E2E) |
| `npm run cypress:run:e2e` | Run E2E tests headlessly | Yes |
| `npm run cypress:run:component` | Run component tests headlessly | No |
| `npm run test:robot` | Run all Robot Framework tests | Yes |
| `npm run test:robot:parse-task` | Run specific Robot test | Yes |

## ❓ Troubleshooting

### Tests Still Failing with 404?
Make sure you've started the dev server:
```bash
npm run dev
```

### Cypress Not Installed?
Run:
```bash
npm install
```

### Robot Framework Command Not Found?
Install Python dependencies:
```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install robotframework robotframework-requests
```

### Port 3000 Already in Use?
Stop any other processes using port 3000 or configure a different port in `cypress.config.ts`.

## 📚 More Information

- **Full Testing Guide:** [RUNNING_TESTS.md](./RUNNING_TESTS.md)
- **Cypress Setup Details:** [CYPRESS_SETUP_GUIDE.md](./CYPRESS_SETUP_GUIDE.md)
- **Project Documentation:** [DOCUMENTACAO.md](./DOCUMENTACAO.md)

## 🎯 Next Steps

1. ✅ Configuration is complete
2. ✅ Run `npm install` to install dependencies
3. ✅ Run `bash scripts/check-test-setup.sh` (or `.bat` on Windows) to verify
4. 🏃 Start the dev server: `npm run dev`
5. 🧪 Run your tests!

---

**Note:** This setup supports Cypress 15.7.0 with Next.js 14.0.0. All test files are already created and will work once you follow the setup steps above.
