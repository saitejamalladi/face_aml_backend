const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratings");

router.get("/health", ratingsController.healthCheck);
router.post("/average-ratings", ratingsController.averageRatings);
router.post("/average-reviews", ratingsController.averageReviews);
router.post("/trended-ratings", ratingsController.trendedRatings);
router.post("/total-ratings", ratingsController.totalRatings);
router.post("/total-reviews", ratingsController.totalReviews);

module.exports = router;
