const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet");

const releaseRoute = require("./src/routes/release.route");

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

app.use("/api/github-fetch", releaseRoute);

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "hello" });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    success: false,
    data: data,
  });
});

app.listen(port, () => {
  console.log(`Sever is listenning on port: ${port}`);
});
