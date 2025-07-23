
import type {NextConfig} from 'next';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  process.env.GENKIT_DISABLED = 'true';
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Potential fix for video error: If you are using a custom image loader or a global configuration
  // that tries to process all assets, ensure video files are explicitly excluded or handled separately.
  // The error 'The requested resource isn't a valid image for ...mp4' suggests Next.js's image optimization
  // is being applied to a video file. This next.config.ts only handles remote images.
  // If the video is a local asset, ensure it's served directly and not via next/image.
  webpack: (config, { isServer }) => {
    if (isProduction && isServer) {
      config.externals = [...config.externals, '@genkit-ai/next'];
    }
    return config;
  }
};

export default nextConfig;


