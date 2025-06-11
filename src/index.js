const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const userRouter = require("./routers/user");
const garmentRouter = require("./routers/garment");
const orderRouter = require("./routers/order");
const wishlistRouter = require("./routers/wishlist");

const app = express();

app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(garmentRouter);
app.use(orderRouter);
app.use(wishlistRouter);

module.exports = app;
