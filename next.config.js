/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'uploadthing.com',
      //   port: '',
      //   pathname: '/**',
      // },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: "reddit-clone-24gxagmphhhw3x.s3.eu-north-1.amazonaws.com",
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
