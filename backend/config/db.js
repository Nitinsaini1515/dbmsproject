import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amrt_accommodation',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true
};

export const pool = mysql.createPool(dbConfig);

// Helper to test pool connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected successfully to ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:');
    console.error(`Host: ${dbConfig.host}, Port: ${dbConfig.port}, User: ${dbConfig.user}, Database: ${dbConfig.database}`);
    console.error(`Error code: ${error.code}, Message: ${error.message}`);
    console.error('Please verify your DB_PASSWORD and DB_PORT in backend/.env');
    return false;
  }
};

export default pool;
