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
const paramsRoutes = require("./routes/systemParams");
const writerExploreRoute = require("./routes/writerExplore");
const imageGenRoute = require("./routes/genImg");
const commentsRoutes = require("./routes/comments");

app.use("/user", userRoutes);
app.use("/social", followRoutes);
app.use("/blog", blogRoutes);
app.use("/params", paramsRoutes);
app.use("/writer", writerExploreRoute);
app.use("/gen", imageGenRoute);
app.use("/comments", commentsRoutes);

exports.api = onRequest(app);
