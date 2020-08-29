const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

let pool = null;

if(process.env.NODE_ENV === 'PRODUCTION'){
  console.log('Je suis en PROD');
  const dbProdConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
  pool = new Pool(dbProdConfig);
}else{
  console.log('Je suis en DEV');
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

module.exports = {
  execQuery
};