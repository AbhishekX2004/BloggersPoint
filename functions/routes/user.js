/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const {statusVerify} = require("../middlewares/statusVerify");
const db = getFirestore();
const admin = require("firebase-admin");

// Get user menu data
router.get("/name-photo", async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).json({error: "Missing User ID."});
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }
    const userData = userDoc.data();
    return res.status(200).json({
      displayName: userData.displayName || "Anonymous",
      photoURL: userData.photoURL || "https://tinyurl.com/ybe5svee",
    });
  } catch (error) {
    console.error("Error fetching user menu data:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Get user profile
router.get("/", async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).json({error: "Missing User ID."});
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }
    const userData = userDoc.data();
    const blogRef = db.collection("users").doc(uid).collection("blogs");
    const blogsSnapshot = await blogRef.get();
    const blogsWritten = blogsSnapshot.size;
    const followingDoc = await db.collection("users").doc(uid).collection("personalize").doc("follows").get();
    const following = followingDoc.exists ? (followingDoc.data().following?.length || 0) : 0;

    return res.status(200).json({
      ...userData,
      blogsWritten,
      following,
      followers: userData.followers || 0,
      uid,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Update user status
router.post("/status", statusVerify, async (req, res) => {
  const {uid, status} = req.body;

  if (!uid || !status) {
    return res.status(400).json({error: "Missing required fields: uid and status."});
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Check if user exists before updating
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    await userRef.update({status});
    return res.status(200).json({message: "Status updated successfully."});
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Getting Started
router.post("/gs", async (req, res) => {
  const {uid, displayName, interests} = req.body;
  if (!uid || !displayName || !interests) {
    return res.status(400).json({error: "Missing required fields."});
  }

  // Add validation for interests array
  if (!Array.isArray(interests) || interests.length === 0) {
    return res.status(400).json({error: "Interests must be a non-empty array."});
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Update user document with displayName
    await userRef.set({displayName}, {merge: true});

    // Set interests in personalize subcollection
    await userRef.collection("personalize").doc("topics").set({
      interests: interests,
    }, {merge: true});

    return res.status(200).json({message: "Getting Started information saved successfully."});
  } catch (error) {
    console.error("Error saving Getting Started information:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  const {uid, displayName, bio} = req.body;

  // Validate required fields
  if (!uid) {
    return res.status(400).json({error: "Missing required field: uid."});
  }

  if (!displayName && !bio) {
    return res.status(400).json({error: "At least one field (displayName or bio) must be provided."});
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Check if user exists before updating
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Prepare update object with only provided fields
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;

    await userRef.update(updateData);
    return res.status(200).json({message: "Profile updated successfully."});
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Update profile image
router.put("/profile-image", async (req, res) => {
  const {uid, url} = req.body;

  // Validate required fields
  if (!uid || !url) {
    return res.status(400).json({error: "Missing required fields: uid and url."});
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({error: "Invalid URL format."});
  }

  try {
    const userRef = db.collection("users").doc(uid);

    // Check if user exists before updating
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Get the current photoURL before updating
    const currentPhotoURL = userDoc.data().photoURL;

    // Update the user's photoURL in the database
    await userRef.update({photoURL: url});

    // Try to delete the previous image from Firebase Storage (if it exists)
    if (currentPhotoURL && currentPhotoURL !== url) {
      try {
        // Extract the file path from the Firebase Storage URL
        const filePathFromURL = extractFilePathFromStorageURL(currentPhotoURL);

        if (filePathFromURL) {
          // Delete the file from Firebase Storage
          const fileRef = admin.storage().bucket().file(filePathFromURL);

          // Check if file exists before attempting deletion
          const [exists] = await fileRef.exists();
          if (exists) {
            await fileRef.delete();
            console.log("Previous profile image deleted successfully:", filePathFromURL);
          } else {
            console.log("Previous profile image file not found in storage, skipping deletion:", filePathFromURL);
          }
        } else {
          console.log("Could not extract file path from URL or URL is not from Firebase Storage:", currentPhotoURL);
        }
      } catch (deleteError) {
        // Handle specific error cases that should be ignored
        if (deleteError.code === 404 ||
            deleteError.code === "storage/object-not-found" ||
            deleteError.message?.includes("No such object") ||
            deleteError.message?.includes("404") ||
            deleteError.message?.includes("not found")) {
          console.log("Previous profile image not found in storage (already deleted or never existed), continuing:", currentPhotoURL);
        } else {
          // Log other errors but don't stop the process
          console.error("Failed to delete previous profile image:", deleteError);
          console.error("Error code:", deleteError.code);
          console.error("Current photo URL:", currentPhotoURL);
        }
        // Continue execution - the update was successful regardless
      }
    }

    return res.status(200).json({message: "Profile image updated successfully."});
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Helper function to extract file path from Firebase Storage URL
function extractFilePathFromStorageURL(url) {
  try {
    // Parse the URL to extract the file path
    const urlObj = new URL(url);

    // Check if it's a Firebase Storage URL
    if (!urlObj.hostname.includes("firebasestorage.googleapis.com")) {
      console.log("URL is not from Firebase Storage:", url);
      return null;
    }

    // Extract the path from the URL
    // Format: /v0/b/{bucket}/o/{encodedFilePath}
    const pathParts = urlObj.pathname.split("/");
    if (pathParts.length < 4) {
      console.log("Invalid Firebase Storage URL format:", url);
      return null;
    }

    const encodedFilePath = pathParts[pathParts.length - 1];

    // Remove query parameters (everything after ?)
    const cleanEncodedPath = encodedFilePath.split("?")[0];

    // Decode the file path
    const decodedFilePath = decodeURIComponent(cleanEncodedPath);

    return decodedFilePath;
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    return null;
  }
}

// Update last login
router.put("/lastLogin", async (req, res) => {
  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).json({error: "Missing User ID."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    const userData = userDoc.data();
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString(); // Get date without time

    // Check if lastLogin exists and if it's a different day
    let shouldUpdate = true;
    if (userData.lastLogin) {
      const lastLoginDate = userData.lastLogin.toDate ? userData.lastLogin.toDate() : new Date(userData.lastLogin);
      const lastLoginDateString = lastLoginDate.toDateString();

      // Only update if it's a different day
      shouldUpdate = currentDateString !== lastLoginDateString;
    }

    if (shouldUpdate) {
      await userRef.update({lastLogin: currentDate});
      return res.status(200).json({message: "Last login updated successfully."});
    } else {
      return res.status(200).json({message: "Last login already updated for today."});
    }
  } catch (error) {
    console.error("Error updating last login:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// User Interests
router.get("/interests", async (req, res) => {
  try {
    const {uid} = req.query;
    if (!uid) return res.status(400).json({status: "error", message: "UID is required"});

    const docRef = db.collection("users").doc(uid).collection("personalize").doc("topics");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({status: "error", message: "Interests not found"});
    }

    const interests = docSnap.data().interests || [];
    return res.status(200).json({status: "success", interests});
  } catch (err) {
    return res.status(500).json({status: "error", message: err.message});
  }
});

// Update user interests
router.post("/interests", async (req, res) => {
  try {
    const {uid, interests} = req.body;
    if (!uid || !Array.isArray(interests)) {
      return res.status(400).json({status: "error", message: "UID and interests array are required"});
    }

    const docRef = db.collection("users").doc(uid).collection("personalize").doc("topics");
    await docRef.update({interests});

    return res.status(200).json({status: "success", message: "Interests updated successfully"});
  } catch (err) {
    return res.status(500).json({status: "error", message: err.message});
  }
});

module.exports = router;
