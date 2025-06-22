const dummyBlogs = {
  status: "success",  // OR "failure"
  blogs: [
    {
    id: 1,
    title: "The Future of AI in Content Creation",
    author: "John Doe",
    authorId: "user123",
    timestamp: "2025-06-20T10:30:00Z",
    content: "Artificial Intelligence is revolutionizing how we create and consume content. From automated writing assistants to personalized recommendations...",
    mediaUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
    likes: 45,
    comments: [
      {
        id: 1,
        author: "Jane Smith",
        authorId: "user456",
        content: "Great insights! AI is definitely changing the game.",
        timestamp: "2025-06-20T11:15:00Z"
      },
      {
        id: 2,
        author: "Mike Johnson",
        authorId: "user789",
        content: "I'm curious about the ethical implications though.",
        timestamp: "2025-06-20T11:30:00Z"
      }
    ],
    totalComments: 12
  },
  {
    id: 2,
    title: "Building a Sustainable Tech Career",
    author: "Sarah Wilson",
    authorId: "user234",
    timestamp: "2025-06-20T08:45:00Z",
    content: "In today's rapidly evolving tech landscape, building a sustainable career requires continuous learning and adaptation...",
    mediaUrl: null,
    likes: 32,
    comments: [
      {
        id: 3,
        author: "Alex Chen",
        authorId: "user567",
        content: "This is exactly what I needed to hear today!",
        timestamp: "2025-06-20T09:20:00Z"
      }
    ],
    totalComments: 8
  },
  {
    id: 3,
    title: "The Art of Minimalist Design",
    author: "David Kim",
    authorId: "user345",
    timestamp: "2025-06-19T16:20:00Z",
    content: "Less is more - this principle has guided design philosophy for decades. But what does minimalism really mean in the digital age?",
    mediaUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=300&fit=crop",
    likes: 78,
    comments: [
      {
        id: 4,
        author: "Lisa Brown",
        authorId: "user678",
        content: "Beautiful examples in this post!",
        timestamp: "2025-06-19T17:10:00Z"
      },
      {
        id: 5,
        author: "Tom Anderson",
        authorId: "user890",
        content: "Minimalism is not just about aesthetics, it's about functionality.",
        timestamp: "2025-06-19T18:30:00Z"
      }
    ],
    totalComments: 15
  },
  {
    id: 4,
    title: "A Deep Dive into Quantum Computing",
    author: "Emily Carter",
    authorId: "user456",
    timestamp: "2025-06-18T14:00:00Z",
    content: "Quantum computing promises to solve problems that are currently intractable for classical computers. This post explores the basic principles...",
    mediaUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=300&fit=crop",
    likes: 120,
    comments: [],
    totalComments: 5
  },
  {
    id: 5,
    title: "The Rise of Vertical Farming",
    author: "Ben Green",
    authorId: "user567",
    timestamp: "2025-06-17T11:55:00Z",
    content: "As urban populations grow, vertical farming presents a sustainable solution for food production. Let's explore the technology and its impact.",
    mediaUrl: "https://images.unsplash.com/photo-1598439210625-5027bbe348f4?w=600&h=300&fit=crop",
    likes: 65,
    comments: [
        {
          id: 6,
          author: "Laura White",
          authorId: "user111",
          content: "Fascinating! I hope to see more of this in my city.",
          timestamp: "2025-06-17T12:30:00Z"
        }
    ],
    totalComments: 22
  },
  {
    id: 6,
    title: "Mastering the Art of Public Speaking",
    author: "Olivia Martinez",
    authorId: "user678",
    timestamp: "2025-06-16T09:10:00Z",
    content: "Public speaking is a skill that can open many doors. Here are some tips to help you become a more confident and effective speaker.",
    mediaUrl: null,
    likes: 95,
    comments: [
        {
          id: 7,
          author: "Sam Taylor",
          authorId: "user222",
          content: "These tips are incredibly helpful. Thank you!",
          timestamp: "2025-06-16T10:00:00Z"
        }
    ],
    totalComments: 18
  },
  {
    id: 7,
    title: "The Psychology of Color in Marketing",
    author: "Chris Lee",
    authorId: "user789",
    timestamp: "2025-06-15T18:00:00Z",
    content: "Colors evoke emotions and can significantly influence consumer behavior. Understanding color psychology is key for effective marketing.",
    mediaUrl: "https://images.unsplash.com/photo-1558470598-a5dda9d4a69d?w=600&h=300&fit=crop",
    likes: 210,
    comments: [],
    totalComments: 35
  },
  {
    id: 8,
    title: "Beginner's Guide to Investing in Cryptocurrency",
    author: "Mike Johnson",
    authorId: "user789",
    timestamp: "2025-06-14T12:30:00Z",
    content: "Cryptocurrency can be a daunting world for beginners. This guide breaks down the basics to get you started on your investment journey.",
    mediaUrl: "https://images.unsplash.com/photo-1640343292433-59d645e9f1a2?w=600&h=300&fit=crop",
    likes: 150,
    comments: [
        {
          id: 8,
          author: "John Doe",
          authorId: "user123",
          content: "Finally, a guide that makes sense!",
          timestamp: "2025-06-14T13:00:00Z"
        },
        {
          id: 9,
          author: "Jane Smith",
          authorId: "user456",
          content: "What are your thoughts on the volatility?",
          timestamp: "2025-06-14T13:15:00Z"
        }
    ],
    totalComments: 40
  },
  {
    id: 9,
    title: "The Importance of Mental Health in the Workplace",
    author: "Dr. Evelyn Reed",
    authorId: "user890",
    timestamp: "2025-06-13T10:00:00Z",
    content: "A positive work environment that prioritizes mental health leads to increased productivity and employee satisfaction. Let's discuss why.",
    mediaUrl: null,
    likes: 88,
    comments: [],
    totalComments: 10
  },
  {
    id: 10,
    title: "Exploring the Wonders of the Deep Sea",
    author: "Dr. Aris Thorne",
    authorId: "user901",
    timestamp: "2025-06-12T20:15:00Z",
    content: "The deep sea is the last unexplored frontier on Earth. Join us as we uncover the mysteries of the abyssal zone and its unique inhabitants.",
    mediaUrl: "https://images.unsplash.com/photo-1568449559330-c3d3879a685f?w=600&h=300&fit=crop",
    likes: 350,
    comments: [
        {
          id: 10,
          author: "MarineBioFan",
          authorId: "user333",
          content: "Absolutely breathtaking! The ocean is full of wonders.",
          timestamp: "2025-06-12T21:00:00Z"
        }
    ],
    totalComments: 55
  },
  {
    id: 11,
    title: "How to Bake the Perfect Sourdough Bread",
    author: "Maria Garcia",
    authorId: "user112",
    timestamp: "2025-06-11T15:45:00Z",
    content: "Baking sourdough can be a rewarding experience. This step-by-step guide will help you achieve that perfect crust and airy crumb.",
    mediaUrl: "https://images.unsplash.com/photo-1598373154812-59d43743501a?w=600&h=300&fit=crop",
    likes: 180,
    comments: [],
    totalComments: 25
  },
  {
    id: 12,
    title: "The Future of Remote Work: A Hybrid Model",
    author: "Daniel Roberts",
    authorId: "user223",
    timestamp: "2025-06-10T11:20:00Z",
    content: "The pandemic has changed the way we work forever. Is a hybrid model the future? Let's weigh the pros and cons.",
    mediaUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=300&fit=crop",
    likes: 130,
    comments: [
        {
          id: 11,
          author: "Sarah Wilson",
          authorId: "user234",
          content: "I think flexibility is key. Great article!",
          timestamp: "2025-06-10T12:00:00Z"
        }
    ],
    totalComments: 30
  },
  {
    id: 13,
    title: "An Introduction to Ethical Hacking",
    author: "Alex Chen",
    authorId: "user567",
    timestamp: "2025-06-09T14:50:00Z",
    content: "Ethical hacking is a crucial aspect of cybersecurity. Learn about the tools and techniques used to protect systems from malicious attacks.",
    mediaUrl: null,
    likes: 250,
    comments: [],
    totalComments: 45
  },
  {
    id: 14,
    title: "The Benefits of a Plant-Based Diet",
    author: "Chloe Davis",
    authorId: "user334",
    timestamp: "2025-06-08T09:00:00Z",
    content: "A plant-based diet can have numerous health and environmental benefits. Here's what the science says and how to get started.",
    mediaUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=300&fit=crop",
    likes: 195,
    comments: [],
    totalComments: 28
  },
  {
    id: 15,
    title: "Creating a Productive Home Office",
    author: "Lisa Brown",
    authorId: "user678",
    timestamp: "2025-06-07T16:30:00Z",
    content: "Your environment plays a huge role in your productivity. Learn how to design a home office that inspires focus and creativity.",
    mediaUrl: "https://images.unsplash.com/photo-1591017403229-00289ef3a027?w=600&h=300&fit=crop",
    likes: 110,
    comments: [
        {
          id: 12,
          author: "David Kim",
          authorId: "user345",
          content: "Love the minimalist setup ideas!",
          timestamp: "2025-06-07T17:00:00Z"
        }
    ],
    totalComments: 19
  },
  {
    id: 16,
    title: "The Science of Sleep: Why It's So Important",
    author: "Dr. Ben Carter",
    authorId: "user445",
    timestamp: "2025-06-06T22:00:00Z",
    content: "Sleep is not just a period of rest; it's a critical function for our physical and mental health. This article explores the science behind it.",
    mediaUrl: "https://images.unsplash.com/photo-1495578942200-c5f5d2137b6a?w=600&h=300&fit=crop",
    likes: 400,
    comments: [],
    totalComments: 60
  },
  {
    id: 17,
    title: "A Journey Through the Silk Road",
    author: "Marco Polo Jr.",
    authorId: "user556",
    timestamp: "2025-06-05T13:10:00Z",
    content: "The Silk Road was a network of trade routes that connected the East and West for centuries. Let's embark on a virtual journey to explore its history.",
    mediaUrl: "https://images.unsplash.com/photo-1588412109212-9a0094e0237d?w=600&h=300&fit=crop",
    likes: 280,
    comments: [],
    totalComments: 42
  },
  {
    id: 18,
    title: "The Art of Storytelling in Branding",
    author: "Grace Lee",
    authorId: "user667",
    timestamp: "2025-06-04T10:00:00Z",
    content: "Great brands don't just sell products; they tell stories. Discover how to weave compelling narratives into your brand identity.",
    mediaUrl: null,
    likes: 175,
    comments: [
        {
          id: 13,
          author: "Chris Lee",
          authorId: "user789",
          content: "Story is everything. Great read!",
          timestamp: "2025-06-04T11:00:00Z"
        }
    ],
    totalComments: 33
  },
  {
    id: 19,
    title: "Sustainable Travel: Exploring the World Responsibly",
    author: "Aisha Khan",
    authorId: "user778",
    timestamp: "2025-06-03T19:00:00Z",
    content: "Traveling can be both an enriching and a responsible activity. Here are some tips for being a more sustainable tourist.",
    mediaUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=300&fit=crop",
    likes: 220,
    comments: [],
    totalComments: 27
  },
  {
    id: 20,
    title: "The Impact of 5G on Our Daily Lives",
    author: "Tom Anderson",
    authorId: "user890",
    timestamp: "2025-06-02T14:30:00Z",
    content: "5G technology is set to revolutionize everything from how we communicate to how we interact with the world around us. What can we expect?",
    mediaUrl: "https://images.unsplash.com/photo-1614036750348-185e3c05b8a6?w=600&h=300&fit=crop",
    likes: 310,
    comments: [
        {
          id: 14,
          author: "Emily Carter",
          authorId: "user456",
          content: "The potential for IoT is mind-boggling.",
          timestamp: "2025-06-02T15:00:00Z"
        }
    ],
    totalComments: 48
  }
  ],
  length: 20,
  nextCursor: "nextId", // OR null
  hasMore: true,
}
export default dummyBlogs;


