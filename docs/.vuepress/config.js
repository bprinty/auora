module.exports = {
  base: '/auora/',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Auora',
      description: 'Lightweight, Framework-Agnostic State Manager'
    }
  },
  plugins: [
    'autodoc'
  ],
  theme: '@vuepress/theme-default',
  themeConfig: {
    repo: 'bprinty/auora',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    sidebarDepth: 3,
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        editLinkText: 'Edit this page on GitHub',
        sidebar: {
          '/': [
            {
              title: 'Setup',
              path: '/setup/',
              collapsable: false,
            },
            {
              title: 'Guide',
              path: '/guide/',
              collapsable: false,
            },
            {
              title: 'Examples',
              path: '/examples/',
              collapsable: false,
            },
            {
              title: 'API',
              path: '/api/',
              collapsable: true,
            },
          ],
        }
      }
    }
  }
}
