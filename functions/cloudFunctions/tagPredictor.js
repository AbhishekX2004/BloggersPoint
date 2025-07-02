/* eslint-disable max-len */
// functions/index.js (or wherever you define your functions)

const functions = require("firebase-functions");
const {predictTags, getAvailableTags} = require("../models/tagClassification");

/**
 * Predict tags for blog content
 * Call from frontend: firebase.functions().httpsCallable('predictBlogTags')
 */
exports.predictBlogTags = functions.https.onCall((data, context) => {
  try {
    const {title, content, options = {}} = data.data;
    // Validate input
    if (!title || typeof title !== "string") {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Title is required and must be a string",
      );
    }

    if (!content || typeof content !== "string") {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Content is required and must be a string",
      );
    }

    // Validate title and content length
    if (title.length < 5) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Title must be at least 5 characters long",
      );
    }

    if (content.length < 20) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Content must be at least 20 characters long",
      );
    }

    // Set default options
    const predictionOptions = {
      minScore: options.minScore || 1,
      maxTags: options.maxTags || 10,
      titleWeight: options.titleWeight || 2,
      includeScores: options.includeScores !== false, // Default true
    };

    // Get predictions
    const results = predictTags(title, content, predictionOptions);

    // Log for analytics (optional)
    console.log(`Tag prediction for "${title.substring(0, 50)}...": ${results.predictedTags.length} tags found`);

    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Tag prediction error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
        "internal",
        "Failed to predict tags. Please try again.",
    );
  }
});

/**
 * Get all available tags
 * Useful for showing users what tags are possible
 */
exports.getAvailableTags = functions.https.onCall((data, context) => {
  try {
    const tags = getAvailableTags();

    return {
      success: true,
      tags: tags.sort(), // Return alphabetically sorted
      count: tags.length,
    };
  } catch (error) {
    console.error("Get available tags error:", error);
    throw new functions.https.HttpsError("internal", "Failed to get available tags");
  }
});
