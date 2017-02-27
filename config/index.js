

exports = module.exports = {
  port: process.env.PORT || '3000',
  address: process.env.ADDRESS || '::',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '6379',
  }
}