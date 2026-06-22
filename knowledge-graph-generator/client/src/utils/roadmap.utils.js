// Dynamic client-side markdown/study-guide parser
export const parseStudyGuide = (guideText, pathSteps) => {
  if (!guideText || !pathSteps || pathSteps.length === 0) return {};
  
  const sections = {};
  
  const conceptPositions = pathSteps.map((step, idx) => {
    const escapedConcept = step.concept.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const patterns = [
      new RegExp(`Step\\s*${idx + 1}\\s*:\\s*\\*\\*?${escapedConcept}\\*\\*?`, 'i'),
      new RegExp(`Step\\s*${idx + 1}\\s*:\\s*${escapedConcept}`, 'i'),
      new RegExp(`\\*\\*?Step\\s*${idx + 1}\\s*\\*\\*?\\s*:\\s*${escapedConcept}`, 'i'),
      new RegExp(`####\\s*\\*\\*?Step\\s*${idx + 1}\\s*:\\s*${escapedConcept}`, 'i'),
      new RegExp(`####\\s*Step\\s*${idx + 1}\\s*:\\s*${escapedConcept}`, 'i'),
      new RegExp(`${escapedConcept}`, 'i')
    ];

    let foundIndex = -1;
    let matchedPattern = null;
    
    for (const pattern of patterns) {
      const match = guideText.match(pattern);
      if (match) {
        foundIndex = match.index;
        matchedPattern = match[0];
        break;
      }
    }
    
    return { concept: step.concept, category: step.category, index: foundIndex, pattern: matchedPattern };
  });

  const sortedPositions = [...conceptPositions].sort((a, b) => a.index - b.index);

  const totalSteps = pathSteps.length;

  const getGenericFallbacks = (concept, category, idx) => {
    const cat = (category || '').toLowerCase();
    const c = (concept || '').toLowerCase();
    
    let stage = 'MASTERY';
    if (idx < totalSteps * 0.25) stage = 'FOUNDATION';
    else if (idx < totalSteps * 0.5) stage = 'INTERMEDIATE';
    else if (idx < totalSteps * 0.75) stage = 'ADVANCED';

    let commonMistakes = ["Skipping the fundamentals before moving on.", "Copy-pasting code without understanding.", "Not practicing with hands-on examples."];
    let miniProject = `Create a small prototype demonstrating ${concept}.`;
    let expectedOutcome = `Able to explain and implement basic ${concept} concepts.`;

    // Specific mini-projects mapped to stages
    if (stage === 'FOUNDATION') {
      miniProject = "Build a portfolio page, calculator, or basic landing page.";
    } else if (stage === 'INTERMEDIATE') {
      miniProject = "Build a Netflix clone, Blog CMS, or a Todo API.";
    } else if (stage === 'ADVANCED') {
      miniProject = "Architect a MERN dashboard, dependency visualizer, or custom compiler parser.";
    } else {
      miniProject = "Deploy a production-ready SaaS, curriculum engine, or recommendation system.";
    }

    if (cat.includes('web') || cat.includes('frontend') || c.includes('html') || c.includes('css')) {
      commonMistakes = ["Using inline CSS everywhere.", "Ignoring semantic tags.", "Forgetting mobile responsiveness.", "Div soup (using div for everything)."];
      expectedOutcome = `Can confidently build and style static web interfaces using ${concept}.`;
    } else if (c.includes('react') || c.includes('vue') || c.includes('angular')) {
      commonMistakes = ["Mutating state directly.", "Overcomplicating component hierarchies.", "Ignoring useEffect dependencies."];
      expectedOutcome = `Can build interactive single-page applications (SPAs) managing state.`;
    } else if (cat.includes('backend') || cat.includes('api') || c.includes('node') || c.includes('express')) {
      commonMistakes = ["Blocking the event loop.", "Not validating user inputs.", "Ignoring security headers."];
      expectedOutcome = `Can architect backend services and handle API requests securely.`;
    } else if (cat.includes('data structure') || cat.includes('algorithm') || c.includes('tree') || c.includes('graph')) {
      commonMistakes = ["Not handling edge cases (null, empty arrays).", "Ignoring asymptotic time/space complexity.", "Off-by-one errors in loops."];
      expectedOutcome = `Can solve Medium-level Leetcode problems involving ${concept}.`;
    } else if (cat.includes('machine learning') || cat.includes('ai') || c.includes('neural')) {
      commonMistakes = ["Overfitting the training data.", "Not normalizing inputs.", "Data leakage in train/test splits."];
      expectedOutcome = `Can prepare data and train classification/regression models.`;
    }

    // Bloom's taxonomy objectives
    let genericObjectives = [
      `Understand the foundational principles of ${concept}`,
      `Explain the core mechanics and trade-offs of ${concept}`,
      `Implement basic ${concept} operations in code`,
      `Analyze common edge cases and performance characteristics`
    ];

    if (stage === 'ADVANCED' || stage === 'MASTERY') {
      genericObjectives = [
        `Analyze performance bottlenecks in ${concept} implementations`,
        `Build robust, scalable architectures leveraging ${concept}`,
        `Evaluate alternative approaches and compare with ${concept}`,
        `Optimize the execution speed and memory usage of ${concept}`
      ];
    }

    return { commonMistakes, miniProject, expectedOutcome, genericObjectives };
  };

  for (let i = 0; i < sortedPositions.length; i++) {
    const current = sortedPositions[i];
    const next = sortedPositions[i + 1];
    const idxInPath = pathSteps.findIndex(s => s.concept === current.concept);
    const fallbacks = getGenericFallbacks(current.concept, current.category, idxInPath !== -1 ? idxInPath : i);
    
    if (current.index === -1) {
      sections[current.concept] = {
        prerequisites: "Positioned based on topological prerequisites to optimize learning.",
        objectives: [
          `Master the core principles of ${current.concept}.`,
          `Understand practical implementations and edge cases.`
        ],
        commonMistakes: fallbacks.commonMistakes,
        miniProject: fallbacks.miniProject,
        expectedOutcome: fallbacks.expectedOutcome
      };
      continue;
    }
    
    const startIdx = current.index + (current.pattern ? current.pattern.length : 0);
    const endIdx = next && next.index !== -1 ? next.index : guideText.length;
    const sectionText = guideText.substring(startIdx, endIdx).trim();
    
    let prerequisites = '';
    const objectives = [];
    let commonMistakesStr = '';
    let miniProjectStr = '';
    let expectedOutcomeStr = '';
    
    const lines = sectionText.split('\n');
    let currentBlock = 'prerequisites';
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      const lowerLine = cleanLine.toLowerCase();
      
      if (lowerLine.includes('prerequisite') || lowerLine.includes('context:')) {
        prerequisites = cleanLine.replace(/^[*-]\s*(\*\*.*?\*\*:)?/i, '').trim();
        currentBlock = 'prerequisites';
      } else if (lowerLine.includes('mistakes') || lowerLine.includes('pitfall')) {
        commonMistakesStr = cleanLine.replace(/^[*-]\s*(\*\*.*?\*\*:)?/i, '').trim();
        currentBlock = 'mistakes';
      } else if (lowerLine.includes('project') || lowerLine.includes('exercise')) {
        miniProjectStr = cleanLine.replace(/^[*-]\s*(\*\*.*?\*\*:)?/i, '').trim();
        currentBlock = 'project';
      } else if (lowerLine.includes('outcome') || lowerLine.includes('student can')) {
        expectedOutcomeStr = cleanLine.replace(/^[*-]\s*(\*\*.*?\*\*:)?/i, '').trim();
        currentBlock = 'outcome';
      } else if (lowerLine.includes('objective') || lowerLine.includes('focus')) {
        const objText = cleanLine.replace(/^[*-]\s*(\*\*.*?\*\*:)?/i, '').trim();
        if (objText && !objText.match(/difficulty|category|hours|warning/i)) objectives.push(objText);
        currentBlock = 'objectives';
      } else {
        // Only push actionable items to objectives
        if (cleanLine.startsWith('-') || cleanLine.startsWith('*') || cleanLine.match(/^\d+\./)) {
          const content = cleanLine.replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, '').trim();
          if (!content.match(/difficulty|category|hours|warning|mock mode/i)) {
             if (currentBlock === 'mistakes') commonMistakesStr += '|' + content;
             else objectives.push(content);
          }
        } else {
          if (currentBlock === 'prerequisites') prerequisites += ' ' + cleanLine;
          else if (currentBlock === 'mistakes') commonMistakesStr += ' ' + cleanLine;
          else if (currentBlock === 'project') miniProjectStr += ' ' + cleanLine;
          else if (currentBlock === 'outcome') expectedOutcomeStr += ' ' + cleanLine;
        }
      }
    });
    
    if (objectives.length < 3) {
      fallbacks.genericObjectives.forEach(obj => {
         if (!objectives.includes(obj)) objectives.push(obj);
      });
      // Cap at 5 objectives max
      if (objectives.length > 5) objectives.splice(5);
    }
    
    if (!prerequisites) prerequisites = `Prerequisite for downstream concepts.`;
    
    let parsedMistakes = commonMistakesStr.split('|').map(s => s.trim()).filter(Boolean);
    if (parsedMistakes.length === 0) parsedMistakes = fallbacks.commonMistakes;
    
    sections[current.concept] = {
      prerequisites: prerequisites.replace(/^[*-]\s*/, '').trim(),
      objectives: objectives.filter(o => o.trim() !== ''),
      commonMistakes: parsedMistakes,
      miniProject: miniProjectStr.replace(/^[*-]\s*/, '').trim() || fallbacks.miniProject,
      expectedOutcome: expectedOutcomeStr.replace(/^[*-]\s*/, '').trim() || fallbacks.expectedOutcome
    };
  }
  
  return sections;
};

