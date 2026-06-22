export const getDemoCurriculum = (topic) => {
  const normalized = topic ? String(topic).toLowerCase() : '';

  let title = "Web Development";
  let path = [
    { concept: "HTML5 & Semantic Web", category: "Frontend", estimatedTime: "5 hours" },
    { concept: "CSS3 & Flexbox/Grid", category: "Frontend", estimatedTime: "10 hours" },
    { concept: "JavaScript ES6+", category: "Frontend", estimatedTime: "20 hours" },
    { concept: "DOM Manipulation & Events", category: "Frontend", estimatedTime: "15 hours" }
  ];

  if (normalized.includes('react')) {
    title = "React Ecosystem";
    path = [
      { concept: "JSX & Components", category: "Frontend", estimatedTime: "10 hours" },
      { concept: "State & Props Management", category: "Frontend", estimatedTime: "15 hours" },
      { concept: "React Hooks Deep Dive", category: "Frontend", estimatedTime: "20 hours" },
      { concept: "Routing & Context API", category: "Frontend", estimatedTime: "15 hours" }
    ];
  } else if (normalized.includes('machine learning')) {
    title = "Machine Learning";
    path = [
      { concept: "Python for Data Science", category: "Data", estimatedTime: "15 hours" },
      { concept: "Data Preprocessing & EDA", category: "Data", estimatedTime: "20 hours" },
      { concept: "Supervised Learning Models", category: "ML", estimatedTime: "30 hours" },
      { concept: "Unsupervised & Clustering", category: "ML", estimatedTime: "25 hours" }
    ];
  } else if (normalized.includes('deep learning')) {
    title = "Deep Learning";
    path = [
      { concept: "Neural Network Foundations", category: "AI", estimatedTime: "20 hours" },
      { concept: "Convolutional Neural Networks", category: "AI", estimatedTime: "25 hours" },
      { concept: "Recurrent Neural Networks", category: "AI", estimatedTime: "25 hours" },
      { concept: "Transformers & LLMs", category: "AI", estimatedTime: "30 hours" }
    ];
  } else if (normalized.includes('data structure')) {
    title = "Data Structures & Algorithms";
    path = [
      { concept: "Arrays & Strings", category: "CS Core", estimatedTime: "10 hours" },
      { concept: "Linked Lists & Trees", category: "CS Core", estimatedTime: "20 hours" },
      { concept: "Graphs & Searching", category: "CS Core", estimatedTime: "25 hours" },
      { concept: "Dynamic Programming", category: "CS Core", estimatedTime: "30 hours" }
    ];
  }

  let studyGuide = `# ${title} Curriculum\n\n`;
  path.forEach((step, index) => {
    studyGuide += `Step ${index + 1}: **${step.concept}**\n`;
    studyGuide += `- Objective: Understand the core mechanics and trade-offs of ${step.concept}.\n`;
    studyGuide += `- Objective: Implement basic ${step.concept} operations in code.\n`;
    studyGuide += `- Common mistakes: Skipping the fundamentals before moving on.\n`;
    studyGuide += `- Mini Project: Create a small prototype demonstrating ${step.concept}.\n`;
    studyGuide += `- Expected Outcome: Able to explain and implement basic ${step.concept} concepts.\n\n`;
  });

  return {
    _id: `demo-${Date.now()}`,
    targetConcept: title,
    path,
    studyGuide,
    progress: { completedSteps: [] }
  };
};
