const express = require("express");
const router = express.Router();
const loggerController = require("../controllers/logger");

router.get("/:schema", loggerController.get);
module.exports = router;
