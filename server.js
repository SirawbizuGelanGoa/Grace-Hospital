#!/usr/bin/env node

/**
 * Grace Hospital Website - cPanel Entry Server
 * Robust server entry point for cPanel shared hosting
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Load environment variables
require('dotenv').config();

// Configuration for cPanel hosting
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`[Grace Hospital] Starting server in ${dev ? 'development' : 'production'} mode`);
console.log(`[Grace Hospital] Server will run on http://${hostname}:${port}`);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track server state
let server = null;
let isShuttingDown = false;

// Graceful shutdown function for cPanel
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log(`[Grace Hospital] Already shutting down, ignoring ${signal}`);
    return;
  }
  
  isShuttingDown = true;
  console.log(`[Grace Hospital] Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    if (server) {
      console.log('[Grace Hospital] Closing HTTP server...');
      server.close(() => {
        console.log('[Grace Hospital] HTTP server closed');
      });
    }
    
    // Give time for existing connections to finish
    console.log('[Grace Hospital] Waiting for existing connections to finish...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('[Grace Hospital] Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('[Grace Hospital] Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup signal handlers for cPanel
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Grace Hospital] Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Grace Hospital] Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// No auto-shutdown - website should remain accessible 24/7

// Start the server
async function startServer() {
  try {
    console.log('[Grace Hospital] Preparing Next.js application...');
    await app.prepare();
    
    console.log('[Grace Hospital] Creating HTTP server...');
    server = createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Handle the request with Next.js
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('[Grace Hospital] Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Grace Hospital] Port ${port} is already in use`);
        console.log('[Grace Hospital] Trying to find an available port...');
        
        // Try a different port
        const alternativePort = port + 1;
        console.log(`[Grace Hospital] Trying port ${alternativePort}...`);
        server.listen(alternativePort, hostname);
      } else {
        console.error('[Grace Hospital] Server error:', err);
        process.exit(1);
      }
    });
    
    // Start listening
    server.listen(port, hostname, () => {
      console.log(`[Grace Hospital] ✅ Server ready on http://${hostname}:${port}`);
      console.log(`[Grace Hospital] 🏥 Grace Hospital website is now running!`);
      console.log(`[Grace Hospital] 🛡️  Graceful shutdown handlers active`);
      console.log(`[Grace Hospital] 📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log important URLs
      if (!dev) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${hostname}:${port}`;
        console.log(`[Grace Hospital] 🌐 Website URL: ${baseUrl}`);
        console.log(`[Grace Hospital] 🔧 Admin Panel: ${baseUrl}/admin`);
        console.log(`[Grace Hospital] 🧹 Utilities: ${baseUrl}/admin/utilities`);
      }
    });
    
  } catch (error) {
    console.error('[Grace Hospital] Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process warnings
process.on('warning', (warning) => {
  console.warn('[Grace Hospital] Process Warning:', warning.name, warning.message);
});

// Log startup information
console.log('[Grace Hospital] =================================');
console.log('[Grace Hospital] Grace Hospital Website Server');
console.log('[Grace Hospital] =================================');
console.log(`[Grace Hospital] Node.js Version: ${process.version}`);
console.log(`[Grace Hospital] Platform: ${process.platform}`);
console.log(`[Grace Hospital] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Grace Hospital] Port: ${port}`);
console.log(`[Grace Hospital] Hostname: ${hostname}`);
console.log('[Grace Hospital] =================================');

// Start the server
startServer().catch((error) => {
  console.error('[Grace Hospital] Failed to start:', error);
  process.exit(1);
});

// Export for potential programmatic use
module.exports = { app, server };