// Generates dynamic practice quizzes
export const getQuizForConcept = (conceptName) => {
  const normalized = conceptName.toLowerCase();
  
  if (normalized.includes('binary search tree') || normalized.includes('bst')) {
    return [
      {
        question: "What is the average-case time complexity of searching for a value in a balanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIdx: 1,
        explanation: "In a balanced BST, each comparison allows you to discard half of the remaining tree, resulting in a logarithmic O(log n) search complexity."
      },
      {
        question: "Which tree traversal algorithm visits nodes in a Binary Search Tree in sorted ascending order?",
        options: ["Pre-order Traversal", "Post-order Traversal", "In-order Traversal", "Level-order Traversal"],
        correctIdx: 2,
        explanation: "An in-order traversal (Left, Root, Right) of a BST visits nodes in strictly increasing sorted order."
      }
    ];
  }
  
  if (normalized.includes('machine learning') || normalized.includes('ml')) {
    return [
      {
        question: "What is overfitting in machine learning?",
        options: [
          "When the model performs well on the training data but fails to generalize to unseen test data",
          "When the model is too simple and performs poorly on both training and test data",
          "When the model requires too much memory and processor power during training",
          "When training fails to converge on a global minimum"
        ],
        correctIdx: 0,
        explanation: "Overfitting occurs when a model learns the noise and details of the training data too well, resulting in poor generalization on new data."
      },
      {
        question: "Which of the following is a classic example of a supervised learning problem?",
        options: [
          "Grouping online shopping customers into clusters based on purchase history",
          "Predicting house prices based on size, location, and number of bedrooms",
          "Reducing the dimensionality of a high-dimensional image dataset using PCA",
          "Finding anomalous transactions in a credit card database without prior labels"
        ],
        correctIdx: 1,
        explanation: "Supervised learning utilizes labeled training data. Predicting house prices is a regression task using known historical listings and actual prices."
      }
    ];
  }

  if (normalized.includes('neural network') || normalized.includes('deep learning') || normalized.includes('cnn') || normalized.includes('rnn')) {
    return [
      {
        question: "What is the primary purpose of an activation function in a neural network?",
        options: [
          "To normalize input data features to have zero mean and unit variance",
          "To introduce non-linearity into the network, enabling it to learn complex patterns",
          "To speed up database connections during batch gradient updates",
          "To compute the loss derivative with respect to network weights"
        ],
        correctIdx: 1,
        explanation: "Without non-linear activation functions, any neural network would behave like a simple linear regression model, regardless of how many layers it has."
      },
      {
        question: "In neural network optimization, what does backpropagation accomplish?",
        options: [
          "It updates the weight matrices directly using random Gaussian values",
          "It propagates input features forward to calculate the final output error",
          "It calculates the gradient of the loss function with respect to each weight using the chain rule",
          "It stores trained models into backup databases for version control"
        ],
        correctIdx: 2,
        explanation: "Backpropagation passes the error backward through the network layers, computing the gradients of the loss function to guide optimizer weight updates."
      }
    ];
  }

  if (normalized.includes('linear regression') || normalized.includes('regression')) {
    return [
      {
        question: "In linear regression, what metric is commonly minimized by Ordinary Least Squares (OLS)?",
        options: [
          "Sum of absolute differences (L1 loss)",
          "Mean absolute percentage error (MAPE)",
          "Sum of squared residuals/errors (L2 loss)",
          "Accuracy percentage of categorical classification"
        ],
        correctIdx: 2,
        explanation: "Ordinary Least Squares minimizes the sum of squared differences (residuals) between the observed values and the values predicted by the linear model."
      }
    ];
  }

  if (normalized.includes('transformer') || normalized.includes('attention') || normalized.includes('llm') || normalized.includes('bert') || normalized.includes('gpt')) {
    return [
      {
        question: "What mechanism is central to the Transformer architecture, enabling it to process sequence tokens in parallel?",
        options: [
          "Recurrent gate updates (like LSTM or GRU cells)",
          "Self-Attention mechanism",
          "Max pooling layers over temporal filters",
          "Recursive depth-first search on syntactical parsing trees"
        ],
        correctIdx: 1,
        explanation: "Self-attention computes dynamic weights representing how much each token relates to every other token in the sequence, bypassing sequential recurrences."
      }
    ];
  }

  return [
    {
      question: `Which statement best describes the primary engineering or analytical goal of studying ${conceptName}?`,
      options: [
        `To understand its core theoretical foundations, implementation patterns, and trade-offs`,
        `To replace all existing database systems with custom files`,
        `To increase the application package size on mobile app stores`,
        `To bypass software licensing terms of commercial compilers`
      ],
      correctIdx: 0,
      explanation: `Studying ${conceptName} is intended to build computational understanding, enabling you to design efficient, scalable solutions and optimize system behavior.`
    },
    {
      question: `When validating or debugging systems using ${conceptName}, which approach is considered a best practice?`,
      options: [
        `Deploying updates straight to production without logging or unit tests`,
        `Analyzing asymptotic complexity (Time/Space) and testing with representative edge inputs`,
        `Rewriting the code continuously until it runs without warnings`,
        `Deleting the concept from the curriculum roadmap`
      ],
      correctIdx: 1,
      explanation: `Testing under representative constraints, corner cases, and calculating complexity boundaries ensures the reliability and efficiency of code implementing ${conceptName}.`
    }
  ];
};

export const getCodeBoilerplate = (conceptName) => {
  const name = conceptName.replace(/[^a-zA-Z0-9]/g, '');
  return `/**
 * Challenge: Implementation of ${conceptName}
 * Write a function or script detailing the core logic.
 */

function solve${name}(input) {
  // TODO: Implement your solution here
  console.log("Running solver for ${conceptName}...");
  
  return true;
}

// Execute test
const result = solve${name}("test_input");
console.log("Result:", result);
`;
};
