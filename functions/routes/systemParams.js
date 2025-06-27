/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();

router.get("/tags", async (req, res) => {
  try {
    const tagsRef = await db.collection("system").doc("systemParameters").get();
    const tags = tagsRef.data().tags;
    return res.status(200).json({
      status: "success",
      tags,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "failure",
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
