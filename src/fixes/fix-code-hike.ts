#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("Setting up Code Hike for Nextra v4...");

// Update package.json to add Code Hike dependencies
const packageJsonPath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  // Add Code Hike dependencies if not present
  if (!packageJson.dependencies["@code-hike/mdx"]) {
    packageJson.dependencies["@code-hike/mdx"] = "^0.9.0";
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated package.json with Code Hike dependencies`);

  // Install dependencies
  try {
    console.log("Installing Code Hike dependencies...");
    execSync("pnpm install", { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to install dependencies:", error);
  }
}

// Update next.config.js to include Code Hike
const configPath = fs.existsSync(path.join(process.cwd(), "next.config.mjs"))
  ? path.join(process.cwd(), "next.config.mjs")
  : path.join(process.cwd(), "next.config.js");

if (fs.existsSync(configPath)) {
  const isEsm = configPath.endsWith(".mjs");

  // Create backup
  const backupPath = `${configPath}.codehike.bak`;
  fs.copyFileSync(configPath, backupPath);
  console.log(`Backup created at ${backupPath}`);

  // Create new config content with Code Hike
  const newConfigContent = isEsm
    ? `import nextra from 'nextra'
import { CH } from '@code-hike/mdx/components'

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  }
})

export default withNextra({
  // Other Next.js configurations
})
`
    : `const nextra = require('nextra')
const { CH } = require('@code-hike/mdx/components')

const withNextra = nextra({
  // Configure Nextra for docs theme
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  }
})

module.exports = withNextra({
  // Other Next.js configurations
})
`;

  fs.writeFileSync(configPath, newConfigContent);
  console.log(`Updated ${configPath} with Code Hike configuration`);
}

// Update mdx-components.tsx to include Code Hike components
const mdxComponentsPath = path.join(process.cwd(), "mdx-components.tsx");
if (fs.existsSync(mdxComponentsPath)) {
  const mdxComponentsContent = `import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDocsMDXComponents } from 'nextra/mdx-components'
import { CH } from '@code-hike/mdx/components'
import Image from 'next/image'
import { Callout } from 'nextra/components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components,
    // Add Code Hike components
    CH,
    // Override components as needed
    img: (props) => (
      <Image 
        {...props} 
        alt={props.alt || ''} 
        width={props.width || 800} 
        height={props.height || 450} 
      />
    ),
    Callout,
  }
}
`;

  fs.writeFileSync(mdxComponentsPath, mdxComponentsContent);
  console.log(`Updated mdx-components.tsx with Code Hike components`);
} else {
  // Create mdx-components.tsx if it doesn't exist
  const mdxComponentsContent = `import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDocsMDXComponents } from 'nextra/mdx-components'
import { CH } from '@code-hike/mdx/components'
import Image from 'next/image'
import { Callout } from 'nextra/components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components,
    // Add Code Hike components
    CH,
    // Override components as needed
    img: (props) => (
      <Image 
        {...props} 
        alt={props.alt || ''} 
        width={props.width || 800} 
        height={props.height || 450} 
      />
    ),
    Callout,
  }
}
`;

  fs.writeFileSync(mdxComponentsPath, mdxComponentsContent);
  console.log(`Created mdx-components.tsx with Code Hike components`);
}

// Create Code Hike CSS file
const appDir = path.join(process.cwd(), "app");
if (fs.existsSync(appDir)) {
  const globalsCssPath = path.join(appDir, "globals.css");
  if (fs.existsSync(globalsCssPath)) {
    let globalsCssContent = fs.readFileSync(globalsCssPath, "utf8");

    // Add Code Hike CSS import if not already present
    if (!globalsCssContent.includes("@code-hike/mdx/styles.css")) {
      globalsCssContent = `@import '@code-hike/mdx/styles.css';\n${globalsCssContent}`;
      fs.writeFileSync(globalsCssPath, globalsCssContent);
      console.log(`Updated globals.css with Code Hike styles`);
    }
  }
}

// Create an example page with Code Hike
const examplesDir = path.join(process.cwd(), "app", "examples");
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

const codeHikeExamplePath = path.join(examplesDir, "code-hike.mdx");
const codeHikeExampleContent = `# Code Hike Example

Here's an example of using Code Hike with Nextra v4:

<CH.Code>
\`\`\`js
function hello() {
  console.log("Hello, world!");
  return "Hello, world!";
}

hello();
\`\`\`
</CH.Code>

## Code Spotlight

<CH.Spotlight>
\`\`\`js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}
\`\`\`

<CH.Focus lines="4-6" />
This function subtracts \`b\` from \`a\` and returns the result.

<CH.Focus lines="8-10" />
This function multiplies \`a\` and \`b\` and returns the product.

<CH.Focus lines="12-17" />
This function divides \`a\` by \`b\` but first checks if \`b\` is zero to avoid division by zero errors.
</CH.Spotlight>
`;

fs.writeFileSync(codeHikeExamplePath, codeHikeExampleContent);
console.log(`Created Code Hike example at ${codeHikeExamplePath}`);

// Update _meta.js to include the Code Hike example
const metaPath = path.join(process.cwd(), "app", "_meta.js");
if (fs.existsSync(metaPath)) {
  let metaContent = fs.readFileSync(metaPath, "utf8");

  // Check if examples section exists and if code-hike is already included
  if (metaContent.includes("examples:") && !metaContent.includes("code-hike")) {
    // Add code-hike to examples
    metaContent = metaContent.replace(
      /examples:\s*{([^}]*)}/,
      (match, p1) => `examples: {${p1}  'code-hike': 'Code Hike',\n}`,
    );

    fs.writeFileSync(metaPath, metaContent);
    console.log(`Updated _meta.js to include Code Hike example`);
  }
}

console.log("Code Hike setup complete!");
