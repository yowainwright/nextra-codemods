/**
 * Converts Pages Router structure to App Router
 */

const fs = require('fs');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Get the directory of the file being processed
  const filePath = fileInfo.path;
  const projectRoot = options.projectRoot || process.cwd();
  
  // Check if the file is in the pages directory
  if (!filePath.includes('/pages/')) {
    console.log('File is not in the pages directory, skipping');
    return fileInfo.source;
  }
  
  // Get the relative path from the pages directory
  const pagesDir = path.join(projectRoot, 'pages');
  const relativePath = path.relative(pagesDir, filePath);
  
  // Determine the new path in the app directory
  const appDir = path.join(projectRoot, 'app');
  let newPath;
  
  // Handle special cases like _app.js, _document.js, etc.
  if (relativePath === '_app.js' || relativePath === '_app.tsx') {
    console.log('Skipping _app.js as it should be migrated to app/layout.js');
    return fileInfo.source;
  }
  
  if (relativePath === '_document.js' || relativePath === '_document.tsx') {
    console.log('Skipping _document.js as it should be migrated to app/layout.js');
    return fileInfo.source;
  }
  
  if (relativePath === 'index.js' || relativePath === 'index.tsx' || 
      relativePath === 'index.md' || relativePath === 'index.mdx') {
    newPath = path.join(appDir, 'page' + path.extname(relativePath));
  } else {
    // For other files, create a directory with the same name and add a page.js file
    const dirName = path.basename(relativePath, path.extname(relativePath));
    newPath = path.join(appDir, dirName, 'page' + path.extname(relativePath));
  }
  
  // Create the directory if it doesn't exist
  const newDir = path.dirname(newPath);
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true });
  }
  
  // Modify the file content for App Router
  let newContent = fileInfo.source;
  
  // Replace imports
  newContent = newContent.replace(/import\s+{\s*useRouter\s*}\s+from\s+['"]next\/router['"]/g, 
                                 "import { useRouter } from 'next/navigation'");
  
  // Replace getStaticProps with generateStaticParams if needed
  if (newContent.includes('export async function getStaticProps')) {
    newContent = newContent.replace(/export\s+async\s+function\s+getStaticProps/g, 
                                   'export async function generateStaticParams');
  }
  
  // Add metadata export if it's a page
  if (!newContent.includes('export const metadata')) {
    const metadataExport = `
export const metadata = {
  title: 'Page Title',
  description: 'Page Description'
}
`;
    
    // Find a good place to insert the metadata export
    const importEndIndex = newContent.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const importLineEndIndex = newContent.indexOf('\n', importEndIndex);
      if (importLineEndIndex !== -1) {
        newContent = newContent.slice(0, importLineEndIndex + 1) + 
                     metadataExport + 
                     newContent.slice(importLineEndIndex + 1);
      }
    }
  }
  
  // Write the modified content to the new file
  fs.writeFileSync(newPath, newContent);
  
  console.log(`Migrated ${filePath} to ${newPath}`);
  
  // Return the original source (we're not modifying the input file)
  return fileInfo.source;
};
