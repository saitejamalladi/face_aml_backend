const globalService = require("../services/global");

class GlobalController {
  async get(req, res) {
    try {
      let successResponse = await globalService.get(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new GlobalController();
