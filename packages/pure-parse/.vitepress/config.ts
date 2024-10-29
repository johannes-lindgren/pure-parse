import { defineConfig } from 'vitepress'
import typedocSidebar from '../docs/api/typedoc-sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'PureParse',
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
        text: 'Guides',
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Quick Start', link: '/guide/getting-started' },
          { text: 'Parsers', link: '/guide/parsers' },
          { text: 'Guards', link: '/guide/guards' },
          { text: 'Failsafe Parsing', link: '/guide/failsafe-parsing' },
          { text: 'Customizing', link: '/guide/customizing' },
          { text: 'Performance', link: '/guide/performance' },
          { text: 'Security', link: '/guide/security' },
          {
            text: 'Comparison',
            link: '/guide/comparison',
            items: [
              {
                text: 'Zod',
                link: '/guide/comparison#zod',
              },
              {
                text: 'Joi',
                link: '/guide/comparison#joi',
              },
              {
                text: 'Ajv',
                link: '/guide/comparison#ajv',
              },
              {
                text: 'Yup',
                link: '/guide/comparison#yup',
              },
            ],
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

    editLink: {
      pattern:
        'https://github.com/johannes-lindgren/pure-parse/edit/main/packages/pure-parse/docs/:path',
    },
  },
})
