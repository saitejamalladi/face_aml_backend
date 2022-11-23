let db = require("../../config/db");
const Sequelize = require("sequelize");

db.FaceMapping = require("./FaceMapping")(db.sequelize, Sequelize.DataTypes);

module.exports = db;
