const express = require("express");
const router = express.Router();
let loggerRouter = require("./logger");
let globalRouter = require("./global");
let homeRouter = require("./home");
let contentRouter = require("./content");
let ratingsRouter = require("./ratings");
let priceRouter = require("./price");

router.use("/logger", loggerRouter);
router.use("/global", globalRouter);
router.use("/home", homeRouter);
router.use("/content", contentRouter);
router.use("/ratings", ratingsRouter);

router.use("/price", priceRouter);

module.exports = router;
