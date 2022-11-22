const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");

router.post("/totalStoreTracked", homeController.getStoresTracked);
router.post("/assortmentOverview", homeController.assortmentOverview);
router.post(
  "/assortmentAvailabilityPlatformWise",
  homeController.assortmentAvailabilityPlatformWise
);
router.post(
  "/ratingReviewsTotalStores",
  homeController.ratingReviewsTotalStores
);
router.post("/ratingReviewsGraphData", homeController.ratingReviewsDonutGraph);
router.post("/pricePromoOverview", homeController.priceAndPromoOverview);
router.post("/priceAndPromoPlatform", homeController.priceAndPromoPlatform);
router.post("/shareOfSearch", homeController.shareOfSearch);

module.exports = router;
