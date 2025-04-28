import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Code } from './components/code'

export function useMDXComponents(components) {
  const docsComponents = getDocsMDXComponents()
  
  return {
    ...docsComponents,
    ...components,
    Code
  }
}
