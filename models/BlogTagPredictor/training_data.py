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
    }
    # Add more training examples here...
    # Each record should have:
    # - title: The blog post title (string)
    # - content: The blog post content (string) 
    # - tags: List of relevant tags (list of strings)
]