/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages 배포 시에만 basePath 설정
  basePath: process.env.GITHUB_ACTIONS ? '/holdem' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

