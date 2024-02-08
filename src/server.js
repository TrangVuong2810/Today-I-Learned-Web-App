const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const route = require("./routes");
const db = require(path.join(__dirname, "config", "db", "index"));

const PORT = process.env.PORT || 4000;

app.listen(4000, function () {
  console.log("Example app listening on port 4000!");
});

route(app);
