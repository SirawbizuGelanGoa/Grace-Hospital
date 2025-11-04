
import type {NextConfig} from 'next';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Production mode configuration

  // Simple graceful shutdown for cPanel hosting
  let isShuttingDown = false;

  async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`[cPanel Safe] Received ${signal}: starting graceful shutdown...`);

    try {
      // Give a moment for any pending operations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[cPanel Safe] Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('[cPanel Safe] Error during shutdown:', error);
      process.exit(1);
    }
  }

  // Add graceful shutdown handlers for cPanel
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[cPanel Safe] Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[cPanel Safe] Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  console.log('[cPanel Safe] Process protection enabled - graceful shutdown handlers active');
}

const nextConfig: NextConfig = {
  // Add output configuration for better production deployment
  output: isProduction ? 'standalone' : undefined,
  
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
    // Allow local images from uploads directory
    domains: ['localhost'],
    // Configure image optimization for uploaded files
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Webpack configuration removed - no longer needed without Genkit
};

export default nextConfig;
