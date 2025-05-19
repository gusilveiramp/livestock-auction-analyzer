const express = require("express");
const ocrRoutes = require("./ocr.routes");
const asrRoutes = require("./asr.routes");

const router = express.Router();

router.use("/ocr", ocrRoutes);
router.use("/asr", asrRoutes);

module.exports = router;
