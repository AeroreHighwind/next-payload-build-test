/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // fully static -> ./out
  trailingSlash: true,       // /about/index.html, friendly for any static host
  images: { unoptimized: true }, // no image server at runtime
}
export default nextConfig
