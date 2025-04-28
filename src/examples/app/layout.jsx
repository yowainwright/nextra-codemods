import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

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
          docsRepositoryBase="https://github.com/user/repo"
          footer={<Footer>MIT License</Footer>}
          navbar={<Navbar />}
          search={<Search />}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
