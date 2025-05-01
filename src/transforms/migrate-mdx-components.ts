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
  const projectRoot = options.projectRoot || process.cwd();
  
  const componentsProperty = root.find(j.Property, {
    key: { name: 'components' }
  });
  
  if (componentsProperty.length === 0) {
    return file.source;
  }
  
  let isDocsTheme = true;
  
  const themeProperty = root.find(j.Property, {
    key: { name: 'theme' }
  });
  
  if (themeProperty.length > 0) {
    const themeValue = themeProperty.get().node.value;
    if (themeValue.type === 'StringLiteral' && themeValue.value === 'nextra-theme-blog') {
      isDocsTheme = false;
    }
  }
  
  const mdxComponentsContent = `import { useMDXComponents as ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'} } from '${isDocsTheme ? 'nextra-theme-docs' : 'nextra-theme-blog'}'

export function useMDXComponents(components) {
  const ${isDocsTheme ? 'docsComponents' : 'blogComponents'} = ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'}()
  
  return {
    ...${isDocsTheme ? 'docsComponents' : 'blogComponents'},
    ...components
  }
}`;
  
  const mdxComponentsPath = path.join(projectRoot, 'mdx-components.jsx');
  fs.writeFileSync(mdxComponentsPath, mdxComponentsContent);
  
  return file.source;
}