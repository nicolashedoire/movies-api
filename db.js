const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

let pool = null;

if(process.env.PORT){
  console.log('PRODUCTION MODE');
  const dbProdConfig = {
    connectionString: process.env.DATABASE_URL
  }
  pool = new Pool(dbProdConfig);
}else{
  console.log('DEVELOPEMENT MODE');
  const dbDevConfig = {
    host: process.env.DB_DEV_HOST,
    port: process.env.DB_DEV_PORT,
    database: process.env.DB_DEV_DATABASE,
    user: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
  };
  pool = new Pool(dbDevConfig);
}

pool.connect((err, client) => {
    if (err) {
      console.log(err);
    }
    console.log(`connection à la base de données ok...`);
});

const execQuery = async (query) => {
  return pool.query(query);
}

const execQueryWithParams = async (query, params) => {
  try{
    const res = await pool.query(query, [...params]);
    return res.rows;
  } catch(err) {
    console.log(err.stack)
    return 'error';
  }
}

module.exports = {
  execQuery,
  execQueryWithParams
};
