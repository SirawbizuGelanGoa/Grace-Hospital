# Production Deployment Guide

This guide explains how to deploy your dynamic hospital website to production, specifically addressing the issues with admin panel changes not reflecting in production builds.

## Issues Fixed

### 1. Dynamic Content Not Updating in Production
**Problem**: Admin panel changes were not reflecting in the production build because:
- Missing environment variables for API URLs
- API calls falling back to mock data in production
- No cache revalidation after data updates

**Solution**: 
- Added proper environment variables
- Updated API fetching logic to work in production
- Implemented Incremental Static Regeneration (ISR) with cache revalidation

### 2. Indefinite Processes Consuming Resources
**Problem**: The application was creating processes that ran indefinitely, consuming hosting resources.

**Solution**:
- Enhanced database connection pooling with proper limits
- Added graceful shutdown handlers
- Implemented timer and interval cleanup
- Added process management for production environments

## Environment Variables Setup

### For Development
Copy `.env.example` to `.env` and update with your values:

```bash
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### For Production (cPanel/Shared Hosting)
Create a `.env.production` file or set environment variables in your hosting panel:

```bash
# Database Configuration (update with your production database details)
DB_HOST=your_production_db_host
DB_PORT=3306
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
PORT=3000

# API Configuration (update with your actual domain)
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
GENKIT_DISABLED=true
```

## Deployment Steps

### 1. Build for Production
```bash
# Install dependencies
npm install

# Build the application
npm run build:production
```

### 2. Deploy to cPanel/Shared Hosting
```bash
# Start the application (use this command in your hosting panel)
npm run start:cpanel
```

### 3. Alternative Production Start
```bash
# For other hosting providers
npm run start:production
```

## Key Features Implemented

### 1. Incremental Static Regeneration (ISR)
- Pages are statically generated at build time
- Content is revalidated every 60 seconds
- Cache is invalidated when admin makes changes
- Provides fast loading with dynamic updates

### 2. Cache Revalidation
- All API routes now include cache revalidation tags
- When data is updated via admin panel, cache is automatically cleared
- Ensures fresh content is served to users

### 3. Process Management
- Database connections are properly pooled and limited
- Graceful shutdown handlers prevent resource leaks
- Timers and intervals are tracked and cleaned up
- Suitable for shared hosting environments

### 4. Error Handling
- Proper fallback mechanisms
- Detailed error logging
- Graceful degradation when services are unavailable

## Troubleshooting

### Admin Changes Not Reflecting
1. Check environment variables are set correctly
2. Verify database connection is working
3. Check browser cache (hard refresh with Ctrl+F5)
4. Wait up to 60 seconds for ISR to update

### High Resource Usage
1. Ensure you're using the `start:cpanel` script
2. Check that `GENKIT_DISABLED=true` is set
3. Monitor database connection limits
4. Restart the application if needed

### Database Connection Issues
1. Verify database credentials in environment variables
2. Check database server is accessible from your hosting
3. Ensure database user has proper permissions
4. Check connection limits haven't been exceeded

## Monitoring

### Health Checks
- Monitor application logs for errors
- Check database connection status
- Monitor memory and CPU usage
- Set up alerts for application downtime

### Performance
- Use browser dev tools to check API response times
- Monitor database query performance
- Check cache hit rates
- Monitor resource usage on hosting panel

## Support

If you encounter issues:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Check hosting provider resource limits
5. Contact your hosting provider if needed

## Files Modified

- `.env` - Added environment variables
- `src/lib/api.ts` - Updated API fetching logic
- `src/lib/mysql.ts` - Enhanced database connection management
- `next.config.ts` - Added production optimizations
- `package.json` - Updated scripts for production
- All API routes - Added ISR and cache revalidation

The application is now production-ready with proper resource management and dynamic content updates.
