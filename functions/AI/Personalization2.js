/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const express = require("express");
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();
const router = express.Router();

// Cache for personalization data (in production, use Redis)
const personalizationCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Personalized Blog Filtering API
 * GET /api/blogs
 */
router.get("/blogs", async (req, res) => {
  try {
    const {
      uid,
      range,
      date,
      author,
      tags,
      sortBy = "latest",
      limit = 10,
      cursor,
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 10, 50); // Max 50 per request
    const parsedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : null;

    // Check if filters are provided (excluding uid, limit, cursor)
    const hasFilters = range || date || author || parsedTags || sortBy !== "latest";

    let blogs = [];
    let nextCursor = null;

    if (!uid || hasFilters) {
      // Standard filtering for unregistered users or when filters are provided
      const result = await getFilteredBlogs({
        range,
        date,
        author,
        tags: parsedTags,
        sortBy,
        limit: parsedLimit,
        cursor,
      });
      blogs = result.blogs;
      nextCursor = result.nextCursor;
    } else {
      // Personalized recommendations for registered users without filters
      const result = await getPersonalizedBlogs(uid, parsedLimit, cursor);
      blogs = result.blogs;
      nextCursor = result.nextCursor;
    }

    // Enhance blogs with user data and comments
    const enhancedBlogs = await enhanceBlogsWithUserDataAndComments(blogs);

    res.json({
      success: true,
      blogs: enhancedBlogs,
      nextCursor,
      hasMore: blogs.length === parsedLimit,
    });
  } catch (error) {
    console.error("Blog filtering error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

async function enhanceBlogsWithUserDataAndComments(blogs) {
  if (!blogs || blogs.length === 0) return [];

  // Extract unique user IDs from blogs
  const blogUserIds = [...new Set(blogs.map((blog) => blog.uid))];

  // Fetch all unique users in a single batch
  const userDocs = await Promise.all(
      blogUserIds.map((uid) => db.collection("users").doc(uid).get()),
  );

  // Create a map of user data for quick lookup
  const userDataMap = {};
  userDocs.forEach((doc, index) => {
    if (doc.exists) {
      const userData = doc.data();
      userDataMap[blogUserIds[index]] = {
        displayName: userData.displayName || "Anonymous",
        photoURL: userData.photoURL || null,
      };
    } else {
      userDataMap[blogUserIds[index]] = {
        displayName: "Anonymous",
        photoURL: null,
      };
    }
  });

  // Fetch comments for all blogs in parallel
  const commentPromises = blogs.map(async (blog) => {
    if (!blog.id) return [];

    try {
      const commentsSnapshot = await db
          .collection("blogs")
          .doc(blog.id)
          .collection("comments")
          .orderBy("createdAt", "desc")
          .limit(2)
          .get();

      if (commentsSnapshot.empty) return [];

      const comments = commentsSnapshot.docs.map((doc) => ({
        content: doc.data().content,
        createdAt: doc.data().createdAt,
        uid: doc.data().uid,
      }));

      return comments;
    } catch (error) {
      console.error(`Error fetching comments for blog ${blog.id}:`, error);
      return [];
    }
  });

  const allComments = await Promise.all(commentPromises);

  // Extract unique user IDs from comments
  const commentUserIds = [...new Set(
      allComments.flat().map((comment) => comment.uid).filter(Boolean),
  )];

  // Fetch comment users data (only if there are new user IDs not already fetched)
  const newCommentUserIds = commentUserIds.filter((uid) => !userDataMap[uid]);

  if (newCommentUserIds.length > 0) {
    const commentUserDocs = await Promise.all(
        newCommentUserIds.map((uid) => db.collection("users").doc(uid).get()),
    );

    // Add new user data to the map
    commentUserDocs.forEach((doc, index) => {
      if (doc.exists) {
        const userData = doc.data();
        userDataMap[newCommentUserIds[index]] = {
          displayName: userData.displayName || "Anonymous",
          photoURL: userData.photoURL || null,
        };
      } else {
        userDataMap[newCommentUserIds[index]] = {
          displayName: "Anonymous",
          photoURL: null,
        };
      }
    });
  }

  // Enhance blogs with user data and comments
  const enhancedBlogs = blogs.map((blog, index) => {
    const blogUserData = userDataMap[blog.uid];
    const blogComments = allComments[index];

    // Enhance comments with user data
    const enhancedComments = blogComments.map((comment) => ({
      ...comment,
      displayName: userDataMap[comment.uid]?.displayName.trim() || "Anonymous",
      photoURL: userDataMap[comment.uid]?.photoURL || null,
    }));

    return {
      ...blog,
      author: blogUserData?.displayName.trim() || "Anonymous",
      profilePictureURL: blogUserData?.photoURL || null,
      recentComments: enhancedComments,
    };
  });

  // Remove unwanted fields from blogs
  const cleanedBlogs = enhancedBlogs.map((blog) => {
    const {mediaURL, updatedAt, ...cleanedBlog} = blog;
    return {
      ...cleanedBlog,
      content: cleanedBlog.content && cleanedBlog.content.length > 150 ?
        cleanedBlog.content.substring(0, 150) + "..." :
        cleanedBlog.content,
    };
  });

  return cleanedBlogs;
}

/**
 * Get filtered blogs based on provided filters
 */
async function getFilteredBlogs({range, date, author, tags, sortBy, limit, cursor}) {
  let query = db.collection("blogs");

  // Apply filters
  if (range) {
    const dateRange = getDateRange(range);
    if (dateRange.start) query = query.where("createdAt", ">=", dateRange.start);
    if (dateRange.end) query = query.where("createdAt", "<=", dateRange.end);
  }

  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    query = query.where("createdAt", ">=", startOfDay)
        .where("createdAt", "<=", endOfDay);
  }

  if (author) {
    // Get user by displayName
    const userQuery = await db.collection("users")
        .where("displayName", "==", author)
        .limit(1)
        .get();

    if (!userQuery.empty) {
      const authorUid = userQuery.docs[0].id;
      query = query.where("uid", "==", authorUid);
    } else {
      // No user found with this displayName
      return {blogs: [], nextCursor: null};
    }
  }

  // Apply sorting
  switch (sortBy) {
    case "oldest":
      query = query.orderBy("createdAt", "asc");
      break;
    case "most-popular":
      query = query.orderBy("likes", "desc").orderBy("createdAt", "desc");
      break;
    case "most-commented":
      query = query.orderBy("comments", "desc").orderBy("createdAt", "desc");
      break;
    default: // latest
      query = query.orderBy("createdAt", "desc");
  }

  // Apply cursor pagination
  if (cursor) {
    const cursorDoc = await db.collection("blogs").doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  query = query.limit(limit);
  const snapshot = await query.get();

  let blogs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Handle tag filtering (fuzzy matching)
  if (tags && tags.length > 0) {
    blogs = filterByTags(blogs, tags);
  }

  const nextCursor = blogs.length > 0 ? blogs[blogs.length - 1].id : null;

  return {blogs, nextCursor};
}

/**
 * Get personalized blog recommendations
 */
async function getPersonalizedBlogs(uid, limit, cursor) {
  // Get user's personalization data
  const personalizationData = await getUserPersonalizationData(uid);

  if (!personalizationData) {
    // Fallback to latest blogs for new users
    return await getFilteredBlogs({sortBy: "latest", limit, cursor});
  }

  const {following, likedTags, likedUsers, interests} = personalizationData;

  // Calculate split: 80% personalized, 20% fresh
  const personalizedLimit = Math.ceil(limit * 0.8);
  const freshLimit = Math.floor(limit * 0.2);

  // Get personalized content in parallel
  const [personalizedBlogs, freshBlogs] = await Promise.all([
    getPersonalizedContent(uid, personalizedLimit, cursor, {
      following,
      likedTags,
      likedUsers,
      interests,
    }),
    getFreshContent(uid, freshLimit, {following, likedTags, likedUsers}),
  ]);

  // Combine and apply diversity controls
  let combinedBlogs = [...personalizedBlogs, ...freshBlogs];
  combinedBlogs = applyDiversityControls(combinedBlogs);

  // Sort by recommendation score and creation time
  combinedBlogs.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply cursor pagination if needed
  if (cursor) {
    const cursorIndex = combinedBlogs.findIndex((blog) => blog.id === cursor);
    if (cursorIndex !== -1) {
      combinedBlogs = combinedBlogs.slice(cursorIndex + 1);
    }
  }

  const resultBlogs = combinedBlogs.slice(0, limit);
  const nextCursor = resultBlogs.length > 0 ? resultBlogs[resultBlogs.length - 1].id : null;

  return {blogs: resultBlogs, nextCursor};
}

/**
 * Get personalized content based on user preferences
 */
async function getPersonalizedContent(uid, limit, cursor, {following, likedTags, likedUsers, interests}) {
  const personalizedBlogs = [];
  const seenBlogIds = new Set();

  // 1. Content from followed users (40% of personalized = 32% of total)
  const followingLimit = Math.ceil(limit * 0.4);
  if (following.length > 0) {
    const followingBlogs = await getBlogsByUsers(following, followingLimit);
    followingBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        blog.score = 100 + (50 - personalizedBlogs.length); // High priority
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 2. Content from liked tags (25% of personalized = 20% of total)
  const likedTagsLimit = Math.ceil(limit * 0.25);
  if (likedTags.length > 0) {
    const tagBlogs = await getBlogsByTags(likedTags.slice(0, 10), likedTagsLimit);
    tagBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        const tagScore = calculateTagScore(blog.tags, likedTags);
        blog.score = 80 + tagScore;
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 3. Content from liked users (10% of personalized = 8% of total)
  const likedUsersLimit = Math.ceil(limit * 0.1);
  if (likedUsers.length > 0) {
    const userBlogs = await getBlogsByUsers(likedUsers.slice(0, 10), likedUsersLimit);
    userBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        const userIndex = likedUsers.indexOf(blog.uid);
        blog.score = 70 + (10 - userIndex); // LRU based scoring
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 4. Content from user interests (5% of personalized = 4% of total)
  const interestsLimit = Math.ceil(limit * 0.05);
  if (interests.length > 0) {
    const interestBlogs = await getBlogsByTags(interests, interestsLimit);
    interestBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        blog.score = 60 + calculateTagScore(blog.tags, interests);
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  return personalizedBlogs;
}

/**
 * Get fresh content for discovery
 */
async function getFreshContent(uid, limit, {following, likedTags, likedUsers}) {
  const freshBlogs = [];
  const excludeUsers = new Set([uid, ...following, ...likedUsers]);

  // Get recent popular blogs from new authors
  const popularQuery = db.collection("blogs")
      .where("createdAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .orderBy("likes", "desc")
      .orderBy("createdAt", "desc")
      .limit(limit * 3); // Get more to filter out

  const popularSnapshot = await popularQuery.get();

  popularSnapshot.docs.forEach((doc) => {
    const blog = {id: doc.id, ...doc.data()};
    if (!excludeUsers.has(blog.uid) && freshBlogs.length < limit) {
      blog.score = 50 + (blog.likes * 2) + (blog.comments * 3);
      freshBlogs.push(blog);
    }
  });

  return freshBlogs;
}

/**
 * Apply diversity controls to prevent content concentration
 */
function applyDiversityControls(blogs) {
  const authorCount = {};
  const tagCount = {};
  const diversifiedBlogs = [];

  blogs.forEach((blog) => {
    const authorLimit = 4; // Max 4 blogs per author
    const tagLimit = 5; // Max 5 blogs per tag

    // Check author diversity
    const authorOk = !authorCount[blog.uid] || authorCount[blog.uid] < authorLimit;

    // Check tag diversity
    const tagOk = !blog.tags || blog.tags.every((tag) =>
      !tagCount[tag] || tagCount[tag] < tagLimit,
    );

    if (authorOk && tagOk) {
      diversifiedBlogs.push(blog);

      // Update counts
      authorCount[blog.uid] = (authorCount[blog.uid] || 0) + 1;
      if (blog.tags) {
        blog.tags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    }
  });

  return diversifiedBlogs;
}

/**
 * Get user's personalization data with caching
 */
async function getUserPersonalizationData(uid) {
  const cacheKey = `personalization_${uid}`;

  // Check cache
  if (personalizationCache.has(cacheKey)) {
    const cached = personalizationCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const [followsDoc, likesDoc, topicsDoc] = await Promise.all([
      db.collection("users").doc(uid).collection("personalize").doc("follows").get(),
      db.collection("users").doc(uid).collection("personalize").doc("likes").get(),
      db.collection("users").doc(uid).collection("personalize").doc("topics").get(),
    ]);

    const personalizationData = {
      following: followsDoc.exists ? (followsDoc.data().following || []) : [],
      likedTags: likesDoc.exists ? (likesDoc.data().liked_tags || []) : [],
      likedUsers: likesDoc.exists ? (likesDoc.data().liked_users || []) : [],
      interests: topicsDoc.exists ? (topicsDoc.data().interests || []) : [],
    };

    // Cache the data
    personalizationCache.set(cacheKey, {
      data: personalizationData,
      timestamp: Date.now(),
    });

    return personalizationData;
  } catch (error) {
    console.error("Error fetching personalization data:", error);
    return null;
  }
}

/**
 * Helper function to get blogs by user IDs
 */
async function getBlogsByUsers(userIds, limit) {
  if (userIds.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10));
  }

  const allBlogs = [];
  for (const chunk of chunks) {
    const query = db.collection("blogs")
        .where("uid", "in", chunk)
        .orderBy("createdAt", "desc")
        .limit(limit);

    const snapshot = await query.get();
    snapshot.docs.forEach((doc) => {
      allBlogs.push({id: doc.id, ...doc.data()});
    });

    if (allBlogs.length >= limit) break;
  }

  return allBlogs.slice(0, limit);
}

/**
 * Helper function to get blogs by tags
 */
async function getBlogsByTags(tags, limit) {
  if (tags.length === 0) return [];

  const query = db.collection("blogs")
      .where("tags", "array-contains-any", tags.slice(0, 10))
      .orderBy("createdAt", "desc")
      .limit(limit * 2);

  const snapshot = await query.get();
  const blogs = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  return filterByTags(blogs, tags).slice(0, limit);
}

/**
 * Filter blogs by tags with fuzzy matching
 */
function filterByTags(blogs, targetTags) {
  return blogs.map((blog) => {
    const score = calculateTagScore(blog.tags || [], targetTags);
    return {...blog, tagMatchScore: score};
  })
      .filter((blog) => blog.tagMatchScore > 0)
      .sort((a, b) => b.tagMatchScore - a.tagMatchScore);
}

/**
 * Calculate tag matching score
 */
function calculateTagScore(blogTags, targetTags) {
  if (!blogTags || !targetTags) return 0;

  let score = 0;
  blogTags.forEach((blogTag) => {
    const targetIndex = targetTags.indexOf(blogTag);
    if (targetIndex !== -1) {
      // Higher score for tags that appear earlier in the preference list
      score += Math.max(10 - targetIndex, 1);
    }
  });

  return score;
}

/**
 * Get date range based on range parameter
 */
function getDateRange(range) {
  const now = new Date();
  const ranges = {
    "today": {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
    },
    "this-week": {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
      end: now,
    },
    "this-month": {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
    },
    "past-3months": {
      start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      end: now,
    },
    "this-year": {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
    },
  };

  return ranges[range] || {start: null, end: null};
}

module.exports = router;
