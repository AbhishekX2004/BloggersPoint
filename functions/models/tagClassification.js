/* eslint-disable max-len */

const tagKeywords = require("../utils/tagsList");

/**
 * Preprocess text for better matching
 * @param {string} text - The text to preprocess
 * @return {string} - Preprocessed text
 */
const preprocessText = (text) => {
  return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ") // Replace punctuation with spaces
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
};

const compileTagRegexes = (tagKeywords) => {
  const compiled = {};
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    compiled[tag] = keywords.map((keyword) => ({
      keyword,
      regex: new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"),
      baseScore: keyword.length > 8 ? 3 : keyword.length > 4 ? 2 : 1,
    }));
  }
  return compiled;
};

/**
 * Predict tags for given title and content
 * @param {string} title - Blog title
 * @param {string} content - Blog content
 * @param {Object} options - Prediction options
 * @return {Object} - Prediction results
 */
const predictTags = (title, content, options = {}) => {
  const {
    minScore = 1,
    maxTags = 10,
    titleWeight = 2,
    includeScores = true,
  } = options;

  // Step 1: Preprocess input
  const processedTitle = preprocessText(title);
  const processedContent = preprocessText(content);
  const combinedText = `${processedTitle} ${processedContent}`;
  const wordCount = combinedText.split(/\s+/).length;

  // Step 2: Compile regexes once
  const compiledTagRegexes = compileTagRegexes(tagKeywords);

  const tagResults = [];

  // Step 3: Score each tag
  for (const [tag, keywordObjs] of Object.entries(compiledTagRegexes)) {
    let titleMatches = 0;
    let contentMatches = 0;
    const matchedKeywords = new Set();
    let rawTitleScore = 0;
    let rawContentScore = 0;

    for (const {keyword, regex, baseScore} of keywordObjs) {
      const titleCount = (processedTitle.match(regex) || []).length;
      const contentCount = (processedContent.match(regex) || []).length;

      if (titleCount + contentCount > 0) matchedKeywords.add(keyword);

      titleMatches += titleCount;
      contentMatches += contentCount;
      rawTitleScore += baseScore * titleCount;
      rawContentScore += baseScore * contentCount;
    }

    const totalMatches = titleMatches + contentMatches;
    const weightedScore = rawTitleScore * titleWeight + rawContentScore;

    if (weightedScore >= minScore) {
      const confidence = Math.min(weightedScore / (wordCount / 100), 1);
      const result = {
        tag,
        confidence: +confidence.toFixed(3),
        matches: totalMatches,
        weightedScore,
      };

      if (includeScores) {
        result.details = {
          titleMatches,
          contentMatches,
          matchedKeywords: [...matchedKeywords],
        };
      }

      tagResults.push(result);
    }
  }

  // Step 4: Sort & Return
  tagResults.sort((a, b) => b.weightedScore - a.weightedScore);
  const topTags = tagResults.slice(0, maxTags);

  return {
    predictedTags: topTags.map((r) => r.tag),
    tagScores: topTags,
    totalTagsAnalyzed: Object.keys(tagKeywords).length,
    wordCount,
  };
};

/**
 * Get all available tags
 * @return {Array} - Array of all tag names
 */
const getAvailableTags = () => {
  return Object.keys(tagKeywords);
};

/**
 * Get keywords for a specific tag
 * @param {string} tag - Tag name
 * @return {Array} - Array of keywords for the tag
 */
const getTagKeywords = (tag) => {
  return tagKeywords[tag] || [];
};

module.exports = {
  predictTags,
  getAvailableTags,
  getTagKeywords,
};
