const priceService = require("../services/price");

class PriceController {
  async healthCheck(req, res) {
    try {
      res.status(200).send("Price Health Check Successful.");
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async averageDiscount(req, res) {
    try {
      let successResponse = await priceService.averageDiscount(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async productsOnPromo(req, res) {
    try {
      let successResponse = await priceService.productsOnPromo(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async assortmentDiscount(req, res) {
    try {
      let successResponse = await priceService.assortmentDiscount(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async trendedPromoPrice(req, res) {
    try {
      let successResponse = await priceService.trendedPromoPrice(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async trendedPromoPricePerSpecificProduct(req, res) {
    try {
      let successResponse = await priceService.trendedPromoPricePerSpecificProduct(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async detailedPrice(req, res) {
    try {
      let successResponse = await priceService.detailedPrice(
        req.body["schema"],
        req.body
      );
      res.status(200).send(successResponse);
    } catch (err) {
      res.status(500).send(err);
    }
  }
}

module.exports = new PriceController();
