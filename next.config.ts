import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        // When running locally, push all /api requests to the local Flask server
        source: '/flask/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/flask/:path*'
            : '/flask/:path*',
      },
    ];
  },
};

export default nextConfig;
