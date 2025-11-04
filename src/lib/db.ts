// Add connection cleanup
let isShuttingDown = false;

process.on('SIGTERM', () => {
  isShuttingDown = true;
  // Close database connections
  if (pool) {
    pool.end();
  }
});

export async function query(sql: string, params: any[] = []) {
  if (isShuttingDown) {
    throw new Error('Server is shutting down');
  }
  
  // ... existing query logic ...
}