/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();

// Create a new blog
router.post("/create", async (req, res) => {
  const {uid, titleURL, title, tags, content, mediaURL} = req.body;

  // Validate required fields
  if (!uid || !tags || !title || !content) {
    return res.status(400).json({
      error: "Missing required fields. uid, tags, title, and content are required.",
    });
  }

  // Validate data types and constraints
  if (typeof uid !== "string" || !Array.isArray(tags) ||
      typeof title !== "string" || typeof content !== "string") {
    return res.status(400).json({
      error: "uid, tags, title, and content must be strings.",
    });
  }

  // Validate tags array
  if (tags && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string"))) {
    return res.status(400).json({
      error: "tags must be an array of strings.",
    });
  }

  // Validate URLs
  if (mediaURL) {
    if (!Array.isArray(mediaURL)) {
      return res.status(400).json({
        error: "mediaURL must be an array.",
      });
    }
    if (mediaURL.length > 3) {
      return res.status(400).json({
        error: "mediaURL array cannot have more than 3 items.",
      });
    }
    if (mediaURL.some((url) => typeof url !== "string")) {
      return res.status(400).json({
        error: "All mediaURL items must be strings.",
      });
    }
  }

  if (titleURL && typeof titleURL !== "string") {
    return res.status(400).json({
      error: "titleURL must be a string.",
    });
  }

  try {
    // Check if user exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Create the blog document
    const blogRef = db.collection("blogs").doc();
    const blogId = blogRef.id;

    const blogData = {
      uid,
      titleURL,
      title,
      tags: tags || [],
      content,
      mediaURL: mediaURL || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      comments: 0,
    };

    // Create blog document
    await blogRef.set(blogData);

    // Add blog reference to user's myBlogs subcollection
    const userBlogRef = userRef.collection("myBlogs").doc(blogId);
    await userBlogRef.set({
      blogId,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Blog created successfully.",
      blogId,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
