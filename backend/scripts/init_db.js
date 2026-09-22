import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'amrt_accommodation';

  console.log(`\n===============================================================`);
  console.log(`🔄 Initializing AMRT Accommodation Database`);
  console.log(`Target: ${user}@${host}:${port}/${database}`);
  console.log(`===============================================================\n`);

  let connection;
  try {
    // 1. Connect to MySQL server without database
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Ensure database exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database \`${database}\` verified / created.`);

    // Switch to database
    await connection.query(`USE \`${database}\`;`);

    // 3. Read and execute Schema
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    console.log('⏳ Running schema.sql...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Handle DELIMITER blocks for MySQL driver compatibility
    // In mysql2, DELIMITER $$ is not a valid SQL token (it is a mysql cli directive)
    // We execute standard SQL and then create the procedure directly.
    const procSql = `
DROP PROCEDURE IF EXISTS \`GetStudentPaymentHistory\`;
CREATE PROCEDURE \`GetStudentPaymentHistory\`(IN p_student_id INT)
BEGIN
    SELECT 
        \`payment_id\`,
        \`student_id\`,
        \`amount\`,
        \`payment_date\`,
        \`due_date\`,
        \`payment_method\`,
        \`payment_status\`,
        \`transaction_id\`,
        \`created_at\`
    FROM \`payments\`
    WHERE \`student_id\` = p_student_id
    ORDER BY \`due_date\` DESC;

    SELECT 
        COUNT(*) AS \`total_invoices\`,
        COALESCE(SUM(CASE WHEN \`payment_status\` = 'Paid' THEN \`amount\` ELSE 0 END), 0) AS \`total_paid\`,
        COALESCE(SUM(CASE WHEN \`payment_status\` IN ('Pending', 'Overdue') THEN \`amount\` ELSE 0 END), 0) AS \`total_pending\`,
        COUNT(CASE WHEN \`payment_status\` = 'Overdue' THEN 1 END) AS \`overdue_count\`
    FROM \`payments\`
    WHERE \`student_id\` = p_student_id;
END;
    `;

    // Strip delimiter lines from schemaSql before executing bulk statements
    const cleanedSchema = schemaSql
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .replace(/END\$\$/g, 'END;');

    // First execute tables, constraints, and view
    await connection.query(cleanedSchema);
    console.log('✅ Schema tables, constraints, and active_allocations_view created successfully.');

    // Ensure procedure is accurately compiled
    try {
      await connection.query(procSql);
      console.log('✅ Stored Procedure `GetStudentPaymentHistory` created successfully.');
    } catch (procErr) {
      console.warn('Procedure notice:', procErr.message);
    }

    // 4. Read and execute Seed data
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at: ${seedPath}`);
    }

    console.log('⏳ Running seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    // 5. Query verification counts
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [studentCount] = await connection.query('SELECT COUNT(*) as count FROM students');
    const [roomCount] = await connection.query('SELECT COUNT(*) as count FROM rooms');
    const [allocCount] = await connection.query('SELECT COUNT(*) as count FROM allocations WHERE status = "Active"');

    console.log('\n---------------- Verification Summary ----------------');
    console.log(`👤 Users:             ${userCount[0].count}`);
    console.log(`🎓 Students:          ${studentCount[0].count}`);
    console.log(`🛏️ Rooms:             ${roomCount[0].count}`);
    console.log(`📋 Active Allocations: ${allocCount[0].count}`);
    console.log('------------------------------------------------------');
    console.log('🎉 Database initialization complete and verified!\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    console.error('\nTroubleshooting Checklist:');
    console.error('1. Is MySQL Server running on your computer?');
    console.error('2. Is the password in backend/.env correct for DB_USER=root?');
    console.error(`3. Is DB_PORT correct? (Detected port is ${port})`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
