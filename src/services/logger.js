const Logger = require("../models/content").Logger;
const response = require("../utils/response");
const { sequelize } = require("../config/db");

class LoggerService {
  async get(schema) {
    try {
      const logger = await sequelize.query(`SELECT * FROM ${schema}.logger`, {
        model: Logger,
        mapToModel: true, // pass true here if you have any mapped fields
      });
      return response.handleSuccessResponseWithData(
        "Logger info",
        logger[0]?.load_date
      );
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
}
module.exports = new LoggerService();
