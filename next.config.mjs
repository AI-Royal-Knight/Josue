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
}

export default nextConfig
