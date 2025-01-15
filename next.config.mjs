/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pbdjqozuekzpfhyoyjiw.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbdjqozuekzpfhyoyjiw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/trip-images/',
        search: '',
      },
    ],
  },
};

export default nextConfig;
