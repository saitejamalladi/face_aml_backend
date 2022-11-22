const express = require("express");
const router = express.Router();
let faceAMLRouter = require("./faceAML");

router.use("/face-aml", faceAMLRouter);

module.exports = router;
