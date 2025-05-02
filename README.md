# Nextra Codemods

A collection of codemods to help migrate Nextra versions.

Currently, this repository contains codemods to help migrate from Nextra v3 to v4.

## Overview

Nextra v4 introduces several breaking changes, including:

- App Router support (Pages Router discontinued)
- Discontinuing `theme.config` support
- New search engine (Pagefind)
- RSC i18n support
- And more

These codemods help automate the migration process.

## Quick Start

The easiest way to migrate your Nextra v3 project to v4 is to use our interactive CLI:

```bash
# Using pnpm dlx (recommended)
pnpm dlx nextra-migrate

# Or install globally
pnpm add -g nextra-codemods
nextra-migrate
```

This interactive tool will:

1. Analyze your project structure
2. Create backups of important files
3. Migrate your theme configuration
4. Convert pages to the App Router format
5. Set up Pagefind search
6. Update your Next.js configuration
7. Configure Tailwind CSS and fix styling issues
8. Update dependencies to Nextra v4
9. Install all required packages

Just follow the prompts and your project will be migrated automatically!

## Manual Migration

If you prefer to run the individual steps manually, you can use the following commands:

```bash
# Step 1: Migrate theme config
pnpm dlx nextra-codemods migrate-theme-config ./theme.config.jsx

# Step 2: Migrate pages to app directory
pnpm dlx nextra-codemods migrate-pages-to-app ./pages

# Step 3: Set up search
pnpm dlx nextra-codemods setup-search ./package.json

# Step 4: Update Next.js config
pnpm dlx nextra-codemods update-next-config ./next.config.js

# Step 5: Fix styling issues
pnpm dlx nextra-codemods fix-all-styles

# Step 6: Update dependencies
pnpm install nextra@latest nextra-theme-docs@latest
# or
pnpm add nextra@latest nextra-theme-docs@latest
```

## Using on Your Project

To use these codemods on your actual Nextra v3 project, follow these steps:

### Method 1: Using the CLI (Recommended)

1. Navigate to your Nextra v3 project directory:
   ```bash
   cd your-nextra-v3-project
   ```

2. Run the interactive migration CLI:
   ```bash
  pnpm dlx nextra-migrate
   ```

3. Follow the prompts to complete the migration process.

4. After migration, start your development server to verify the changes:
   ```bash
   pnpm dev
   ```

### Method 2: Manual Migration

If you prefer more control over the migration process, you can run individual codemods:

1. Navigate to your Nextra v3 project directory:
   ```bash
   cd your-nextra-v3-project
   ```

2. Create backups of your important files:
   ```bash
   cp -r pages pages.bak
   cp theme.config.jsx theme.config.jsx.bak
   cp next.config.js next.config.js.bak
   ```

3. Run the individual codemods in sequence:
   ```bash
   # Migrate theme configuration
   pnpm dlx nextra-codemods migrate-theme-config ./theme.config.jsx
   
   # Migrate pages to app directory
   pnpm dlx nextra-codemods migrate-pages-to-app ./pages
   
   # Set up Pagefind search
   pnpm dlx nextra-codemods setup-search ./package.json
   
   # Update Next.js configuration
   pnpm dlx nextra-codemods update-next-config ./next.config.js
   
   # Set up Tailwind CSS
   pnpm dlx nextra-codemods fix-tailwind
   
   # Fix all styling issues
   pnpm dlx nextra-codemods fix-all-styles
   ```

4. Update your dependencies:
   ```bash
   pnpm add nextra@latest nextra-theme-docs@latest
   ```

5. Start your development server to verify the changes:
   ```bash
   pnpm dev
   ```

## Troubleshooting

If you encounter any issues during migration, you can use our fix scripts:

```bash
# Fix all common issues at once
pnpm dlx nextra-codemods fix-nextra

# Or fix specific issues
pnpm dlx nextra-codemods fix-conflicts  # Fix conflicting files
pnpm dlx nextra-codemods fix-tailwind   # Fix Tailwind CSS issues
pnpm dlx nextra-codemods fix-next-config # Fix Next.js config
pnpm dlx nextra-codemods fix-code-hike  # Set up Code Hike
```

## Project Structure After Migration

After running the migration, your project structure should look like:

```text
- app/
  - layout.tsx      # Contains theme configuration
  - page.mdx        # Root page
  - _meta.js        # Navigation and page metadata
  - globals.css     # Global styles with Tailwind
  - docs/
    - page.mdx      # Doc pages
- mdx-components.tsx # Custom MDX components
- next.config.js    # Updated Next.js config
- package.json      # Updated with Nextra v4 and Pagefind
- tailwind.config.js # Tailwind CSS configuration
- postcss.config.js # PostCSS configuration
```

## Development

To contribute to this project:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nextra-codemods.git
   cd nextra-codemods
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

4. Build the project:
   ```bash
   pnpm build
   ```

## Releasing

This project uses [release-it](https://github.com/release-it/release-it) to manage releases. To create a new release:

1. Make sure all your changes are committed and pushed to the repository.

2. Run the release command:
   ```bash
   pnpm release
   ```

3. Follow the interactive prompts to select the new version number.

4. The release process will:
   - Run linting and tests
   - Bump the version in package.json
   - Build the project
   - Generate/update the CHANGELOG.md file
   - Create a Git tag and commit
   - Push changes to GitHub
   - Create a GitHub release
   - Publish to npm

For a dry run without making any changes, use:
```bash
pnpm release --dry-run
```

### Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for generating changelogs. Please format your commit messages as:

- `feat: add new feature` - for new features
- `fix: resolve issue` - for bug fixes
- `docs: update documentation` - for documentation changes
- `chore: update build scripts` - for maintenance tasks
- `refactor: improve code structure` - for code improvements
- `test: add tests` - for test additions or modifications

## License

MIT
