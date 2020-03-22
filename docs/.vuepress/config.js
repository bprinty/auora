module.exports = {
  base: '/vuex-reflect/',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vuex Reflect',
      description: 'Front-End Data Models with Vuex'
    }
  },
  plugins: {
    'vuepress-plugin-autodoc': {},
  },
  theme: '@vuepress/theme-default',
  themeConfig: {
    repo: 'bprinty/vuex-reflect',
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
        // nav: [
        //   {
        //     text: 'API',
        //     link: '/api/'
        //   },
        // ],
        sidebar: {
          '/': [
            {
              title: 'Overview ',
              path: '/',
              collapsable: false,
            },
            {
              title: 'Setup',
              collapsable: false,
              children: [
                '/guide/setup/install',
                '/guide/setup/configure',
              ],
            },
            {
              title: 'Models',
              collapsable: false,
              children: [
                '/guide/models/overview',
                '/guide/models/api',
                '/guide/models/properties',
                '/guide/models/relationships',
                '/guide/models/querying',
                '/guide/models/customization',
                '/guide/models/singleton',
              ],
            },
            {
              title: 'Store',
              collapsable: false,
              children: [
                '/guide/store/overview',
                '/guide/store/api',
                '/guide/store/contract',
                '/guide/store/relationships',
                '/guide/store/querying',
                '/guide/store/singleton',
                '/guide/store/debugging',
              ],
            },
            // {
            //   title: 'Examples',
            //   collapsable: false,
            //   children: [
            //     '/guide/examples/todo',
            //     '/guide/examples/blog',
            //   ],
            // },
          ],
        }
      }
    }
  }
}
