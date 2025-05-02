export default {
  index: {
    title: 'Home',
    type: 'page',
    display: 'hidden'
  },
  docs: {
    title: 'Documentation',
    type: 'page',
    newWindow: true
  },
  blog: {
    title: 'Blog',
    type: 'page',
    theme: {
      layout: 'raw',
      topContent: () => <div>Top Content</div>,
      bottomContent: () => <div>Bottom Content</div>
    }
  },
  about: {
    title: 'About',
    type: 'menu',
    items: {
      team: {
        title: 'Team',
        href: '/about/team'
      },
      contact: {
        title: 'Contact',
        href: '/about/contact'
      }
    }
  }
}
