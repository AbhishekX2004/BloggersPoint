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

const tags = [ "Food", "Travel", "Lifestyle", "Technology", "Health", "Education", "Entertainment", "Finance", "Sports", "Fashion", "Art", "Music", "Gaming", "Science", "Environment", "Politics", "History", "Books", "Movies", "Photography", "DIY", "Parenting", "Pets", "Wellness", "Self-Improvement", "Mental Health", "Relationships", "Career", "Personal Finance", "Hobbies", "Crafts", "Gardening", "Cooking", "Baking", "Fitness", "Nutrition", "Travel Tips", "Adventure", "Culture", "Social Issues", "Technology Trends", "Innovation", "Startups", "Entrepreneurship", "Marketing", "Business", "Leadership", "Productivity", "Time Management", "Work-Life Balance", "Remote Work", "Sustainability", "Climate Change", "Wildlife Conservation", "Urban Living", "Rural Life", "Community", "Volunteering", "Philanthropy", "Spirituality", "Mindfulness", "Meditation", "Yoga", "Art Therapy", "Music Therapy" ];

export { dummyUser, userStatuses, tags };