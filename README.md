# Nextra Codemods

A collection of codemods to help migrate Nextra versions.

Currently, this repository contains codemods to help migrate from Nextra v3 to v4.

## Overview

### Nextra v3 to v4

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
# Using pnpm
pnpm add -g nextra-codemods
```

## Usage

```bash
npx nextra-codemods <transform> <path>
```

### Available Transforms

- `migrate-theme-config`: Migrates theme.config.js/tsx to the new App Router layout structure
- `setup-search`: Sets up the new Pagefind search engine
- `migrate-meta-files`: Updates _meta files to the new format
- `migrate-mdx-components`: Creates mdx-components.jsx file from custom components

## Examples

```bash
# Migrate theme config to app layout
npx nextra-codemods migrate-theme-config ./theme.config.jsx

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

This repository includes a Tiltfile to help test the codemods against a real Nextra v3 project.

### Prerequisites

- [Docker](https://www.docker.com/) installed and running
- [Kubernetes](https://kubernetes.io/) cluster (or [Docker Desktop with Kubernetes enabled](https://docs.docker.com/desktop/kubernetes/))
- [Tilt](https://tilt.dev/) installed

### Testing with Tilt

To test the codemods:

```bash
# Run Tilt
tilt up
```

The Tiltfile will:

1. Build a Docker image with a Nextra v3 project from [https://github.com/code-hike/examples/tree/main/with-nextra-3](https://github.com/code-hike/examples/tree/main/with-nextra-3)
2. Deploy it to your Kubernetes cluster as a test service
3. Make it accessible at [http://localhost:3000](http://localhost:3000)

You can then manually apply the codemods to the running project to test their effectiveness.

### Accessing the Test Service

Once Tilt is running, you can access the Nextra v3 test service at [http://localhost:3000](http://localhost:3000).

The Tilt UI (available at [http://localhost:10350](http://localhost:10350)) will also provide links to the test service and show the status of each step in the process.

## License

MIT
