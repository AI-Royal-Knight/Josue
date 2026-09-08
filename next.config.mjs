/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "exceljs",
    "archiver",
    "unzipper",
    "duplexer2",
    "buffer-crc32",
    "compress-commons",
    "zip-stream",
  ],
  async redirects() {
    return [
      {
        source: "/terms",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/support",
        permanent: true,
      },
      {
        source: "/contact-support",
        destination: "/support",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
