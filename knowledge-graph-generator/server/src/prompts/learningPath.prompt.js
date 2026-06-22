export const LEARNING_PATH_PROMPT = `
You are an expert curriculum designer.
Below is an ordered sequence of learning concepts representing a pathway from a student's starting point to their target goal, calculated from a knowledge graph.

Target Concept: {targetConcept}
Topological Concept Order:
{conceptSequence}

Your job is to generate a structured study guide for this roadmap.
For each concept in the sequence:
1. Explain why it is positioned in this order (e.g., how it serves as a prerequisite or connects to the next step).
2. List the key objectives the student must master.
3. Suggest a brief learning exercise or topic focus.

Be encouraging, concise, and highly educational.

Study Guide:
`;
