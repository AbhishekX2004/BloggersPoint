// When user opens a blog post, three apis will be simultaneously called:
// 1. Get the blog post content
// 2. Get the blog post comments
// 3. Get the authors details

// This is a dummy blog post content response with jumbled content and embedded images.
export const dummyBlogPost = {
    "blogid": {
        "title": "Understanding JavaScript Promises",
        "author": "Alice Johnson",
        "uid": "alice123",
        "authorAvatar": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
        "timestamp": "2023-10-01T10:00:00Z",
        "content": `JavaScript promises are a powerful way to handle asynchronous operations. They allow you to write cleaner and more manageable code when dealing with operations that take time, such as API calls or file reading. 

But wait, before we dive deeper, let me share something interesting I discovered while working on a recent project. You know how sometimes you're debugging code at 2 AM and suddenly everything clicks? That's exactly what happened when I finally understood the true power of Promise.all().

![Understanding Promises Diagram](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop)

Now, where was I? Oh yes, promises! So, imagine you're at a restaurant (stay with me here, this analogy actually makes sense). You order food, and instead of standing at the kitchen door waiting for your meal, you get a receipt - that's essentially what a promise is in JavaScript. It's a placeholder for a value that will be available in the future.

The three states of a promise are:
- Pending: Your order is being prepared
- Fulfilled: Your delicious meal arrives
- Rejected: The kitchen ran out of ingredients

Here's a simple example:
\`\`\`javascript
const myPromise = new Promise((resolve, reject) => {
    // Some asynchronous operation
    setTimeout(() => {
        resolve("Data loaded successfully!");
    }, 2000);
});
\`\`\`

But here's where it gets interesting (and this is something most tutorials don't tell you). Promises aren't just about handling single asynchronous operations. They're about composing complex workflows. Think of them as building blocks for your asynchronous architecture.

![Promise Chain Visualization](https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=300&fit=crop)

Speaking of architecture, I once worked on a project where we had to make 15 different API calls in a specific sequence. Without promises, our code looked like callback hell - you know, those nested functions that go so deep you need a map to find your way out. With promises and async/await, it became poetry.

Let me tell you about .then() and .catch(). These methods are like the Swiss Army knife of promise handling. You chain them together to create a pipeline of operations:

\`\`\`javascript
fetch('/api/user')
    .then(response => response.json())
    .then(userData => {
        console.log('User data:', userData);
        return fetch(\`/api/posts/\${userData.id}\`);
    })
    .then(response => response.json())
    .then(posts => {
        console.log('User posts:', posts);
    })
    .catch(error => {
        console.error('Something went wrong:', error);
    });
\`\`\`

Now, here's a pro tip that took me years to learn: always handle your promise rejections. Unhandled promise rejections are like silent killers in your application. They'll crash your Node.js process in production faster than you can say "debugging nightmare."

The modern way to work with promises is using async/await syntax. It's syntactic sugar that makes asynchronous code look synchronous:

\`\`\`javascript
async function fetchUserData() {
    try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        console.log(userData);
    } catch (error) {
        console.error('Error:', error);
    }
}
\`\`\`

But here's something most developers overlook: Promise.all(), Promise.race(), Promise.allSettled(), and Promise.any(). These are the real workhorses when you need to handle multiple promises simultaneously.

Promise.all() is perfect when you need all promises to succeed. It's like waiting for all your friends to arrive before starting the party. Promise.race() is the opposite - it resolves as soon as the first promise settles, like a race where you only care about the winner.

I remember debugging a performance issue where API calls were happening sequentially instead of in parallel. Switching from individual awaits to Promise.all() reduced the loading time from 5 seconds to 1.2 seconds. Sometimes the solution is simpler than you think.

Error handling with promises can be tricky. You can catch errors at any point in the chain, and they'll bubble up to the nearest .catch() handler. It's like having a safety net that catches you whenever you fall.

One common mistake I see developers make is mixing callbacks with promises. Don't do it. Pick one pattern and stick with it. Consistency is key to maintainable code.

Advanced promise patterns include creating custom promise wrappers for legacy callback-based APIs, implementing retry logic with exponential backoff, and using promise pools for rate limiting. These techniques separate junior developers from seniors.

In conclusion, promises aren't just a feature of JavaScript - they're a fundamental shift in how we think about asynchronous programming. They transform callback spaghetti into clean, readable code that's easy to reason about and maintain.

Remember: every promise you create is a commitment to handle both success and failure. Treat them with respect, and they'll serve you well in your JavaScript journey.

Happy coding, and may your promises always resolve! 🚀`,
        "tags": ["JavaScript", "Promises", "Asynchronous"],
        "likes": 150,
        picturesURL: [
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
            "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=300&fit=crop"
        ],
    }
}

// This is a dummy blog comments api response.
export const dummyBlogComments = {
    "comments": [
        {
            "cid": 1,
            "author": "John Doe",
            "content": "This is a great blog post!",
            "timestamp": "2023-10-01T12:00:00Z"
        },
        {
            "cid": 2,
            "author": "Jane Smith",
            "content": "I found this very informative, thank you!",
            "timestamp": "2023-10-02T14:30:00Z"
        }
    ],
    "totalComments": 2,
    "hasMore": false,
    "nextCursor": null
}

// This is a dummy blog author details api response.
export const dummyBlogAuthorDetails = {
    "author": {
        "uid": "alice123",
        "name": "Alice Johnson",
        "avatar": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
        "bio": "Alice is a software engineer with a passion for teaching others about JavaScript and web development.",
        "postsCount": 45
    }
}