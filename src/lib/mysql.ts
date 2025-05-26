import dotenv from 'dotenv';
dotenv.config(); // ✅ Make sure this line is called earlyimport mysql from 'mysql2/promise';
import mysql from 'mysql2/promise';
// Database connection pool
console.log("DB user:", process.env.DB_USER);
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, values?: any[]) {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Optional: Close the pool when the process exits
process.on('SIGINT', () => {
  pool.end();
  console.log('MySQL connection pool closed.');
  process.exit();
});

process.on('SIGTERM', () => {
  pool.end();
  console.log('MySQL connection pool closed.');
  process.exit();
});
