import { FileInfo, API, Options } from "jscodeshift";
import fs from "fs";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
): string {
  const projectRoot = options.projectRoot || process.cwd();

  // Skip if not a theme.config file
  if (!file.path.includes("theme.config")) {
    return file.source;
  }

  // Create mdx-components.jsx
  const mdxComponentsPath = path.join(projectRoot, "mdx-components.jsx");
  const mdxComponentsContent = `import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(components) {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components
  }
}`;

  try {
    fs.writeFileSync(mdxComponentsPath, mdxComponentsContent);
    console.log(`Created mdx-components.jsx at ${mdxComponentsPath}`);
  } catch (error) {
    console.error(
      `Failed to create mdx-components.jsx: ${(error as Error).message}`,
    );
  }

  return file.source;
}
