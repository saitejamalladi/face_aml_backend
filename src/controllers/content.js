const contentService = require("../services/content");

class ContentController {
  async healthCheck(req, res) {
    try {
      res.status(200).send("Content Health Check Successful");
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async getStoresTracked(req, res) {
    try {
      let successResponse = await contentService.getStoresTracked(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async contentBrandSummary(req, res) {
    try {
      let successResponse = await contentService.contentBrandSummary(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async cbsGraphData(req, res) {
    try {
      let successResponse = await contentService.cbsGraphData(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async trendedScore(req, res) {
    try {
      let successResponse = await contentService.trendedScore(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async todayScore(req, res) {
    try {
      let successResponse = await contentService.todayScore(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new ContentController();
