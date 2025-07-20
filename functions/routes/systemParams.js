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
    "Banking",
    "Blockchain",
    "Career",
    "Cloud Computing",
    "Continents",
    "Countries",
    "CSS",
    "Cryptocurrency",
    "Cuisine",
    "Culture",
    "Daily Life",
    "Database",
    "DevOps",
    "Economy",
    "Education and Learning",
    "Environment and Sustainability",
    "Finance",
    "Financial Markets",
    "Food And Cooking",
    "Framework",
    "Frontend",
    "Fruits",
    "Gaming",
    "Health and Fitness",
    "History",
    "Hobbies and Crafts",
    "Inspiration",
    "Investing",
    "JavaScript",
    "Mental Health",
    "Mobile",
    "Motivation",
    "Movies and Entertainment",
    "Music",
    "News",
    "Parenting",
    "Performance",
    "Personal Finance",
    "Philosophy",
    "Planets and Stars",
    "Productivity",
    "Programming Languages",
    "Quantum Computing",
    "React",
    "Relationships",
    "Science",
    "Security",
    "Self Improvement",
    "Seven Wonders",
    "Software Architecture",
    "Space",
    "Spirituality",
    "Technology Trends",
    "Testing",
    "Travel",
    "Tutorial",
    "Vegetables",
    "Web Development",
    "Wildlife",
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
