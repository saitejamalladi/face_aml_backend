const express = require("express");
const router = express.Router();
const priceController = require("../controllers/price");

router.get("/health", priceController.healthCheck);
router.post("/average-discount", priceController.averageDiscount);
router.post("/products-promo", priceController.productsOnPromo);
router.post("/assortment-discount", priceController.assortmentDiscount);
router.post("/trended", priceController.trendedPromoPrice);
router.post("/trended-per-product", priceController.trendedPromoPricePerSpecificProduct);
router.post("/detailed", priceController.detailedPrice);

module.exports = router;
