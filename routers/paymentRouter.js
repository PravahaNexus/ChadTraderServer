const express = require("express");
const paymentController = require("../controllers/paymentController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/status/:txnId/:userId/:courseId", paymentController.status);

router.use(authController.protect);
router.post("/pay", paymentController.pay);

module.exports = router;