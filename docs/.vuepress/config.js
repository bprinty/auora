module.exports = {
  base: '/auora/',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Auora',
      description: '🦄 ~ Another state manager ~ 🔥',
      // description: 'Manage the state. Don\'t let it manage you.'
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
    displayAllHeaders: true,
    sidebarDepth: 1,
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        lastUpdated: 'Last Updated',
        editLinkText: 'Edit this page on GitHub',
        sidebar: {
          '/': [
            {
              title: 'Overview',
              path: '/overview/',
              collapsable: false,
              children: ['-']
            },
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
              title: 'Patterns',
              path: '/patterns/',
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
