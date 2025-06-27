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

// Delete a blog
router.delete("/delete", async (req, res) => {
  const {uid, blogId} = req.body;

  // Validate required fields
  if (!uid || !blogId) {
    return res.status(400).json({
      error: "Missing required fields. uid and blogId are required.",
    });
  }

  // Validate data types
  if (typeof uid !== "string" || typeof blogId !== "string") {
    return res.status(400).json({
      error: "uid and blogId must be strings.",
    });
  }

  try {
    // Check if user exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Get the blog document
    const blogRef = db.collection("blogs").doc(blogId);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return res.status(404).json({error: "Blog not found."});
    }

    const blogData = blogDoc.data();

    // Verify that the blog belongs to the user
    if (blogData.uid !== uid) {
      return res.status(403).json({
        error: "Unauthorized. You can only delete your own blogs.",
      });
    }

    // Delete media files from Firebase Storage if they exist
    if (blogData.mediaURL && Array.isArray(blogData.mediaURL) && blogData.mediaURL.length > 0) {
      const {getStorage} = require("firebase-admin/storage");
      const bucket = getStorage().bucket();

      const deletePromises = blogData.mediaURL.map(async (url) => {
        try {
          // Extract file path from URL
          // Assuming URLs are in format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?{params}
          const urlParts = url.split("/o/")[1];
          if (urlParts) {
            const filePath = decodeURIComponent(urlParts.split("?")[0]);
            const file = bucket.file(filePath);

            // Check if file exists before attempting to delete
            const [exists] = await file.exists();
            if (exists) {
              await file.delete();
              console.log(`Deleted file: ${filePath}`);
            }
          }
        } catch (fileError) {
          console.error(`Error deleting file from URL ${url}:`, fileError);
          // Continue with other deletions even if one file fails
        }
      });

      await Promise.allSettled(deletePromises);
    }

    // Delete titleURL image if it exists
    if (blogData.titleURL) {
      try {
        const {getStorage} = require("firebase-admin/storage");
        const bucket = getStorage().bucket();

        const urlParts = blogData.titleURL.split("/o/")[1];
        if (urlParts) {
          const filePath = decodeURIComponent(urlParts.split("?")[0]);
          const file = bucket.file(filePath);

          const [exists] = await file.exists();
          if (exists) {
            await file.delete();
            console.log(`Deleted title image: ${filePath}`);
          }
        }
      } catch (titleImageError) {
        console.error("Error deleting title image:", titleImageError);
        // Continue with deletion even if title image fails
      }
    }

    // Create batch operation for atomic deletion
    const batch = db.batch();

    // Delete from blogs collection
    batch.delete(blogRef);

    // Delete from user's myBlogs subcollection
    const userBlogRef = userRef.collection("myBlogs").doc(blogId);
    batch.delete(userBlogRef);

    // Delete any comments subcollection if it exists
    // (Assuming blogs might have comments stored as subcollections)
    const commentsRef = blogRef.collection("comments");
    const commentsSnapshot = await commentsRef.get();

    commentsSnapshot.docs.forEach((commentDoc) => {
      batch.delete(commentDoc.ref);
    });

    // Delete any likes subcollection if it exists
    // (Assuming blogs might have likes stored as subcollections)
    const likesRef = blogRef.collection("likes");
    const likesSnapshot = await likesRef.get();

    likesSnapshot.docs.forEach((likeDoc) => {
      batch.delete(likeDoc.ref);
    });

    // Commit the batch operation
    await batch.commit();

    return res.status(200).json({
      message: "Blog deleted successfully.",
      blogId,
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
