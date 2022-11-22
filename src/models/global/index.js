let db = require("../../config/db");
const Sequelize = require("sequelize");

db.Logger = require("./Logger")(db.sequelize, Sequelize.DataTypes);

module.exports = db;
