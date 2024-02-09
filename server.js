const dotenv = require("dotenv");
const app = require("./app.js");
// var https = require("https");
// const fs = require('fs');
// var privateKey = fs.readFileSync("./key.pem", "utf8");
// var certificate = fs.readFileSync("./certificate.pem", "utf8");
// var secureHttpCredentials = { key: privateKey, cert: certificate };
const AppError = require("./utils/appError.js");

// configuring dotenv package
dotenv.config({
  path: "./.env",
});

// declaring port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// // server connection establishment
// const server = httpsServer.listen(port, () => {
//   console.log(`Server Connection Established! at PORT: ${port}`);
// });

// uncaught exception handling
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  console.log("Uncaught exception error!");
  server.close(() => {
    process.exit(1);
  });
});

// unhandled rejection error handling
process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.log("Unhandled rejection error!");
  server.close(() => {
    process.exit(1);
  });
});