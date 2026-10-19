/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['@uponu-solutions/mantine-react-table'],
  reactStrictMode: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  // proxies the (legacy, domain based) Plausible script and API, see pages/_app.tsx
  async rewrites() {
    return [
      {
        source: '/proxy/js/script.js',
        destination: 'https://plausible.io/js/script.js',
      },
      {
        source: '/proxy/api/event',
        destination: 'https://plausible.io/api/event',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/docs/guides/customize-components',
        destination: '/docs/guides/customize-component-styles',
        permanent: true,
      },
      {
        source: '/docs/guides/table-event-listeners',
        destination: '/docs/guides/event-listeners',
        permanent: true,
      },
      {
        source: '/docs/guides/sticky-header-footer',
        destination: '/docs/guides/sticky-header',
        permanent: true,
      },
      {
        source: '/docs/guides/column-actions-menu',
        destination: '/docs/guides/column-actions',
        permanent: true,
      },
      {
        source: '/docs/guides/memoize-components',
        destination: '/docs/guides/memoization',
        permanent: true,
      },
      {
        source: '/docs/guides/aggregation-and-grouping',
        destination: '/docs/guides/column-grouping',
        permanent: true,
      },
      {
        source: '/docs/guides/typescript',
        destination: '/docs/guides/best-practices',
        permanent: true,
      },
      {
        source: '/docs/getting-started/typescript',
        destination: '/docs/guides/best-practices',
        permanent: true,
      },
      {
        source: '/docs/guides/filtering',
        destination: '/docs/guides/column-filtering',
        permanent: true,
      },
      {
        source: '/docs/install',
        destination: '/docs/getting-started/install',
        permanent: true,
      },
      {
        source: '/docs/usage',
        destination: '/docs/getting-started/usage',
        permanent: true,
      },
      {
        source: '/docs/guides/column-ordering',
        destination: '/docs/guides/column-ordering-dnd',
        permanent: true,
      },
      {
        source: '/docs/guides/column-dragging',
        destination: '/docs/guides/column-ordering-dnd',
        permanent: true,
      },
      {
        source: '/docs/guides/row-dragging',
        destination: '/docs/guides/row-ordering-dnd',
        permanent: true,
      },
      {
        source: '/docs/guides/row-ordering',
        destination: '/docs/guides/row-ordering-dnd',
        permanent: true,
      },
      {
        source: '/docs/guides/row-virtualization',
        destination: '/docs/guides/virtualization',
        permanent: true,
      },
      {
        source: '/docs/api/props',
        destination: '/docs/api/table-options',
        permanent: true,
      },
      {
        source: '/docs/examples/data-export',
        destination: '/docs/examples/export-csv',
        permanent: true,
      },
    ];
  },
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
  },
});

module.exports = {
  ...nextConfig,
  ...withMDX({
    pageExtensions: ['js', 'ts', 'tsx', 'jsx', 'md', 'mdx'],
  }),
};
