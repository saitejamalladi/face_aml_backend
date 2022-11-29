module.exports = {
  app_host: process.env.APP_HOST,
  jwt: {
    secret: process.env.JWT_SIGNING_KEY,
  },
  aws: {
    access_key: process.env.AWS_ACCESS_KEY,
    access_secret: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION,
    source_bucket: process.env.AWS_SOURCE_BUCKET,
    target_bucket: process.env.AWS_TARGET_BUCKET,
  },
  sql: {
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
  },
};
