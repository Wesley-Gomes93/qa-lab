require("dotenv").config();
const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL || "postgresql://qa:qa123@localhost:5432/qalab";

const pool = new Pool({ connectionString });

const ADMIN_EMAIL = "admWesley@test.com.br";
const ADMIN_PASSWORD = "senha12356";

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) DEFAULT '',
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        idade INTEGER,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password;
    `, ["ADM", ADMIN_EMAIL, ADMIN_PASSWORD]);

    const alterQueries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS idade INTEGER`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    ];
    for (const q of alterQueries) {
      try {
        await client.query(q);
      } catch (e) {
        if (e.code !== "42701") throw e;
      }
    }
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb, ADMIN_EMAIL };
