const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

console.log(process.env);

// const dbDevConfig = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
// };

const dbProdConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: true
}

const pool = new Pool(dbProdConfig);

pool.connect((err, client) => {
    if (err) {
      console.log(err);
    }
    console.log(`connection à la base de données ok...`);
});

const execQuery = async (query, values) => {
  try{
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch(err) {
    console.log(err.stack)
    return 'error';
  }
}

module.exports = {
  execQuery
};