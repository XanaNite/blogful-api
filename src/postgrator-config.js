require('dotenv').config();

module.exports = {
  "migrationsDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DB_URL
    : process.env.DB_URL,
}

//I was unable to get the TEST_DB_URL to work with 
//migration for some reason. TypeError: Cannot read 
//property 'slice' of undefined. migration works 
//just fine with DB_URL
