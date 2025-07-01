/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();
const {addToArray, removeFromArray}= require("../utils/arrayFunctions");

/**
 * Helper function to update LRU array
 * @param {Array} array - Current array
 * @param {string} item - Item to add/update
 * @param {number} maxLength - Maximum array length (default: 10)
 * @param {number} newItemPosition - Position for new items (default: 2 for 3rd position)
 * @return {Array} Updated array following LRU principle
 */
function updateLRUArray(array, item, maxLength = 10, newItemPosition = 2) {
  const currentArray = [...array];
  const existingIndex = currentArray.indexOf(item);

  if (existingIndex !== -1) {
    // Item exists, move it one position up (towards index 0)
    if (existingIndex > 0) {
      // Remove item from current position
      currentArray.splice(existingIndex, 1);
      // Insert at one position higher
      currentArray.splice(existingIndex - 1, 0, item);
    }
    // If already at index 0, no change needed
  } else {
    // New item, add at specified position (3rd highest = index 2)
    const insertPosition = Math.min(newItemPosition, currentArray.length);
    currentArray.splice(insertPosition, 0, item);
  }

  // Maintain max length
  return currentArray.slice(0, maxLength);
}

/**
 * Helper function to decrement item position in LRU array
 * @param {Array} array - Current array
 * @param {string} item - Item to decrement
 * @return {Array} Updated array
 */
function decrementLRUArray(array, item) {
  const currentArray = [...array];
  const existingIndex = currentArray.indexOf(item);

  if (existingIndex !== -1) {
    // Remove item from current position
    currentArray.splice(existingIndex, 1);

    // Move it one position down (towards end)
    const newPosition = Math.min(existingIndex + 1, currentArray.length);
    currentArray.splice(newPosition, 0, item);

    // Remove lowest rankers if needed (items at the end)
    if (currentArray.length > 10) {
      return currentArray.slice(0, 10);
    }
  }

  return currentArray;
}

// Like a Blog
router.post("/like", async (req, res) => {
  const {uid, blogId} = req.body;

  if (!uid || !blogId) {
    return res.status(400).json({error: "Missing required fields."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const blogRef = db.collection("blogs").doc(blogId);

    // Check if the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Check if the blog exists
    const blogDoc = await blogRef.get();
    if (!blogDoc.exists) {
      return res.status(404).json({error: "Blog not found."});
    }

    const blogData = blogDoc.data();
    const authorUid = blogData.uid;
    const blogTags = blogData.tags || []; // Assuming blog has tags array

    // Reference to user's personalize subcollection
    const personalizeRef = db.collection("users").doc(uid).collection("personalize").doc("likes");

    // Get current likes document
    const likesDoc = await personalizeRef.get();
    let currentLikedUsers = [];
    let currentLikedTags = [];

    if (likesDoc.exists) {
      const likesData = likesDoc.data();
      currentLikedUsers = likesData.liked_users || [];
      currentLikedTags = likesData.liked_tags || [];
    }

    // Update liked_users array with author's UID
    const updatedLikedUsers = updateLRUArray(currentLikedUsers, authorUid);

    // Update liked_tags array with blog tags
    let updatedLikedTags = [...currentLikedTags];
    blogTags.forEach((tag) => {
      updatedLikedTags = updateLRUArray(updatedLikedTags, tag);
    });

    // Update the personalize/likes document
    await personalizeRef.set({
      liked_users: updatedLikedUsers,
      liked_tags: updatedLikedTags,
      last_updated: new Date(),
    }, {merge: true});

    await blogRef.update({
      likes: blogData.likes + 1,
    });

    // Add blogId to likedBlogs array in user doc
    await userRef.set({
      likedBlogs: addToArray(userDoc.data().likedBlogs, blogId),
    }, {merge: true});


    res.status(200).json({
      message: "Blog liked successfully",
      personalization_updated: {
        liked_users: updatedLikedUsers,
        liked_tags: updatedLikedTags,
      },
    });
  } catch (error) {
    console.error("Couldn't like the Blog:", error);
    res.status(500).json({error: "Internal server error while liking the blog."});
  }
});

// Unlike a blog
router.post("/unlike", async (req, res) => {
  const {uid, blogId} = req.body;

  if (!uid || !blogId) {
    return res.status(400).json({error: "Missing required fields."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const blogRef = db.collection("blogs").doc(blogId);

    // Check if the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Check if the blog exists
    const blogDoc = await blogRef.get();
    if (!blogDoc.exists) {
      return res.status(404).json({error: "Blog not found."});
    }

    const blogData = blogDoc.data();
    const authorUid = blogData.uid;
    const blogTags = blogData.tags || [];

    // Reference to user's personalize subcollection
    const personalizeRef = db.collection("users").doc(uid).collection("personalize").doc("likes");

    // Get current likes document
    const likesDoc = await personalizeRef.get();

    if (!likesDoc.exists) {
      return res.status(404).json({error: "No personalization data found."});
    }

    const likesData = likesDoc.data();
    const currentLikedUsers = likesData.liked_users || [];
    const currentLikedTags = likesData.liked_tags || [];

    // Decrement liked_users array for author's UID
    const updatedLikedUsers = decrementLRUArray(currentLikedUsers, authorUid);

    // Decrement liked_tags array for blog tags
    let updatedLikedTags = [...currentLikedTags];
    blogTags.forEach((tag) => {
      updatedLikedTags = decrementLRUArray(updatedLikedTags, tag);
    });

    // Update the personalize/likes document
    await personalizeRef.set({
      liked_users: updatedLikedUsers,
      liked_tags: updatedLikedTags,
      last_updated: new Date(),
    }, {merge: true});

    await blogRef.update({
      likes: blogData.likes - 1,
    });

    // Remove blogId from likedBlogs array in user doc
    await userRef.set({
      likedBlogs: removeFromArray(userDoc.data().likedBlogs, blogId),
    }, {merge: true});


    res.status(200).json({
      message: "Blog unliked successfully",
      personalization_updated: {
        liked_users: updatedLikedUsers,
        liked_tags: updatedLikedTags,
      },
    });
  } catch (error) {
    console.error("Couldn't unlike the blog:", error);
    res.status(500).json({error: "Internal server error while unliking the blog."});
  }
});

// Check like
router.get("/checkLike", async (req, res) => {
  const {uid, blogId} = req.query;

  if (!uid || !blogId) {
    return res.status(400).json({error: "Missing required fields."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    const userData = userDoc.data();
    const likedBlogs = userData.likedBlogs || [];

    const isLiked = likedBlogs.includes(blogId);

    return res.status(200).json({isLiked});
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});


module.exports = router;
