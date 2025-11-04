#!/usr/bin/env node

/**
 * Production Test Script
 * This script tests the production build to ensure:
 * 1. API endpoints are working
 * 2. Dynamic content is being served
 * 3. Cache revalidation is working
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test endpoints
const endpoints = [
  '/api/hero-slides',
  '/api/services',
  '/api/departments',
  '/api/facilities',
  '/api/gallery-items',
  '/api/news-events',
  '/api/about-content'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Production API Endpoints...\n');
  
  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    try {
      console.log(`Testing: ${endpoint}`);
      const result = await makeRequest(url);
      
      if (result.status === 200) {
        const cacheControl = result.headers['cache-control'];
        const dataLength = Array.isArray(result.data) ? result.data.length : 1;
        
        console.log(`  ✅ Status: ${result.status}`);
        console.log(`  📊 Data items: ${dataLength}`);
        console.log(`  🗄️  Cache-Control: ${cacheControl || 'Not set'}`);
        
        if (cacheControl && cacheControl.includes('s-maxage')) {
          console.log(`  ✅ ISR enabled`);
        } else {
          console.log(`  ⚠️  ISR not detected`);
        }
      } else {
        console.log(`  ❌ Status: ${result.status}`);
        console.log(`  📝 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function testHomePage() {
  console.log('🏠 Testing Home Page...\n');
  
  try {
    const result = await makeRequest(`${BASE_URL}/`);
    if (result.status === 200) {
      console.log(`  ✅ Home page loaded successfully`);
      console.log(`  📄 Content length: ${result.data.length} characters`);
    } else {
      console.log(`  ❌ Home page failed: ${result.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Error loading home page: ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting Production Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  await testHomePage();
  await testEndpoints();
  
  console.log('✨ Tests completed!');
  console.log('\n📋 Summary:');
  console.log('- If all endpoints show ✅ status 200, your API is working');
  console.log('- If ISR is enabled, cache will update automatically');
  console.log('- Admin panel changes should now reflect in production');
  console.log('\n🔧 Next steps:');
  console.log('1. Test admin panel functionality');
  console.log('2. Make changes via admin panel');
  console.log('3. Wait 60 seconds and refresh to see changes');
  console.log('4. Deploy to your production server');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoints, testHomePage };
