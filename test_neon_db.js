import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';

// Configure Neon to use WebSockets
global.WebSocket = ws;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_liIrnAOpd3j6@ep-white-sound-a4a4awr6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function testConnection() {
  try {
    // Test simple query
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current timestamp from database:', result.rows[0].now);
    
    console.log('\nYour Neon database is working correctly and ready for Vercel deployment!');
    
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    // Close pool
    await pool.end();
  }
}

testConnection();