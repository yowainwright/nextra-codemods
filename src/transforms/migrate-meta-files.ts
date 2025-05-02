import { FileInfo, API, Options } from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
): string {
  if (!file.path.includes('_meta.js') && !file.path.includes('_meta.ts')) {
    return file.source;
  }
  
  const j = api.jscodeshift;
  const root = j(file.source);
  
  const defaultExport = root.find(j.ExportDefaultDeclaration);
  
  if (defaultExport.length === 0) {
    return file.source;
  }
  
  const objectExpression = defaultExport.find(j.ObjectExpression);
  
  if (objectExpression.length === 0) {
    return file.source;
  }
  
  objectExpression.forEach(path => {
    const properties = path.node.properties;
    
    properties.forEach((prop: any) => {
      if (prop.type === 'Property' && prop.key && prop.key.name === 'newWindow') {
        j(prop).remove();
      }
      
      if (prop.type === 'Property' && prop.key && prop.key.name === 'theme' && prop.value && prop.value.type === 'ObjectExpression') {
        const themeProps = prop.value.properties;
        const layoutProp = themeProps.find((p: any) => p.key && p.key.name === 'layout');
        
        if (layoutProp && layoutProp.value && layoutProp.value.type === 'StringLiteral' && layoutProp.value.value === 'raw') {
          j(layoutProp).remove();
        }
      }
    });
  });
  
  const useClientDirective = root.find(j.ExpressionStatement, {
    expression: {
      type: 'Literal',
      value: 'use client'
    }
  });
  
  if (useClientDirective.length === 0) {
    root.get().node.program.body.unshift(
      j.expressionStatement(j.literal('use client'))
    );
  }
  
  return root.toSource();
}
