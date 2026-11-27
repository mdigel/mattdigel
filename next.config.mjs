/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/running',
        destination: '/strava',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
