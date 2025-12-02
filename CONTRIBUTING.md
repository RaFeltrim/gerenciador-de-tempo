# Contributing to FocusFlow

Thank you for your interest in contributing to FocusFlow! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gerenciador-de-tempo.git
   cd gerenciador-de-tempo
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

Before committing, ensure all tests pass:

```bash
# Run linting
npm run lint

# Run tests
npm test

# Check formatting
npm run format:check

# Build the project
npm run build
```

### 4. Commit Your Changes

We use conventional commits. Format your commits as:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or updates
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(dashboard): add task filtering by category"
git commit -m "fix(api): resolve date parsing issue for edge cases"
git commit -m "docs(readme): update installation instructions"
```

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type - use `unknown` if type is truly unknown
- Enable strict mode compliance

### Code Style

- Follow the Prettier configuration (`.prettierrc`)
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

Example:
```typescript
/**
 * Parses natural language text to extract task information
 * @param text - Natural language text in Portuguese
 * @returns Parsed task object with title, date, priority, etc.
 * @throws {Error} If text is empty or invalid
 */
function parseTask(text: string): ParsedTask {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Use `memo` for performance optimization when needed
- Keep components small and reusable
- Use proper prop typing

### File Organization

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes
│   └── dashboard/    # Pages
├── components/       # Reusable components
├── lib/              # Utility functions
└── types/            # TypeScript types
```

## 🧪 Testing Guidelines

### Test Coverage

Aim for:
- 80%+ code coverage for utility functions
- Critical business logic should be 100% covered
- Test both happy paths and edge cases

### Writing Tests

#### Unit Tests (Jest)

```typescript
describe('extractPriority', () => {
  it('should return high priority for urgent keywords', () => {
    expect(extractPriority('Reunião urgente')).toBe('high');
  });

  it('should return low priority for optional keywords', () => {
    expect(extractPriority('Ler livro quando puder')).toBe('low');
  });

  it('should return medium priority by default', () => {
    expect(extractPriority('Fazer compras')).toBe('medium');
  });
});
```

#### Component Tests (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('TaskItem', () => {
  it('should render task title', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should toggle completion on click', () => {
    const onToggle = jest.fn();
    render(<TaskItem task={mockTask} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(mockTask.id);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires dev server)
npm run cypress:run:e2e
```

## 🔍 Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is formatted (`npm run format`)
3. ✅ No linting errors (`npm run lint`)
4. ✅ Build succeeds (`npm run build`)
5. ✅ Documentation is updated
6. ✅ Commit messages follow conventions

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Automated checks must pass (tests, linting, build)
2. At least one maintainer approval required
3. Address all review comments
4. Squash commits if requested
5. Maintainer will merge when ready

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, browser
6. **Screenshots**: If applicable

## 💡 Feature Requests

When requesting features:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered?
4. **Additional Context**: Screenshots, mockups, etc.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/RaFeltrim/gerenciador-de-tempo/discussions)
- Create an [Issue](https://github.com/RaFeltrim/gerenciador-de-tempo/issues)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FocusFlow! 🎉
