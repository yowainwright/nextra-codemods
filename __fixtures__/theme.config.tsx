import React from 'react'
import { useConfig } from 'nextra-theme-docs'

export default {
  logo: () => <span>My Project</span>,
  project: {
    link: 'https://github.com/user/repo'
  },
  docsRepositoryBase: 'https://github.com/user/repo',
  footer: {
    text: 'MIT License'
  },
  head: () => {
    const { frontMatter } = useConfig()
    return (
      <>
        <meta property="og:title" content={frontMatter.title || 'My Project'} />
        <meta property="og:description" content={frontMatter.description || 'My Project Description'} />
      </>
    )
  },
  i18n: [
    { locale: 'en', text: 'English' },
    { locale: 'fr', text: 'Français' }
  ],
  components: {
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    pre: ({ children }) => <pre className="custom-pre">{children}</pre>
  }
}
