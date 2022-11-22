const Global = require("../models/global").Global;
const response = require("../utils/response");
const { sequelize } = require("../config/db");
const {
  filterQueryBuilder,
  getDatabaseQueryResultPromise,
} = require("../utils/helper");

class GlobalService {
  async get(schema, requestBody) {
    try {
      //Build the query
      let query = `select * from ${schema}.global_filters where 1=1`;
      query = filterQueryBuilder(query, requestBody);

      return await getDatabaseQueryResultPromise(query);
    } catch (err) {
      console.log(err);
      return response.handleInternalServerError(err);
    }
  }
}
module.exports = new GlobalService();
