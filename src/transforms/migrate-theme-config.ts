import { FileInfo, API, Options } from 'jscodeshift';
import fs from 'fs';
import path from 'path';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
): string {
  if (!file.path.includes('theme.config')) {
    return file.source;
  }
  
  const j = api.jscodeshift;
  const root = j(file.source);
  const themeConfig: Record<string, any> = {};
  
  const defaultExport = root.find(j.ExportDefaultDeclaration);
  
  if (defaultExport.length === 0) {
    return file.source;
  }
  
  const objectExpression = defaultExport.find(j.ObjectExpression);
  
  if (objectExpression.length === 0) {
    return file.source;
  }
  
  objectExpression.forEach(path => {
    path.node.properties.forEach(prop => {
      if (prop.key.type === 'Identifier') {
        themeConfig[prop.key.name] = prop.value;
      }
    });
  });
  
  const projectRoot = options.projectRoot || process.cwd();
  const appDir = path.join(projectRoot, 'app');
  
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  
  const layoutContent = generateLayoutContent(j, themeConfig);
  fs.writeFileSync(path.join(appDir, 'layout.jsx'), layoutContent);
  
  const mdxComponentsContent = generateMdxComponentsContent(j, themeConfig);
  if (mdxComponentsContent) {
    fs.writeFileSync(path.join(projectRoot, 'mdx-components.jsx'), mdxComponentsContent);
  }
  
  return file.source;
}

function generateLayoutContent(j: any, themeConfig: Record<string, any>): string {
  const imports = [
    "import { DocsLayout } from 'nextra-theme-docs'",
    "import 'nextra-theme-docs/style.css'"
  ];
  
  const layoutProps = [];
  
  if (themeConfig.logo) {
    layoutProps.push("logo={<Logo />}");
    imports.push(`function Logo() {
  return ${themeConfig.logo.toString().replace(/^\(\) =>/, '')}
}`);
  }
  
  if (themeConfig.docsRepositoryBase) {
    layoutProps.push(`docsRepositoryBase="${themeConfig.docsRepositoryBase.value || ''}"`);
  }
  
  return `${imports.join('\n')}

export default function Layout({ children }) {
  return (
    <DocsLayout
      ${layoutProps.join('\n      ')}
    >
      {children}
    </DocsLayout>
  );
}`;
}

function generateMdxComponentsContent(j: any, themeConfig: Record<string, any>): string | null {
  if (!themeConfig.components) {
    return null;
  }
  
  return `import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(components) {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components
  }
}`;
}
