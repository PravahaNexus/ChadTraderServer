const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const axios = require("axios");
const crypto = require("crypto");

const payUrl1 = "https://api.phonepe.com/apis/hermes";
const paymentStatusDataSaver =
  "https://chadtraderapi.azurewebsites.net/api//User/SaveUserCourse";

exports.pay = catchAsync(async (req, res, next) => {
  try {
    const merchantTransactionId = "M" + Date.now();
    const { user_id, price, course_id } = req.body;
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: user_id,
      amount: price * 100,
      redirectUrl: `http://localhost:3000/api/v1/pravaha/chadtrader/payment/status/${merchantTransactionId}/${user_id}/${course_id}`,
      redirectMode: "POST",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    fetch(payUrl1 + "/pg/v1/pay", {
      method: "POST",
      withCredentials: false,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({
        request: payloadMain,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response)
        res.status(200).json({
          status: "success",
          data: response.data.instrumentResponse.redirectInfo.url,
        });
      });
  } catch (error) {
    console.error(error);
    return next(new AppError("500", "Internal server error"));
  }
});

exports.status = catchAsync(async (req, res, next) => {
  try {
    const merchantTransactionId = req.params["txnId"];
    const userId = req.params["userId"];
    const courseId = req.params["courseId"];
    const merchantId = process.env.MERCHANT_ID;
    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
      process.env.SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    fetch(payUrl1 + `/pg/v1/status/${merchantId}/${merchantTransactionId}`, {
      method: "GET",
      withCredentials: false,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const currentDate = new Date();
        const currentISODate = currentDate.toISOString();
        const paymentData = {
          paymentStatus: response.data.success ? "SUCCESS" : "FAILURE",
          userId,
          courseId,
          paymentOn: currentISODate,
          merchantTransactionId,
          transactionId: response.data.transactionId,
          paymentAmount: response.data.amount,
          state: response.data.state,
        };

        console.log(paymentData);

        fetch(paymentStatusDataSaver, {
          method: "POST",
          withCredentials: false,
          body: JSON.stringify(paymentData),
        })
          .then((response) => {
            console.log(response)
            if (response == "OK") {
              res.send(200).json({
                status:
                  "Payment success. Please navigate back to website and reload the page...",
                data: paymentData,
              });
            } else {
              res.send(400).json({
                status:
                  "Payment pending/failed. Please contact chadtrader instructor. Dont you worry....",
                data: paymentData,
              });
            }
          })
          .catch((err) => {
            console.log(error)
            res.send(400).json({
              status:
                "Payment pending/failed. Please contact chadtrader instructor. Dont you worry....",
              data: paymentData,
            });
          });
      });
  } catch (error) {
    console.error(error);
    return next(new AppError("500", "Internal server error"));
  }
});
