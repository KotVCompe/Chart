const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tabl',
  password: 'root111',
  port: 1357,
});

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chart_data (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        value NUMERIC NOT NULL,
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Добавление тестовых данных
    await pool.query(`
      INSERT INTO chart_data (category, value, color) VALUES
      ('Январь', 100, '#FF6384'),
      ('Февраль', 200, '#36A2EB'),
      ('Март', 150, '#FFCE56'),
      ('Апрель', 300, '#4BC0C0'),
      ('Май', 250, '#9966FF')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { pool, initDatabase };