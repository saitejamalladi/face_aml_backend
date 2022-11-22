const config = require("./");
const Sequelize = require("sequelize");

module.exports = {
  sequelize: new Sequelize(
    config.sql.database,
    config.sql.username,
    config.sql.password,
    {
      host: config.sql.host,
      port: config.sql.port,
      dialect: "postgres",
      logging: console.log,
    }
  ),
};
