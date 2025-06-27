/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();
const admin = require("firebase-admin");

// Follow a user
router.post("/follow", async (req, res) => {
  const {uid, followUid} = req.body;

  if (!uid || !followUid) {
    return res.status(400).json({error: "Missing required fields."});
  }

  if (uid === followUid) {
    return res.status(400).json({error: "Cannot follow yourself."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const followUserRef = db.collection("users").doc(followUid);

    // Check if the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Check if the user to be followed exists
    const followUserDoc = await followUserRef.get();
    if (!followUserDoc.exists) {
      return res.status(404).json({error: "User to follow not found."});
    }

    // Check if already following
    const personalizeRef = userRef.collection("personalize").doc("follows");
    const personalizeDoc = await personalizeRef.get();

    if (personalizeDoc.exists) {
      const followingList = personalizeDoc.data().following || [];
      if (followingList.includes(followUid)) {
        return res.status(400).json({error: "Already following this user."});
      }
    }

    // Add the follow relationship using set with merge to create document if it doesn't exist
    await personalizeRef.set({
      following: admin.firestore.FieldValue.arrayUnion(followUid),
    }, {merge: true});

    // Update the followed user's followers count using merge to avoid overwriting
    await followUserRef.set({
      followers: admin.firestore.FieldValue.increment(1),
    }, {merge: true});

    return res.status(200).json({message: "Successfully followed the user."});
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Unfollow a user
router.post("/unfollow", async (req, res) => {
  const {uid, unfollowUid} = req.body;

  if (!uid || !unfollowUid) {
    return res.status(400).json({error: "Missing required fields."});
  }

  if (uid === unfollowUid) {
    return res.status(400).json({error: "Cannot unfollow yourself."});
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const unfollowUserRef = db.collection("users").doc(unfollowUid);

    // Check if the user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found."});
    }

    // Check if the user to be unfollowed exists
    const unfollowUserDoc = await unfollowUserRef.get();
    if (!unfollowUserDoc.exists) {
      return res.status(404).json({error: "User to unfollow not found."});
    }

    // Check if currently following
    const personalizeRef = userRef.collection("personalize").doc("follows");
    const personalizeDoc = await personalizeRef.get();

    if (!personalizeDoc.exists) {
      return res.status(400).json({error: "Not following any users."});
    }

    const followingList = personalizeDoc.data().following || [];
    if (!followingList.includes(unfollowUid)) {
      return res.status(400).json({error: "Not following this user."});
    }

    // Remove the follow relationship
    await personalizeRef.update({
      following: admin.firestore.FieldValue.arrayRemove(unfollowUid),
    });

    // Decrease the unfollowed user's followers count
    await unfollowUserRef.set({
      followers: admin.firestore.FieldValue.increment(-1),
    }, {merge: true});

    return res.status(200).json({message: "Successfully unfollowed the user."});
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({error: "Internal Server Error", message: error.message});
  }
});

// Get Following List
router.get("/following", async (req, res) => {
  const {uid} = req.query;

  if (!uid) {
    return res.status(400).json({error: "UID is required."});
  }

  try {
    const personalizeRef = db.collection("users").doc(uid).collection("personalize").doc("follows");
    const docSnap = await personalizeRef.get();

    if (!docSnap.exists) {
      return res.status(200).json({
        status: "success",
        following: []});
    }

    const following = docSnap.data().following || [];

    return res.status(200).json({
      status: "success",
      following,
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


module.exports = router;
