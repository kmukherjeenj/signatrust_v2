/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/circuits/:path*',
          destination: 'http://localhost:3000/circuits/:path*',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;


/** @type {import('next').NextConfig} 
const nextConfig = {};

export default nextConfig;*/