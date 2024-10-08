import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json'
import { link } from 'typedoc-plugin-markdown/dist/libs/markdown'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'pure-parse',
  description: 'Derive parsers from types',
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/docs/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/docs/guide/overview' },
          { text: 'Quick Start', link: '/docs/guide/getting-started' },
          { text: 'Parsers', link: '/docs/guide/parsers' },
          { text: 'Guards', link: '/docs/guide/guards' },
          {
            text: 'Comparison with Other Libraries',
            link: '/docs/guide/comparison',
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
