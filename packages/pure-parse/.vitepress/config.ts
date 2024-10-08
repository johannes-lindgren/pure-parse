import { defineConfig } from 'vitepress'
import typedocSidebar from '../docs/api/typedoc-sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'pure-parse',
  description: 'Derive parsers from types',
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Quick Start', link: '/guide/getting-started' },
          { text: 'Parsers', link: '/guide/parsers' },
          { text: 'Guards', link: '/guide/guards' },
          {
            text: 'Comparison with Other Libraries',
            link: '/guide/comparison',
          },
          {
            text: 'Declaring vs Inferring',
            link: '/guide/declaring-vs-inferring',
          },
        ],
      },
      {
        text: 'API Reference',
        items: typedocSidebar,
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/johannes-lindgren/pure-parse',
      },
    ],

    search: {
      provider: 'local',
    },
  },
})
