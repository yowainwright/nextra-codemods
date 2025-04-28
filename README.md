# Nextra Codemods

A collection of codemods to help migrate from Nextra v3 to v4.

## Overview

Nextra v4 introduces several breaking changes, including:

- App Router support (Pages Router discontinued)
- Discontinuing `theme.config` support
- New search engine (Pagefind)
- RSC i18n support
- And more

These codemods help automate the migration process.

## Migration Steps

1. **Choose your MDX rendering mode**:
   - Content directory convention (using catch-all route)
   - Page file convention (following App Router conventions)

2. **Migrate theme config**:
   - Convert `theme.config.js` to App Router layout structure
   - Create `app/layout.jsx` file with appropriate components

3. **Set up search**:
   - Install Pagefind
   - Configure postbuild script
   - Update .gitignore

4. **Update _meta files**:
   - Remove deprecated properties
   - Ensure they're server components

5. **Create mdx-components.jsx**:
   - Set up custom components
   - Import appropriate theme components

## Installation

```bash
# Using npm
npm install -g nextra-codemods

# Using yarn
yarn global add nextra-codemods

# Using pnpm
pnpm add -g nextra-codemods
```

## Usage

```bash
npx nextra-codemods <transform> <path>
```

### Available Transforms

- `migrate-theme-config`: Migrates theme.config.js/tsx to the new App Router layout structure
- `migrate-pages-to-app`: Converts Pages Router structure to App Router
- `setup-search`: Sets up the new Pagefind search engine
- `migrate-meta-files`: Updates _meta files to the new format
- `migrate-mdx-components`: Creates mdx-components.jsx file from custom components

## Examples

```bash
# Migrate theme config to app layout
npx nextra-codemods migrate-theme-config ./theme.config.jsx

# Convert pages directory to app directory
npx nextra-codemods migrate-pages-to-app ./pages

# Set up Pagefind search
npx nextra-codemods setup-search ./package.json

# Update _meta files
npx nextra-codemods migrate-meta-files ./_meta.js

# Create mdx-components.jsx from theme config
npx nextra-codemods migrate-mdx-components ./theme.config.jsx
```

### Example Project Structure

This repository includes example project structures for both migration approaches:

#### Content Directory Convention

```text
- app/
  - layout.jsx
  - [[...mdxPath]]/
    - page.jsx
- content/
  - _meta.js
  - index.mdx
  - docs/
    - index.mdx
- mdx-components.jsx
```

#### Page File Convention

```text
- app/
  - layout.jsx
  - page.mdx
  - docs/
    - page.mdx
- mdx-components.jsx
```

## Testing Environment

This repository includes a Tilt-based testing environment to help verify the codemods against a real Nextra v3 project.

### Prerequisites

- [Tilt](https://tilt.dev/) installed on your machine
- Node.js and npm

### Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `tilt up` to start the testing environment

### Testing Process

The testing environment:

1. Clones the Nextra v3 example repository
2. Creates a backup of the original project
3. Applies the codemods to the Nextra v3 project
4. Copies the migrated files to a new Nextra v4 directory
5. Updates the package.json for Nextra v4
6. Runs both the original Nextra v3 and migrated Nextra v4 projects

You can also use the `test-codemods.sh` script to test the codemods:

```bash
# Set up the test environment
./test-codemods.sh setup

# Apply codemods to the Nextra v3 project
./test-codemods.sh apply

# Copy the migrated files to the Nextra v4 directory
./test-codemods.sh copy

# Update the package.json for Nextra v4
./test-codemods.sh update

# Reset the test environment
./test-codemods.sh reset

# Run all steps
./test-codemods.sh all
```

## License

MIT
