require('dotenv').config()
module.exports = {
  database: process.env.database,
  secret: process.env.secret
}
