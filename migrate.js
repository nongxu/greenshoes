require('dotenv').config();
const { execSync } = require('child_process');

const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

// drop the inline PGPASSWORD='…' prefix
const cmd = `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f db/schema.sql`;

try {
  console.log('🚀 Running DB migration...');
  execSync(cmd, {
    stdio: 'inherit',
    env: { 
      ...process.env,
      // inject the password into psql’s env
      PGPASSWORD: DB_PASSWORD 
    }
  });
  console.log('✅ Migration completed.');
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
}