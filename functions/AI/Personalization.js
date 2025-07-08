/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable valid-jsdoc */
/**
 * Get personalized blog recommendations
 */
async function getPersonalizedBlogs(uid, limit, cursor) {
  // Get user's personalization data
  const personalizationData = await getUserPersonalizationData(uid);

  if (!personalizationData) {
    // Fallback to latest blogs for new users, excluding own blogs
    return await getFilteredBlogs({sortBy: "latest", limit, cursor, excludeUid: uid});
  }

  const {following, likedTags, likedUsers, interests} = personalizationData;

  // Get personalized content
  const personalizedBlogs = await getPersonalizedContent(uid, limit * 2, cursor, {
    following,
    likedTags,
    likedUsers,
    interests,
  });

  // If we don't have enough personalized content, fill with fresh content
  let finalBlogs = [...personalizedBlogs];

  if (finalBlogs.length < limit) {
    const freshBlogs = await getFreshContent(uid, limit - finalBlogs.length, {
      following,
      likedTags,
      likedUsers,
    });
    finalBlogs = [...finalBlogs, ...freshBlogs];
  }

  // Apply diversity controls
  finalBlogs = applyDiversityControls(finalBlogs);

  // Sort by recommendation score and creation time
  finalBlogs.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply cursor pagination if needed
  if (cursor) {
    const cursorIndex = finalBlogs.findIndex((blog) => blog.id === cursor);
    if (cursorIndex !== -1) {
      finalBlogs = finalBlogs.slice(cursorIndex + 1);
    }
  }

  const resultBlogs = finalBlogs.slice(0, limit);
  const nextCursor = resultBlogs.length > 0 ? resultBlogs[resultBlogs.length - 1].id : null;

  return {blogs: resultBlogs, nextCursor};
}

/**
 * Get personalized content based on user preferences
 */
async function getPersonalizedContent(uid, limit, cursor, {following, likedTags, likedUsers, interests}) {
  const personalizedBlogs = [];
  const seenBlogIds = new Set();

  // 1. Content from followed users (higher priority)
  if (following.length > 0) {
    const followingBlogs = await getBlogsByUsers(following, Math.ceil(limit * 0.4), uid);
    followingBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        blog.score = 100 + (50 - personalizedBlogs.length);
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 2. Content from liked tags
  if (likedTags.length > 0) {
    const tagBlogs = await getBlogsByTags(likedTags.slice(0, 10), Math.ceil(limit * 0.3), uid);
    tagBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        const tagScore = calculateTagScore(blog.tags, likedTags);
        blog.score = 80 + tagScore;
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 3. Content from liked users
  if (likedUsers.length > 0) {
    const userBlogs = await getBlogsByUsers(likedUsers.slice(0, 10), Math.ceil(limit * 0.2), uid);
    userBlogs.forEach((blog) => {
      if (!seenBlogIds.has(blog.id)) {
        const userIndex = likedUsers.indexOf(blog.uid);
        blog.score = 70 + (10 - userIndex);
        personalizedBlogs.push(blog);
        seenBlogIds.add(blog.id);
      }
    });
  }

  // 4. Content from user interests
  if (interests.length > 0) {
    const interestBlogs = await getBlogsByTags(interests, Math.ceil(limit * 0.1), uid);
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
      .where("createdAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .orderBy("likes", "desc")
      .orderBy("createdAt", "desc")
      .limit(limit * 3);

  const popularSnapshot = await popularQuery.get();

  popularSnapshot.docs.forEach((doc) => {
    const blog = {id: doc.id, ...doc.data()};
    if (!excludeUsers.has(blog.uid) && freshBlogs.length < limit) {
      blog.score = 50 + (blog.likes * 2) + (blog.comments * 3);
      freshBlogs.push(blog);
    }
  });

  // If we still don't have enough, get more recent blogs
  if (freshBlogs.length < limit) {
    const recentQuery = db.collection("blogs")
        .orderBy("createdAt", "desc")
        .limit((limit - freshBlogs.length) * 2);

    const recentSnapshot = await recentQuery.get();

    recentSnapshot.docs.forEach((doc) => {
      const blog = {id: doc.id, ...doc.data()};
      if (!excludeUsers.has(blog.uid) && freshBlogs.length < limit) {
        blog.score = 30 + (blog.likes * 1) + (blog.comments * 2);
        freshBlogs.push(blog);
      }
    });
  }

  return freshBlogs;
}

/**
 * Helper function to get blogs by user IDs (excluding own blogs)
 */
async function getBlogsByUsers(userIds, limit, excludeUid = null) {
  if (userIds.length === 0) return [];

  // Remove excludeUid from userIds if present
  const filteredUserIds = excludeUid ? userIds.filter((id) => id !== excludeUid) : userIds;

  if (filteredUserIds.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < filteredUserIds.length; i += 10) {
    chunks.push(filteredUserIds.slice(i, i + 10));
  }

  const allBlogs = [];
  for (const chunk of chunks) {
    const query = db.collection("blogs")
        .where("uid", "in", chunk)
        .orderBy("createdAt", "desc")
        .limit(limit);

    const snapshot = await query.get();
    snapshot.docs.forEach((doc) => {
      const blog = {id: doc.id, ...doc.data()};
      // Double-check to exclude own blogs
      if (!excludeUid || blog.uid !== excludeUid) {
        allBlogs.push(blog);
      }
    });

    if (allBlogs.length >= limit) break;
  }

  return allBlogs.slice(0, limit);
}

/**
 * Helper function to get blogs by tags (excluding own blogs)
 */
async function getBlogsByTags(tags, limit, excludeUid = null) {
  if (tags.length === 0) return [];

  const query = db.collection("blogs")
      .where("tags", "array-contains-any", tags.slice(0, 10))
      .orderBy("createdAt", "desc")
      .limit(limit * 2);

  const snapshot = await query.get();
  let blogs = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  // Filter out own blogs
  if (excludeUid) {
    blogs = blogs.filter((blog) => blog.uid !== excludeUid);
  }

  return filterByTags(blogs, tags).slice(0, limit);
}

/**
 * Get filtered blogs based on provided filters (updated to support excludeUid)
 */
async function getFilteredBlogs({range, date, author, tags, sortBy, limit, cursor, excludeUid}) {
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
    const userQuery = await db.collection("users")
        .where("displayName", "==", author)
        .limit(1)
        .get();

    if (!userQuery.empty) {
      const authorUid = userQuery.docs[0].id;
      query = query.where("uid", "==", authorUid);
    } else {
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

  // Filter out own blogs if excludeUid is provided
  if (excludeUid) {
    blogs = blogs.filter((blog) => blog.uid !== excludeUid);
  }

  // Handle tag filtering (fuzzy matching)
  if (tags && tags.length > 0) {
    blogs = filterByTags(blogs, tags);
  }

  const nextCursor = blogs.length > 0 ? blogs[blogs.length - 1].id : null;

  return {blogs, nextCursor};
}
