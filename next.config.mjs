/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/circuits/:path*',
          destination: 'http://localhost:3000/circuits/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;


/** @type {import('next').NextConfig} 
const nextConfig = {};

export default nextConfig;*/