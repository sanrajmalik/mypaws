/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mypaws.in',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: 'mypaws_api',
                port: '5000',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                // Redirect legacy /uploads requests to /api/uploads on backend
                destination: `${process.env.INTERNAL_API_URL || 'http://localhost:5000/api'}/uploads/:path*`,
            },
            {
                source: '/api/:path*',
                destination: `${process.env.INTERNAL_API_URL || 'http://localhost:5000/api'}/:path*`,
            }
        ];
    },
};

export default nextConfig;
