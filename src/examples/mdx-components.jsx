import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(components) {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components,
    // Custom components
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    pre: ({ children }) => <pre className="custom-pre">{children}</pre>
  }
}
