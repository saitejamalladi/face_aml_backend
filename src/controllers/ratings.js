const ratingsService = require("../services/ratings");

class RatingsController {
  async healthCheck(req, res) {
    try {
      res.status(200).send("Ratings Health Check Successful");
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async averageRatings(req, res) {
    try {
      let successResponse = await ratingsService.averageRatings(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async averageReviews(req, res) {
    try {
      let successResponse = await ratingsService.averageReviews(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async trendedRatings(req, res) {
    try {
      let successResponse = await ratingsService.trendedRatings(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async totalRatings(req, res) {
    try {
      let successResponse = await ratingsService.totalRatings(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async totalReviews(req, res) {
    try {
      let successResponse = await ratingsService.totalReviews(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new RatingsController();
