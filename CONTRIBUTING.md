# Contributing to Nextra Codemods

Thank you for your interest in contributing to Nextra Codemods! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/yourusername/nextra-codemods.git
   cd nextra-codemods
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development build:
   ```bash
   pnpm dev
   ```

## Testing

Run tests to make sure your changes don't break existing functionality:

```bash
pnpm test
```

For continuous testing during development:

```bash
pnpm test:watch
```

## Linting and Type Checking

Before submitting a PR, make sure your code passes linting and type checking:

```bash
pnpm lint
pnpm typecheck
```

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Add tests for your changes
4. Update documentation if necessary
5. Run tests, linting, and type checking
6. Submit a pull request

## Codemod Guidelines

When creating or modifying codemods:

1. Each codemod should have a single responsibility
2. Include tests for all edge cases
3. Document the purpose and usage of the codemod
4. Ensure backward compatibility when possible

## License

By contributing to Nextra Codemods, you agree that your contributions will be licensed under the project's MIT license.