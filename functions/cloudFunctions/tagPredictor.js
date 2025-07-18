/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */

const functions = require("firebase-functions");
const axios = require("axios");
const {predictTags, getAvailableTags} = require("../models/tagClassification");
const TagPredictor = process.env.TAG_PREDICTOR_URL;

/**
 * Call the custom TagPredictor model
 */
async function callTagPredictorModel(title, content) {
  try {
    const response = await axios.post(`${TagPredictor}/predict`, {
      title: title,
      content: content,
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.topics || [];
  } catch (error) {
    console.error("TagPredictor model error:", error.message);
    // Return empty array if model fails - don't let it break the whole function
    return [];
  }
}

/**
 * Combine tags from multiple sources with weightage
 */
function combineTags(localTags, modelTags, options) {
  const tagScores = new Map();

  // Add local tags with their original scores
  localTags.forEach((tag) => {
    const tagName = typeof tag === "string" ? tag : tag.tag;
    const score = typeof tag === "string" ? 1 : tag.score;
    tagScores.set(tagName, score);
  });

  // Add model tags with higher weightage (since it's the selling point)
  const modelWeightage = options.modelWeightage || 2.5;
  modelTags.forEach((tag) => {
    const tagName = tag.toString();
    const existingScore = tagScores.get(tagName) || 0;
    // If tag exists in both, combine scores; otherwise add with model weightage
    tagScores.set(tagName, existingScore + modelWeightage);
  });

  // Convert back to array and sort by score
  const combinedTags = Array.from(tagScores.entries())
      .map(([tag, score]) => ({
        tag: tag,
        score: score,
      }))
      .sort((a, b) => b.score - a.score);

  // Apply maxTags limit
  const limitedTags = combinedTags.slice(0, options.maxTags);

  // Return in requested format
  if (options.includeScores) {
    return limitedTags;
  } else {
    return limitedTags.map((t) => t.tag);
  }
}

/**
 * Predict tags for blog content
 * Call from frontend: firebase.functions().httpsCallable('predictBlogTags')
 */
exports.predictBlogTags = functions.https.onCall(async (data, context) => {
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

    // Set default options for local prediction
    const localPredictionOptions = {
      minScore: options.minScore || 1,
      maxTags: options.maxTags || 10,
      titleWeight: options.titleWeight || 2,
      includeScores: options.includeScores !== false, // Default true
    };

    // Set options for combining results
    const combineOptions = {
      ...localPredictionOptions,
      modelWeightage: options.modelWeightage || 2.5,
    };

    // Run both predictions in parallel for better performance
    const [localResults, modelTags] = await Promise.all([
      // Get local model predictions
      Promise.resolve(predictTags(title, content, localPredictionOptions)),
      // Get custom model predictions
      callTagPredictorModel(title, content),
    ]);

    // Combine results with appropriate weightage
    const combinedTags = combineTags(
        localResults.predictedTags,
        modelTags,
        combineOptions,
    );

    // Log for analytics
    console.log(`Tag prediction for "${title.substring(0, 50)}...": Local=${localResults.predictedTags.length}, Model=${modelTags.length}, Combined=${combinedTags.length}`);

    return {
      success: true,
      predictedTags: combinedTags,
      metadata: {
        localTagsCount: localResults.predictedTags.length,
        modelTagsCount: modelTags.length,
        combinedTagsCount: combinedTags.length,
        modelTags: modelTags, // Include for debugging/analytics
        processingTime: localResults.processingTime || 0,
      },
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
