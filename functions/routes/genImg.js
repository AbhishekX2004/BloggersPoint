/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const generateImage = require("../AI/BlackForestFLUX");
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();

const router = express.Router();

router.post("/img", async (req, res) => {
  try {
    const {uid, prompt} = req.body;

    if (!uid || !prompt) {
      return res.status(400).json({error: "Missing values."});
    }

    const userRef = db.collection("users").doc(uid);

    // Use transaction to prevent race conditions
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const now = new Date();
      const lastGen = userData.lastImgGenAt ? userData.lastImgGenAt.toDate() : null;

      let currentCount = userData.imgGenCount || 0;

      // Reset count if last generation was not today
      if (!lastGen || lastGen.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }

      // Check daily limit
      if (currentCount >= 2) {
        throw new Error("Daily image generation limit reached");
      }

      // Reserve the generation slot by incrementing count
      transaction.update(userRef, {
        imgGenCount: currentCount + 1,
        lastImgGenAt: new Date(),
      });

      return {
        canGenerate: true,
        newCount: currentCount + 1,
      };
    });

    // If we reach here, the transaction succeeded and we have a reserved slot
    console.log(`Generating image for user ${uid} with prompt: "${prompt}"`);

    try {
      const imageBuffer = await generateImage(prompt);

      res.set({
        "Content-Type": "image/jpeg",
        "Content-Length": imageBuffer.length,
        "Cache-Control": "no-cache",
      });

      res.send(imageBuffer);
    } catch (imageError) {
      // If image generation fails, we need to rollback the count
      // This is a compensation transaction
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
          const userData = userDoc.data();
          transaction.update(userRef, {
            imgGenCount: Math.max(0, (userData.imgGenCount || 1) - 1),
          });
        }
      }).catch((rollbackError) => {
        console.error(`Failed to rollback count for user ${uid}:`, rollbackError.message);
      });

      throw imageError; // Re-throw the original error
    }
  } catch (error) {
    console.error(`Image generation failed for user ${req.body?.uid}:`, error.message);

    if (error.message === "User not found") {
      return res.status(404).json({error: "User not found."});
    }

    if (error.message === "Daily image generation limit reached") {
      return res.status(429).json({error: "Daily image generation limit reached."});
    }

    res.status(500).json({
      error: "Image generation failed",
      message: error.message,
    });
  }
});

module.exports = router;
