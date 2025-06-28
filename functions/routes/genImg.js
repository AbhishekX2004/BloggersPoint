/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const generateImage = require("../AI/BlackForestFLUX");
const router = express.Router();

// Generate Image
router.post("/img", async (req, res) => {
  try {
    const {uid, prompt} = req.body;

    // Validate required fields
    if (!uid || !prompt) {
      return res.status(400).json({
        error: "Missing values.",
      });
    }
    console.log(`Generating image for user ${uid} with prompt: "${prompt}"`);
    const imageBuffer = await generateImage(prompt);
    res.set({
      "Content-Type": "image/jpeg",
      "Content-Length": imageBuffer.length,
      "Cache-Control": "no-cache",
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error(`Image generation failed for user ${req.body?.uid}:`, error.message);
    res.status(500).json({
      error: "Image generation failed",
      message: error.message,
    });
  }
});

module.exports = router;
