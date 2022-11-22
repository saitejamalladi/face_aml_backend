const loggerService = require("../services/logger");

class LoggerController {
  async get(req, res) {
    try {
      let successResponse = await loggerService.get(req.params["schema"]);
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new LoggerController();
