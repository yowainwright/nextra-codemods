import { Footer, LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'My Nextra Documentation',
    template: '%s | My Nextra Documentation'
  },
  description: 'Documentation built with Nextra'
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          logo={<span>My Nextra Documentation</span>}
          project={{
            link: "https://github.com/code-hike/codehike",
          }}
          navbar={<Navbar />}
          search={<Search />}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
