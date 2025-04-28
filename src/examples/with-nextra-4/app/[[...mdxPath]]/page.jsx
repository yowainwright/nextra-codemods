import { MDXContent } from 'nextra/mdx'
import { getContent } from 'nextra/content'

export default async function Page({ params }) {
  const { mdxPath } = params
  const content = await getContent(mdxPath)
  
  if (!content) {
    return <div>Page not found</div>
  }
  
  return <MDXContent {...content} />
}
