/**
 * Updates _meta files to the new format
 */

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Check if this is a _meta file
  if (!fileInfo.path.includes('_meta.js') && !fileInfo.path.includes('_meta.ts')) {
    console.log('Not a _meta file, skipping');
    return fileInfo.source;
  }
  
  // Find the default export
  const defaultExport = root.find(j.ExportDefaultDeclaration);
  
  if (defaultExport.length === 0) {
    console.log('No default export found in _meta file');
    return fileInfo.source;
  }
  
  // Check if the default export is an object expression
  const objectExpression = defaultExport.find(j.ObjectExpression);
  
  if (objectExpression.length === 0) {
    console.log('Default export is not an object expression');
    return fileInfo.source;
  }
  
  // Process the properties of the object expression
  objectExpression.forEach(path => {
    const properties = path.node.properties;
    
    // Process each property
    properties.forEach(prop => {
      // Remove newWindow property
      if (prop.key && prop.key.name === 'newWindow') {
        j(prop).remove();
      }
      
      // Remove theme.layout: 'raw' property
      if (prop.key && prop.key.name === 'theme' && prop.value.type === 'ObjectExpression') {
        const themeProps = prop.value.properties;
        const layoutProp = themeProps.find(p => p.key && p.key.name === 'layout');
        
        if (layoutProp && layoutProp.value.type === 'StringLiteral' && layoutProp.value.value === 'raw') {
          j(layoutProp).remove();
        }
        
        // Remove topContent and bottomContent properties
        const topContentProp = themeProps.find(p => p.key && p.key.name === 'topContent');
        if (topContentProp) {
          j(topContentProp).remove();
        }
        
        const bottomContentProp = themeProps.find(p => p.key && p.key.name === 'bottomContent');
        if (bottomContentProp) {
          j(bottomContentProp).remove();
        }
      }
    });
  });
  
  // Add 'use client' directive if it doesn't exist
  const useClientDirective = root.find(j.Directive, {
    expression: { 
      type: 'Literal',
      value: 'use client'
    }
  });
  
  if (useClientDirective.length === 0) {
    // Add 'use client' directive at the beginning of the file
    root.get().node.program.body.unshift(
      j.expressionStatement(j.literal('use client'))
    );
  }
  
  return root.toSource();
};
