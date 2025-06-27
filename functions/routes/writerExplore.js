/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();

// Get user's blogs with filtering and pagination
router.get("/user-blogs/:uid", async (req, res) => {
  const {uid} = req.params;
  const {
    sortBy = "recent", // recent, mostLiked, dated
    dateFilter, // YYYY-MM-DD format for specific date
    timeRange, // lastWeek, lastMonth, last3Months, last6Months
    cursor, // for pagination
    limit = 10, // number of blogs per page
  } = req.query;

  if (!uid) {
    return res.status(400).json({
      status: "failure",
      error: "User ID is required.",
    });
  }

  try {
    // Check if user exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: "failure",
        error: "User not found.",
      });
    }

    // Get blog IDs from user's myBlogs subcollection
    let myBlogsQuery = userRef.collection("myBlogs");

    // Apply time range filter if specified
    if (timeRange) {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case "lastWeek":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "lastMonth":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last3Months":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "last6Months":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        myBlogsQuery = myBlogsQuery.where("createdAt", ">=", startDate);
      }
    }

    // Apply date filter if specified
    if (dateFilter) {
      try {
        const filterDate = new Date(dateFilter);
        const nextDay = new Date(filterDate.getTime() + 24 * 60 * 60 * 1000);
        myBlogsQuery = myBlogsQuery
            .where("createdAt", ">=", filterDate)
            .where("createdAt", "<", nextDay);
      } catch (error) {
        return res.status(400).json({
          status: "failure",
          error: "Invalid date format. Use YYYY-MM-DD.",
        });
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
      case "mostLiked":
        myBlogsQuery = myBlogsQuery.orderBy("createdAt", "desc");
        break;
      case "dated":
        myBlogsQuery = myBlogsQuery.orderBy("createdAt", "asc");
        break;
      default:
        myBlogsQuery = myBlogsQuery.orderBy("createdAt", "desc");
    }

    // Apply cursor pagination
    if (cursor) {
      const cursorDoc = await userRef.collection("myBlogs").doc(cursor).get();
      if (cursorDoc.exists) {
        myBlogsQuery = myBlogsQuery.startAfter(cursorDoc);
      }
    }

    // Limit results
    myBlogsQuery = myBlogsQuery.limit(parseInt(limit) + 1); // +1 to check if there are more

    const myBlogsSnapshot = await myBlogsQuery.get();
    const blogIds = myBlogsSnapshot.docs.map((doc) => doc.id);

    if (blogIds.length === 0) {
      return res.status(200).json({
        status: "success",
        blogs: [],
        length: 0,
        nextCursor: null,
        hasMore: false,
      });
    }

    // Check if we have more results
    const hasMore = blogIds.length > parseInt(limit);
    const actualBlogIds = hasMore ? blogIds.slice(0, -1) : blogIds;
    const nextCursor = hasMore ? actualBlogIds[actualBlogIds.length - 1] : null;

    // Fetch blog details from blogs collection
    const blogPromises = actualBlogIds.map((blogId) =>
      db.collection("blogs").doc(blogId).get(),
    );

    const blogDocs = await Promise.all(blogPromises);
    let blogs = blogDocs
        .filter((doc) => doc.exists)
        .map((doc) => {
          const data = doc.data();
          return {
            blogId: doc.id,
            title: data.title || "",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || undefined,
            content: data.content ? data.content.substring(0, 150) : "",
            titleURL: data.titleURL || "",
            tags: data.tags || [],
            likes: data.likes || 0,
            comments: data.comments || 0,
          };
        });

    // Apply sorting by likes if specified (since we need blog data for this)
    if (sortBy === "mostLiked") {
      blogs.sort((a, b) => b.likes - a.likes);
    }

    // Remove updatedAt field if it doesn't exist or is same as createdAt
    blogs = blogs.map((blog) => {
      if (!blog.updatedAt || blog.updatedAt === blog.createdAt) {
        // eslint-disable-next-line no-unused-vars
        const {updatedAt, ...blogWithoutUpdatedAt} = blog;
        return blogWithoutUpdatedAt;
      }
      return blog;
    });

    return res.status(200).json({
      status: "success",
      blogs: blogs,
      length: blogs.length,
      nextCursor: nextCursor,
      hasMore: hasMore,
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return res.status(500).json({
      status: "failure",
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
