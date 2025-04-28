/**
 * Migrates theme.config.js/tsx to the new App Router layout structure
 */

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const themeConfig = {};
  
  // Find the default export
  const defaultExport = root.find(j.ExportDefaultDeclaration);
  
  if (defaultExport.length === 0) {
    console.log('No default export found in theme config file');
    return fileInfo.source;
  }
  
  // Check if the default export is an object expression
  const objectExpression = defaultExport.find(j.ObjectExpression);
  
  if (objectExpression.length === 0) {
    console.log('Default export is not an object expression');
    return fileInfo.source;
  }
  
  // Extract properties from the theme config
  const properties = objectExpression.get().node.properties;
  
  // Map theme config properties to their new locations in the App Router layout
  properties.forEach(prop => {
    if (prop.key && prop.key.name) {
      themeConfig[prop.key.name] = prop;
    }
  });
  
  // Generate the new layout.jsx file content
  const layoutContent = generateLayoutContent(j, themeConfig);
  
  // Create the mdx-components.jsx file content if needed
  const mdxComponentsContent = generateMdxComponentsContent(j, themeConfig);
  
  // Output the files
  console.log('Generated layout.jsx content:');
  console.log(layoutContent);
  
  if (mdxComponentsContent) {
    console.log('\nGenerated mdx-components.jsx content:');
    console.log(mdxComponentsContent);
  }
  
  // Return the original source (we're not modifying the input file)
  return fileInfo.source;
};

/**
 * Generate the layout.jsx file content based on the theme config
 */
function generateLayoutContent(j, themeConfig) {
  // Determine which theme is being used (docs or blog)
  const isDocsTheme = true; // Default to docs theme
  
  // Start building the imports
  let imports = [];
  let layoutProps = [];
  
  if (isDocsTheme) {
    imports.push("import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'");
    imports.push("import { Banner, Head, Search } from 'nextra/components'");
    imports.push("import { getPageMap } from 'nextra/page-map'");
    imports.push("import 'nextra-theme-docs/style.css'");
  } else {
    imports.push("import { Footer, Layout, Navbar, ThemeSwitch } from 'nextra-theme-blog'");
    imports.push("import { Banner, Head, Search } from 'nextra/components'");
    imports.push("import { getPageMap } from 'nextra/page-map'");
    imports.push("import 'nextra-theme-blog/style.css'");
  }
  
  // Map theme config properties to layout props
  if (themeConfig.logo) {
    layoutProps.push("logo={<MyLogo />}");
  }
  
  if (themeConfig.project) {
    layoutProps.push("project={project}");
  }
  
  if (themeConfig.docsRepositoryBase) {
    layoutProps.push("docsRepositoryBase=\"" + themeConfig.docsRepositoryBase.value.value + "\"");
  }
  
  if (themeConfig.footer) {
    layoutProps.push("footer={<Footer>{/* Your footer content */}</Footer>}");
  }
  
  if (themeConfig.i18n) {
    layoutProps.push(`i18n={[
    { locale: 'en', name: 'English' },
    // Add your other locales here
  ]}`);
  }
  
  // Generate the layout.jsx content
  return `${imports.join('\n')}

export const metadata = {
  title: {
    default: 'My Nextra Site',
    template: '%s | My Nextra Site'
  },
  description: 'My Nextra Site Description'
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          ${layoutProps.join('\n          ')}
          navbar={<Navbar />}
          search={<Search />}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}`;
}

/**
 * Generate the mdx-components.jsx file content based on the theme config
 */
function generateMdxComponentsContent(j, themeConfig) {
  // Check if we need to generate mdx-components.jsx
  const hasComponents = themeConfig.components;
  
  if (!hasComponents) {
    return null;
  }
  
  // Determine which theme is being used (docs or blog)
  const isDocsTheme = true; // Default to docs theme
  
  return `import { useMDXComponents as ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'} } from '${isDocsTheme ? 'nextra-theme-docs' : 'nextra-theme-blog'}'

export function useMDXComponents(components) {
  const ${isDocsTheme ? 'docsComponents' : 'blogComponents'} = ${isDocsTheme ? 'getDocsMDXComponents' : 'getBlogMDXComponents'}()
  
  return {
    ...${isDocsTheme ? 'docsComponents' : 'blogComponents'},
    ...components
    // Add your custom components here
  }
}`;
}
