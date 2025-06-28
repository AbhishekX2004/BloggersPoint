/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();
const isInsult = require("../AI/KolasAI");

// Create a new comment
router.post("/create", async (req, res) => {
  const {uid, blogId, content} = req.body;

  // Validate required fields
  if (!uid || !blogId || !content) {
    return res.status(400).json({
      error: "Missing required fields. uid, blogId, and content are required.",
    });
  }

  // Validate data types
  if (typeof uid !== "string" || typeof blogId !== "string" || typeof content !== "string") {
    return res.status(400).json({
      error: "uid, blogId, and content must be strings.",
    });
  }

  // Validate content is not empty after trimming
  if (content.trim().length === 0) {
    return res.status(400).json({
      error: "Comment content cannot be empty.",
    });
  }

  try {
    // Check for profanity in content
    const contentContainsProfanity = await isInsult(content);
    if (contentContainsProfanity) {
      return res.status(400).json({
        error: "Comment contains inappropriate content. Please revise and try again.",
        field: "content",
      });
    }
    console.log("Comment content passed profanity filter check");

    // Check if user exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Check if blog exists
    const blogRef = db.collection("blogs").doc(blogId);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return res.status(404).json({error: "Blog not found."});
    }

    const commentsRef = blogRef.collection("comments");
    const commentRef = commentsRef.doc();
    const commentId = commentRef.id;

    const commentData = {
      uid,
      blogId,
      content: content.trim(),
      createdAt: new Date(),
    };

    // Create comment document
    await commentRef.set(commentData);

    // Update the blog's comment count
    await blogRef.update({
      comments: db.FieldValue.increment(1),
    });

    return res.status(201).json({
      status: "success",
      commentId,
      blogId,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
