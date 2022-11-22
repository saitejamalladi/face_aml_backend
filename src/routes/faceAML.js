const express = require("express");
const router = express.Router();
const faceAMLController = require("../controllers/faceAML");

router.post("/", faceAMLController.getFaceAMLScore);

module.exports = router;
