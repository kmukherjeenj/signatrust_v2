/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // beforeFiles rewrites are checked before pages/public files and only apply if there's no matching file
      beforeFiles: [
        // forward browser calls to the gateway, but only for paths that don't have local API routes
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
          // The rewrite will be skipped if a matching API route exists in app/api/
          has: [
            {
              type: 'header',
              key: 'x-skip-local-api',
              value: 'true'
            }
          ]
        }
      ],
      // fallback rewrites are checked after pages/public files and dynamic routes
      fallback: [
        { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' }
      ]
    };
  }
};
export default nextConfig;