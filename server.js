// check if running in the production environment
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// import modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

// declare accesses to module properties and methods
const app = express();

// app setting
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

// connect to mongoDB
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to mongoose."));

// declare routers
const indexRouter = require("./routes/index");

// user routers
app.use("/", indexRouter);

// listen for request to a certain port
app.listen(process.env.PORT || 3000);
