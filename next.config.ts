import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [25, 50, 75, 85, 100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
      {
        // Vercel Blob storage hostname — permite Next/Image otimizar
        // imagens servidas diretamente do Blob (uploads, seed).
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  poweredByHeader: false,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
  // NOTA: `experimental.turbopackServerFastRefresh` é intencionalmente NÃO
  // declarado aqui. O `withPayload` (do @payloadcms/next) força esta flag
  // para `false` em Next.js >= 16.2.2 porque "Server fast refresh breaks
  // HMR" no Payload Admin. Como o spread do `experimental` no withPayload
  // vem DEPOIS do nosso, qualquer valor aqui seria sobrescrito.
  // Referência: node_modules/@payloadcms/next/dist/withPayload/withPayload.js
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
