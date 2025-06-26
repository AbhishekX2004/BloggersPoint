/* eslint-disable require-jsdoc */

// Middleware to verify user status updates
function statusVerify(req, res, next) {
  const {uid, status} = req.body;
  if (!uid || !status) {
    return res.status(400).json({error: "Missing User ID or Status."});
  }
  if (!userStatuses.includes(status)) {
    return res.status(400).json({error: "Invalid Status."});
  }
  next();
}

const userStatuses = [
  "✍️ Writing Mode",
  "🧠 Brainstorming",
  "🌴 On a Break",
  "📚 Researching",
  "🔍 Exploring Ideas",
  "💬 Open to Collaborate",
  "🎯 Focused",
  "📅 Planning Ahead",
  "💡 Inspired",
  "🐢 Taking It Slow",
  "🦾 Grinding Hard",
  "🌙 Late Night Writer",
];

exports.statusVerify = statusVerify;
