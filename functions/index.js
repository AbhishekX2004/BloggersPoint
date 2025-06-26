const {initializeApp} = require("firebase-admin/app");
const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

initializeApp();
const app = express();
app.use(cors({origin: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Import routes
const userRoutes = require("./routes/user");
const followRoutes = require("./routes/follow");
const blogRoutes = require("./routes/blogs");

app.use("/user", userRoutes);
app.use("/social", followRoutes);
app.use("/blog", blogRoutes);

exports.api = onRequest(app);
