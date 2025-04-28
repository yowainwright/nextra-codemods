import nextra from "nextra"

import { remarkCodeHike, recmaCodeHike } from "codehike/mdx"

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  components: { code: "Code" },
  syntaxHighlighting: {
    theme: "github-dark",
  },
}

const mdxOptions = {
  remarkPlugins: [[remarkCodeHike, chConfig]],
  recmaPlugins: [[recmaCodeHike, chConfig]],
}

const withNextra = nextra({
  mdxOptions,
})

export default withNextra()
