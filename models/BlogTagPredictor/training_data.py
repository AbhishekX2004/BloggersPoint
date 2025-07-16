"""
Training data for blog tagging model
"""

training_data = [
    {
        'title': 'Machine Learning Fundamentals and Deep Learning Applications',
        'content': 'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data without being explicitly programmed. It includes supervised learning where models learn from labeled examples, unsupervised learning that finds patterns in unlabeled data, and reinforcement learning where agents learn through interaction with environments. Deep learning, a subset of machine learning, uses neural networks with multiple layers to process complex data. These networks can automatically learn hierarchical representations of data, making them particularly effective for tasks like image recognition, natural language processing, and speech recognition. Popular frameworks include TensorFlow, PyTorch, and Keras.',
        'tags': ['machine-learning', 'artificial-intelligence', 'algorithms', 'data-science', 'supervised-learning', 'deep-learning', 'neural-networks', 'tensorflow', 'pytorch']
    },
    {
        'title': 'Machine Learning Fundamentals',
        'content': 'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data without being explicitly programmed.',
        'tags': ['machine-learning', 'artificial-intelligence', 'algorithms', 'data-science']
    },
    {
        'title': 'Web Development with React',
        'content': 'React is a popular JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM.',
        'tags': ['web-development', 'react', 'javascript', 'frontend', 'ui']
    },
    {
        'title': 'Python Data Analysis',
        'content': 'Python offers powerful libraries like pandas, numpy, and matplotlib for data analysis and visualization.',
        'tags': ['python', 'data-analysis', 'pandas', 'numpy', 'data-science']
    },
    {
        'title': 'Deep Learning with TensorFlow',
        'content': 'TensorFlow is an open-source machine learning framework developed by Google for deep learning applications.',
        'tags': ['deep-learning', 'tensorflow', 'neural-networks', 'machine-learning', 'google']
    },
    {
        'title': 'Cloud Computing Basics',
        'content': 'Cloud computing provides on-demand access to computing resources over the internet, including servers, storage, and applications.',
        'tags': ['cloud-computing', 'aws', 'azure', 'infrastructure', 'scalability']
    },
    {
        "title": "Indian wildlife",
        "content": "India boasts a rich and diverse wildlife, encompassing a wide array of species across various habitats, from dense forests to deserts and coastal regions. Key habitats include the Himalayas, Western Ghats, Central Indian Highlands, and the Andaman and Nicobar Islands, each supporting unique ecosystems and wildlife.",
        "tags": [
        "Countries",
        "Wildlife"
        ]
    },
    {
        "title": "Save water",
        "content": "To conserve water, one can implement various simple yet effective strategies in daily life, both indoors and outdoors. This includes taking shorter showers, turning off the tap while brushing teeth or shaving, fixing leaks promptly, and using water-efficient appliances and fixtures. Additionally, reusing water, collecting rainwater, and practicing water-wise gardening can significantly contribute to water conservation.",
        "tags": [
        "Environment And Sustainability"
        ]
    },
    {
        "title": "Health And Fitness",
        "content": "Health and fitness are interconnected concepts, with health encompassing overall well-being (physical, mental, and social) and fitness referring to the ability to perform physical activities efficiently. Achieving good health involves a holistic approach, including regular exercise, proper nutrition, adequate sleep, and stress management.",
        "tags": [
        "Fitness"
        ]
    },
    {
        "title": "Docker",
        "content": "Docker is a software platform that allows you to build, test, and deploy applications quickly. Docker packages software into standardized units called containers that have everything the software needs to run including libraries, system tools, code, and runtime.",
        "tags": [
        "Software Architecture",
        "Education And Learning",
        "Backend",
        "Web Development"
        ]
    },
    {
        "title": "Tensorflow",
        "content": "TensorFlow is an open-source platform for machine learning and artificial intelligence, developed by Google. It's primarily used for building and training neural networks and is a popular choice for deep learning. TensorFlow provides a flexible ecosystem of tools, libraries, and community resources to help developers create and deploy machine learning models across various platforms. \nHere's a more detailed breakdown:\nKey Features and Capabilities:\nOpen Source:\nTensorFlow is free to use and modify, encouraging community contributions and collaboration. \nFlexible Ecosystem:\nIt offers a wide range of tools, libraries, and community resources to support different stages of the machine learning workflow. \nMultiple Languages:\nWhile Python is the most common language for TensorFlow, it also supports C++ and JavaScript. \nWide Range of Applications:\nTensorFlow is used in diverse fields like natural language processing, computer vision, time series forecasting, and reinforcement learning. \nDeployment Options:\nModels can be deployed on servers, cloud platforms, mobile devices, browsers, and JavaScript environments. \nProduction Pipelines:\nTFX (TensorFlow Extended) is an end-to-end platform for deploying machine learning models in production. \nFederated Learning:\nTensorFlow Federated (TFF) allows developers to build and train machine learning models on decentralized data, such as on-device data. \nEdge Computing:\nTensorFlow Lite enables running machine learning models on resource-constrained devices like mobile phones and embedded systems. \nPopular Use Cases:\nImage and Video Processing: Analyzing images and videos for object detection, facial recognition, and more. \nTime Series Analysis: Predicting future values based on historical data, such as stock prices or sales trends. \nNatural Language Processing: Understanding and generating human language, like in chatbots and translation services. \nRecommendation Systems: Suggesting products or content based on user preferences. \nFraud Detection: Identifying fraudulent transactions or activities. \nComparison with other frameworks:\nPyTorch:\nAnother popular deep learning framework, known for its dynamic computation graphs and strong Python integration. \nKeras:\nA high-level API that runs on top of TensorFlow (and other frameworks), simplifying the development of neural networks. \nTensorFlow is a powerful and versatile tool for machine learning and deep learning, with a wide range of applications and a vibrant community.",
        "tags": [
        "Education And Learning",
        "Artificial Intelligence",
        "Programming Languages"
        ]
    },
    {
        "title": "Indian culture",
        "content": "Indian culture is very vast and diverse, with a rich collection of art, literature, dance, music, religion, customs and traditions . It is one of the oldest cultures in the world and has a mix of different religions, languages ​​and lifestyles.   \nSome main features of Indian culture:\nDiversity:\nIndia is called the \"Land of Diversity\", and its culture is also full of diversity.   \nArt and Literature:\nIndia has a rich history of arts and literature, including classical dance, music, drama, folk traditions, and painting.   \nReligion:\nIndia is the birthplace of several major religions, such as Hinduism, Buddhism, Jainism, and Sikhism, and religion is an important part of Indian life.   \nFamily:\nIn Indian culture, joint family and respect for elders are considered important.",
        "tags": [
        "Countries",
        "Culture"
        ]
    },
    {
        "title": "Science and Technology",
        "content": "Science and technology are closely intertwined fields that drive innovation and progress. Science focuses on understanding the natural world through observation and experimentation, while technology applies this knowledge to create practical solutions and tools. India has a strong foundation in both, with a dedicated Department of Science and Technology and various initiatives to foster scientific research and technological development.",
        "tags": [
        "Education And Learning",
        "Science"
        ]
    },
    {
        "title": "Indian History",
        "content": "Indian history is vast and ancient, stretching back to the Indus Valley Civilization around 3300-1700 BCE. It encompasses a rich tapestry of empires, religions, and cultural developments, including the Vedic period, the Mauryan and Gupta empires, the Mughal era, and the British colonial period, culminating in India's independence in 1947",
        "tags": [
        "Countries",
        "History"
        ]
    },
    {
        "title": "wild life",
        "content": "Saving nature involves a variety of actions focused on preserving biodiversity, protecting ecosystems, and mitigating human impact on the environment. This includes reducing waste, recycling, conserving water and energy, and supporting policies that promote sustainability. Individuals can also make a difference by choosing sustainable products, planting trees, and educating themselves and others about the importance of conservation.",
        "tags": [
        "Environment And Sustainability"
        ]
    },
    {
        "title": "Indian mango",
        "content": "Indian mangoes are known for their diverse varieties, rich flavors, and nutritional value, with states like Maharashtra, Gujarat, Andhra Pradesh, and Uttar Pradesh being major producers. Some popular varieties include Alphonso, Kesar, Banganapalli, Dasheri, and Langra, each with unique characteristics and regional origins. \nPopular Indian Mango Varieties:\nAlphonso:\nOften called the \"King of Mangoes,\" Alphonso is renowned for its rich aroma, creamy texture, and sweetness. It's primarily grown in the Konkan region of Maharashtra, as well as in parts of Gujarat and Karnataka. \nKesar:\nHailing from Gujarat, Kesar mangoes are known for their bright orange pulp and sweet, slightly tangy flavor. They are often referred to as the \"Queen of Mangoes\". \nBanganapalli:\nA late-season variety, Banganapalli mangoes are popular in Andhra Pradesh and Tamil Nadu. They are known for their large size, smooth texture, and mild sweetness. \nDasheri:\nBelieved to have originated in Uttar Pradesh, Dasheri mangoes are sweet, fragrant, and fiberless, making them a favorite for fresh eating and desserts. \nLangra:\nA North Indian variety, Langra mangoes are known for their tangy-sweet taste and fiberless flesh, even when ripe.",
        "tags": [
        "Countries",
        "Fruits"
        ]
    },
    {
        "title": "Indian cuisine",
        "content": "Indian cuisine is incredibly diverse, reflecting the country's varied geography, climate, and cultural traditions. It's deeply intertwined with religious and cultural practices, with different regions showcasing unique culinary identities. Indian food is celebrated for its use of spices, herbs, and diverse cooking techniques.",
        "tags": [
        "Food And Cooking",
        "Countries",
        "Cuisine"
        ]
    },
    {
        "title": "India on moon",
        "content": "India achieved a significant milestone in space exploration by successfully landing its Chandrayaan-3 mission near the Moon's south pole on August 23, 2023. This landing marked India as the first nation to achieve a soft landing in the lunar south polar region, a feat not previously accomplished by the US, Russia, or China. The mission, led by the Indian Space Research Organisation (ISRO), included the Vikram lander and the Pragyan rover.",
        "tags": [
        "Planets and Stars",
        "Countries"
        ]
    }
    # Add more training examples here...
    # Each record should have:
    # - title: The blog post title (string)
    # - content: The blog post content (string) 
    # - tags: List of relevant tags (list of strings)
]