// const dummyBlogs = [
//   {
//     id: 1,
//     title: "The Future of AI in Content Creation",
//     author: "John Doe",
//     authorId: "user123",
//     timestamp: "2025-06-20T10:30:00Z",
//     content: "Artificial Intelligence is revolutionizing how we create and consume content. From automated writing assistants to personalized recommendations...",
//     mediaUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop",
//     likes: 45,
//     comments: [
//       {
//         id: 1,
//         author: "Jane Smith",
//         authorId: "user456",
//         content: "Great insights! AI is definitely changing the game.",
//         timestamp: "2025-06-20T11:15:00Z"
//       },
//       {
//         id: 2,
//         author: "Mike Johnson",
//         authorId: "user789",
//         content: "I'm curious about the ethical implications though.",
//         timestamp: "2025-06-20T11:30:00Z"
//       }
//     ],
//     totalComments: 12
//   },
//   {
//     id: 2,
//     title: "Building a Sustainable Tech Career",
//     author: "Sarah Wilson",
//     authorId: "user234",
//     timestamp: "2025-06-20T08:45:00Z",
//     content: "In today's rapidly evolving tech landscape, building a sustainable career requires continuous learning and adaptation...",
//     mediaUrl: null,
//     likes: 32,
//     comments: [
//       {
//         id: 3,
//         author: "Alex Chen",
//         authorId: "user567",
//         content: "This is exactly what I needed to hear today!",
//         timestamp: "2025-06-20T09:20:00Z"
//       }
//     ],
//     totalComments: 8
//   },
//   {
//     id: 3,
//     title: "The Art of Minimalist Design",
//     author: "David Kim",
//     authorId: "user345",
//     timestamp: "2025-06-19T16:20:00Z",
//     content: "Less is more - this principle has guided design philosophy for decades. But what does minimalism really mean in the digital age?",
//     mediaUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=300&fit=crop",
//     likes: 78,
//     comments: [
//       {
//         id: 4,
//         author: "Lisa Brown",
//         authorId: "user678",
//         content: "Beautiful examples in this post!",
//         timestamp: "2025-06-19T17:10:00Z"
//       },
//       {
//         id: 5,
//         author: "Tom Anderson",
//         authorId: "user890",
//         content: "Minimalism is not just about aesthetics, it's about functionality.",
//         timestamp: "2025-06-19T18:30:00Z"
//       }
//     ],
//     totalComments: 15
//   },
//   {
//     id: 4,
//     title: "A Deep Dive into Quantum Computing",
//     author: "Emily Carter",
//     authorId: "user456",
//     timestamp: "2025-06-18T14:00:00Z",
//     content: "Quantum computing promises to solve problems that are currently intractable for classical computers. This post explores the basic principles...",
//     mediaUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=300&fit=crop",
//     likes: 120,
//     comments: [],
//     totalComments: 5
//   },
//   {
//     id: 5,
//     title: "The Rise of Vertical Farming",
//     author: "Ben Green",
//     authorId: "user567",
//     timestamp: "2025-06-17T11:55:00Z",
//     content: "As urban populations grow, vertical farming presents a sustainable solution for food production. Let's explore the technology and its impact.",
//     mediaUrl: "https://images.unsplash.com/photo-1598439210625-5027bbe348f4?w=600&h=300&fit=crop",
//     likes: 65,
//     comments: [
//         {
//           id: 6,
//           author: "Laura White",
//           authorId: "user111",
//           content: "Fascinating! I hope to see more of this in my city.",
//           timestamp: "2025-06-17T12:30:00Z"
//         }
//     ],
//     totalComments: 22
//   },
//   {
//     id: 6,
//     title: "Mastering the Art of Public Speaking",
//     author: "Olivia Martinez",
//     authorId: "user678",
//     timestamp: "2025-06-16T09:10:00Z",
//     content: "Public speaking is a skill that can open many doors. Here are some tips to help you become a more confident and effective speaker.",
//     mediaUrl: null,
//     likes: 95,
//     comments: [
//         {
//           id: 7,
//           author: "Sam Taylor",
//           authorId: "user222",
//           content: "These tips are incredibly helpful. Thank you!",
//           timestamp: "2025-06-16T10:00:00Z"
//         }
//     ],
//     totalComments: 18
//   },
//   {
//     id: 7,
//     title: "The Psychology of Color in Marketing",
//     author: "Chris Lee",
//     authorId: "user789",
//     timestamp: "2025-06-15T18:00:00Z",
//     content: "Colors evoke emotions and can significantly influence consumer behavior. Understanding color psychology is key for effective marketing.",
//     mediaUrl: "https://images.unsplash.com/photo-1558470598-a5dda9d4a69d?w=600&h=300&fit=crop",
//     likes: 210,
//     comments: [],
//     totalComments: 35
//   },
//   {
//     id: 8,
//     title: "Beginner's Guide to Investing in Cryptocurrency",
//     author: "Mike Johnson",
//     authorId: "user789",
//     timestamp: "2025-06-14T12:30:00Z",
//     content: "Cryptocurrency can be a daunting world for beginners. This guide breaks down the basics to get you started on your investment journey.",
//     mediaUrl: "https://images.unsplash.com/photo-1640343292433-59d645e9f1a2?w=600&h=300&fit=crop",
//     likes: 150,
//     comments: [
//         {
//           id: 8,
//           author: "John Doe",
//           authorId: "user123",
//           content: "Finally, a guide that makes sense!",
//           timestamp: "2025-06-14T13:00:00Z"
//         },
//         {
//           id: 9,
//           author: "Jane Smith",
//           authorId: "user456",
//           content: "What are your thoughts on the volatility?",
//           timestamp: "2025-06-14T13:15:00Z"
//         }
//     ],
//     totalComments: 40
//   },
//   {
//     id: 9,
//     title: "The Importance of Mental Health in the Workplace",
//     author: "Dr. Evelyn Reed",
//     authorId: "user890",
//     timestamp: "2025-06-13T10:00:00Z",
//     content: "A positive work environment that prioritizes mental health leads to increased productivity and employee satisfaction. Let's discuss why.",
//     mediaUrl: null,
//     likes: 88,
//     comments: [],
//     totalComments: 10
//   },
//   {
//     id: 10,
//     title: "Exploring the Wonders of the Deep Sea",
//     author: "Dr. Aris Thorne",
//     authorId: "user901",
//     timestamp: "2025-06-12T20:15:00Z",
//     content: "The deep sea is the last unexplored frontier on Earth. Join us as we uncover the mysteries of the abyssal zone and its unique inhabitants.",
//     mediaUrl: "https://images.unsplash.com/photo-1568449559330-c3d3879a685f?w=600&h=300&fit=crop",
//     likes: 350,
//     comments: [
//         {
//           id: 10,
//           author: "MarineBioFan",
//           authorId: "user333",
//           content: "Absolutely breathtaking! The ocean is full of wonders.",
//           timestamp: "2025-06-12T21:00:00Z"
//         }
//     ],
//     totalComments: 55
//   },
//   {
//     id: 11,
//     title: "How to Bake the Perfect Sourdough Bread",
//     author: "Maria Garcia",
//     authorId: "user112",
//     timestamp: "2025-06-11T15:45:00Z",
//     content: "Baking sourdough can be a rewarding experience. This step-by-step guide will help you achieve that perfect crust and airy crumb.",
//     mediaUrl: "https://images.unsplash.com/photo-1598373154812-59d43743501a?w=600&h=300&fit=crop",
//     likes: 180,
//     comments: [],
//     totalComments: 25
//   },
//   {
//     id: 12,
//     title: "The Future of Remote Work: A Hybrid Model",
//     author: "Daniel Roberts",
//     authorId: "user223",
//     timestamp: "2025-06-10T11:20:00Z",
//     content: "The pandemic has changed the way we work forever. Is a hybrid model the future? Let's weigh the pros and cons.",
//     mediaUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=300&fit=crop",
//     likes: 130,
//     comments: [
//         {
//           id: 11,
//           author: "Sarah Wilson",
//           authorId: "user234",
//           content: "I think flexibility is key. Great article!",
//           timestamp: "2025-06-10T12:00:00Z"
//         }
//     ],
//     totalComments: 30
//   },
//   {
//     id: 13,
//     title: "An Introduction to Ethical Hacking",
//     author: "Alex Chen",
//     authorId: "user567",
//     timestamp: "2025-06-09T14:50:00Z",
//     content: "Ethical hacking is a crucial aspect of cybersecurity. Learn about the tools and techniques used to protect systems from malicious attacks.",
//     mediaUrl: null,
//     likes: 250,
//     comments: [],
//     totalComments: 45
//   },
//   {
//     id: 14,
//     title: "The Benefits of a Plant-Based Diet",
//     author: "Chloe Davis",
//     authorId: "user334",
//     timestamp: "2025-06-08T09:00:00Z",
//     content: "A plant-based diet can have numerous health and environmental benefits. Here's what the science says and how to get started.",
//     mediaUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=300&fit=crop",
//     likes: 195,
//     comments: [],
//     totalComments: 28
//   },
//   {
//     id: 15,
//     title: "Creating a Productive Home Office",
//     author: "Lisa Brown",
//     authorId: "user678",
//     timestamp: "2025-06-07T16:30:00Z",
//     content: "Your environment plays a huge role in your productivity. Learn how to design a home office that inspires focus and creativity.",
//     mediaUrl: "https://images.unsplash.com/photo-1591017403229-00289ef3a027?w=600&h=300&fit=crop",
//     likes: 110,
//     comments: [
//         {
//           id: 12,
//           author: "David Kim",
//           authorId: "user345",
//           content: "Love the minimalist setup ideas!",
//           timestamp: "2025-06-07T17:00:00Z"
//         }
//     ],
//     totalComments: 19
//   },
//   {
//     id: 16,
//     title: "The Science of Sleep: Why It's So Important",
//     author: "Dr. Ben Carter",
//     authorId: "user445",
//     timestamp: "2025-06-06T22:00:00Z",
//     content: "Sleep is not just a period of rest; it's a critical function for our physical and mental health. This article explores the science behind it.",
//     mediaUrl: "https://images.unsplash.com/photo-1495578942200-c5f5d2137b6a?w=600&h=300&fit=crop",
//     likes: 400,
//     comments: [],
//     totalComments: 60
//   },
//   {
//     id: 17,
//     title: "A Journey Through the Silk Road",
//     author: "Marco Polo Jr.",
//     authorId: "user556",
//     timestamp: "2025-06-05T13:10:00Z",
//     content: "The Silk Road was a network of trade routes that connected the East and West for centuries. Let's embark on a virtual journey to explore its history.",
//     mediaUrl: "https://images.unsplash.com/photo-1588412109212-9a0094e0237d?w=600&h=300&fit=crop",
//     likes: 280,
//     comments: [],
//     totalComments: 42
//   },
//   {
//     id: 18,
//     title: "The Art of Storytelling in Branding",
//     author: "Grace Lee",
//     authorId: "user667",
//     timestamp: "2025-06-04T10:00:00Z",
//     content: "Great brands don't just sell products; they tell stories. Discover how to weave compelling narratives into your brand identity.",
//     mediaUrl: null,
//     likes: 175,
//     comments: [
//         {
//           id: 13,
//           author: "Chris Lee",
//           authorId: "user789",
//           content: "Story is everything. Great read!",
//           timestamp: "2025-06-04T11:00:00Z"
//         }
//     ],
//     totalComments: 33
//   },
//   {
//     id: 19,
//     title: "Sustainable Travel: Exploring the World Responsibly",
//     author: "Aisha Khan",
//     authorId: "user778",
//     timestamp: "2025-06-03T19:00:00Z",
//     content: "Traveling can be both an enriching and a responsible activity. Here are some tips for being a more sustainable tourist.",
//     mediaUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=300&fit=crop",
//     likes: 220,
//     comments: [],
//     totalComments: 27
//   },
//   {
//     id: 20,
//     title: "The Impact of 5G on Our Daily Lives",
//     author: "Tom Anderson",
//     authorId: "user890",
//     timestamp: "2025-06-02T14:30:00Z",
//     content: "5G technology is set to revolutionize everything from how we communicate to how we interact with the world around us. What can we expect?",
//     mediaUrl: "https://images.unsplash.com/photo-1614036750348-185e3c05b8a6?w=600&h=300&fit=crop",
//     likes: 310,
//     comments: [
//         {
//           id: 14,
//           author: "Emily Carter",
//           authorId: "user456",
//           content: "The potential for IoT is mind-boggling.",
//           timestamp: "2025-06-02T15:00:00Z"
//         }
//     ],
//     totalComments: 48
//   }
// ];