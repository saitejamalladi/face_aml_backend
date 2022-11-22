const homeService = require("../services/home");

class HomeController {
  async getStoresTracked(req, res) {
    try {
      let successResponse = await homeService.getStoresTracked(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async assortmentOverview(req, res) {
    try {
      let successResponse = await homeService.assortmentOverview(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }

  async assortmentAvailabilityPlatformWise(req, res) {
    try {
      let successResponse = await homeService.assortmentAvailabilityPlatformWise(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async ratingReviewsTotalStores(req, res) {
    try {
      let successResponse = await homeService.ratingReviewsTotalStores(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }

  async ratingReviewsDonutGraph(req, res) {
    try {
      let successResponse = await homeService.ratingReviewsDonutGraph(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }

  async priceAndPromoOverview(req, res) {
    try {
      let successResponse = await homeService.priceAndPromoOverview(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async priceAndPromoPlatform(req, res) {
    try {
      let successResponse = await homeService.priceAndPromoPlatform(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }

  async shareOfSearch(req, res) {
    try {
      let successResponse = await homeService.shareOfSearch(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new HomeController();
