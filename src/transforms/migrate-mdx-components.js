/**
 * Creates mdx-components.jsx file from custom components
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Get the directory of the file being processed
  const filePath = fileInfo.path;
  const projectRoot = options.projectRoot || process.cwd();
  
  // Check if this is a theme.config.js file
  if (!filePath.includes('theme.config.js') && !filePath.includes('theme.config.jsx') && 
      !filePath.includes('theme.config.ts') && !filePath.includes('theme.config.tsx')) {
    console.log('Not a theme.config file, skipping');
    return fileInfo.source;
  }
  
  // Find the components property in the theme config
  const componentsProperty = root.find(j.Property, {
    key: {
      name: 'components'
    }
  });
  
  if (componentsProperty.length === 0) {
    console.log('No components property found in theme config');
    return fileInfo.source;
  }
  
  // Determine which theme is being used (docs or blog)
  let isDocsTheme = true;
  
  // Check for theme property
  const themeProperty = root.find(j.Property, {
    key: {
      name: 'theme'
    }
  });
  
  if (themeProperty.length > 0) {
    const themeValue = themeProperty.get().node.value;
    if (themeValue.type === 'StringLiteral' && themeValue.value === 'nextra-theme-blog') {
      isDocsTheme = false;
    }
  }
  
  // Create the mdx-components.jsx content
  const mdxComponentsContent = `import { useMDXComponents as ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'} } from '${isDocsTheme ? 'nextra-theme-docs' : 'nextra-theme-blog'}'

export function useMDXComponents(components) {
  const ${isDocsTheme ? 'docsComponents' : 'blogComponents'} = ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'}()
  
  return {
    ...${isDocsTheme ? 'docsComponents' : 'blogComponents'},
    ...components
    // Add your custom components here
  }
}`;
  
  // Write the mdx-components.jsx file
  const mdxComponentsPath = path.join(projectRoot, 'mdx-components.jsx');
  fs.writeFileSync(mdxComponentsPath, mdxComponentsContent);
  
  console.log(`Created mdx-components.jsx file at ${mdxComponentsPath}`);
  
  // Return the original source (we're not modifying the input file)
  return fileInfo.source;
};
