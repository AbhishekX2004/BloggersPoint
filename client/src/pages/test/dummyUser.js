const dummyUser = {
    status: "success",
    id: {
        displayName: "John Doe",
        photoURL: "https://lh3.googleusercontent.com/a/ACg8ocK2BmdmFnOgJuhLkeHWD4MLKfV94mtHyrPKSpjUULBJOofptbji=s96-c",
        lastLogin: "June 22, 2025 at 4:19:53 PM UTC+5:30", // Firebase timestamp
        status: "✍️ Writing Mode", // see userStatuses, the emoji will be the symbol
        email: "johndoe@example.com",
        followers: 150,
        following: 200,
        bio: "A passionate writer and blogger.",
        blogsWritten: 50
    }
};

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


export { dummyUser, userStatuses };