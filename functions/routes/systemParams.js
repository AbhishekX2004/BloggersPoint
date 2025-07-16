/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();

// Add tags
router.post("/init-system-tags", async (req, res) => {
  const tags = [
    "API",
    "Anime And Manga",
    "Artificial Intelligence",
    "Augmented Reality Virtual Reality",
    "Backend",
    "Blockchain",
    "CSS",
    "Cloud Computing",
    "Continents",
    "Countries",
    "Cryptocurrency",
    "Culture",
    "Cuisine",
    "Database",
    "DevOps",
    "Education and Learning",
    "Environment and Sustainability",
    "Food And Cooking",
    "Framework",
    "Frontend",
    "Fruits",
    "Gaming",
    "Health and Fitness",
    "History",
    "Hobbies and Crafts",
    "JavaScript",
    "Mobile",
    "Movies and Entertainment",
    "Music",
    "Performance",
    "Planets and Stars",
    "Programming Languages",
    "Quantum Computing",
    "React",
    "Security",
    "Seven Wonders",
    "Software Architecture",
    "Space",
    "Testing",
    "Tutorial",
    "Vegetables",
    "Web Development",
    "Wildlife",
    "Travel",
    "Daily Life",
    "News",
    "Technology Trends",
    "Mental Health",
    "Parenting",
    "Relationships",
    "Personal Finance",
    "Self Improvement",
    "Philosophy",
    "Science",
    "Spirituality",
    "Career",
    "Productivity",
    "Inspiration",
    "Motivation",
  ];

  try {
    tags.sort((a, b) => a.localeCompare(b));
    await db.collection("system").doc("systemParameters").set({tags}, {merge: true});
    return res.status(200).json({message: "Tags initialized successfully."});
  } catch (error) {
    console.error("Error initializing tags:", error);
    return res.status(500).json({error: "Internal server error"});
  }
});

// Get tags
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

// Get statuses
router.get("/status", async (req, res) => {
  try {
    const tagsRef = await db.collection("system").doc("systemParameters").get();
    const statuses = tagsRef.data().status;
    return res.status(200).json({
      status: "success",
      statuses,
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
