let db = require("../../config/db");
const Sequelize = require("sequelize");

db.TrendedScore = require("./TrendedScore")(db.sequelize, Sequelize.DataTypes);
db.TodayScore = require("./TodayScore")(db.sequelize, Sequelize.DataTypes);

module.exports = db;
