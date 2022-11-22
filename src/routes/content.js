const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content");

router.get("/health", contentController.healthCheck);
router.post("/totalStoreTracked", contentController.getStoresTracked);
router.post("/contentBrandSummary", contentController.contentBrandSummary);
router.post("/cbsGraphData", contentController.cbsGraphData);
router.post("/trended-score", contentController.trendedScore);
router.post("/today-score", contentController.todayScore);

module.exports = router;
