import { defineConfig } from 'vitepress'
import typedocSidebar from '../docs/api/typedoc-sidebar.json'

const baseUrl = 'https://pureparse.dev'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'PureParse',
  description:
    'Strongly typed validation library that decouples types from validation logic.',
  head: [
    ['link', { rel: 'icon', href: `${baseUrl}/logo-small.webp` }],
    [
      'meta',
      {
        name: 'description',
        content:
          'Strongly typed validation library that decouples types from validation logic.',
      },
    ],
    ['meta', { name: 'author', content: 'Johannes Lindgren' }],
    // Open Graph tags
    [
      'meta',
      {
        property: 'og:title',
        content: 'PureParse',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Strongly typed validation library that decouples types from validation logic.',
      },
    ],
    ['meta', { property: 'og:image', content: `${baseUrl}/logo-small.webp` }],
    ['meta', { property: 'og:type', content: 'website' }],
    // Twitter Card tags
    [
      'meta',
      {
        name: 'twitter:title',
        content: 'PureParse',
      },
    ],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          'Strongly typed validation library that decouples types from validation logic.',
      },
    ],
    ['meta', { name: 'twitter:image', content: `${baseUrl}/logo-small.webp` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  srcDir: 'docs',
  themeConfig: {
    logo: '/logo-small.webp',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Why PureParse?', link: '/guide/why-pure-parse' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Parsers', link: '/guide/parsers' },
          { text: 'Guards', link: '/guide/guards' },
          { text: 'Data Types', link: '/guide/data-types' },
          {
            text: 'Declaring vs. Inferring',
            link: '/guide/declaring-vs-inferring',
          },
          {
            text: 'Failure Handling',
            link: '/guide/error-handling',
          },
          { text: 'Transformations', link: '/guide/transformations' },
          { text: 'Custom Parsers', link: '/guide/customizing' },
          { text: 'Recursion', link: '/guide/recursion' },
          { text: 'Formatting', link: '/guide/formatting' },
          { text: 'JSON', link: '/guide/json' },
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
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/pure-parse',
      },
    ],

    search: {
      provider: 'local',
    },
  },
})
