const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./middleware/error");
const cron = require("node-cron");
const cronJob = require("./cron/cronJob");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const connectMongoDB = require("./database/db_config_mongo");
const { parse } = require("csv-parse"); // Make sure you're using destructuring here

const fs = require("fs");
const axios = require("axios");
const https = require("https");


// Routes
// const leads = require('./routes/leads');
const authentication = require("./routes/authentication");
const preWarmup = require("./routes/pre-warmup");
const warmup = require("./routes/warmup");
const dashboard = require("./routes/dashboard");
const production = require("./routes/production");

connectMongoDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true })); //form data
app.use(fileUpload());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
// app.use('/api/v1/leads', leads);
app.use("/api/v1/authentication", authentication);
app.use("/api/v1/dashboard", dashboard);
app.use("/api/v1/pre-warmup", preWarmup);
app.use("/api/v1/warmup", warmup);
app.use("/api/v1/production", production);
// if (process.env.NODE_ENV === "production"){
//     app.use(express.static('../client/build'));

//     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html')))
// }

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});
