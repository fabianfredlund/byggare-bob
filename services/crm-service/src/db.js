import pkg from 'pg'
const { Pool } = pkg

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@postgres:5432/postgres'

export const pool = new Pool({ connectionString: DATABASE_URL })

export async function query(sql, params) {
  const res = await pool.query(sql, params)
  return res.rows
}


