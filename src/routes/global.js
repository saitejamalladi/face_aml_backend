const express = require("express");
const router = express.Router();
const globalController = require("../controllers/global");

router.post("/", globalController.get);
module.exports = router;
