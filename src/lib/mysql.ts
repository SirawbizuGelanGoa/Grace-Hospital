import dotenv from 'dotenv';
dotenv.config(); // ✅ Make sure this line is called early
import mysql from 'mysql2/promise';

// Database connection pool optimized for cPanel shared hosting
console.log("DB user:", process.env.DB_USER);
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3, // Very conservative for shared hosting
  queueLimit: 0,
  // Remove unsupported options that cause warnings
});

// Track if we're shutting down
let isShuttingDown = false;

export async function query(sql: string, values?: any[]) {
  if (isShuttingDown) {
    throw new Error('Database is shutting down');
  }

  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  try {
    // Close the database pool
    await pool.end();
    console.log('MySQL connection pool closed successfully.');
  } catch (error) {
    console.error('Error closing MySQL pool:', error);
  }

  console.log('Graceful shutdown completed.');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
