export const CONCEPT_EXTRACTION_PROMPT = `
Analyze the following educational text chunk.
Extract all key learning concepts, technologies, methodologies, mathematical formulas, or scientific principles mentioned in the text.

Rules:
1. Ignore generic words or common knowledge (e.g., "computer", "book", "data").
2. Focus on technical, scientific, or educational concept terms.
3. Provide a concise, clear description of the concept based on the text.
4. Classify each concept into a logical category (e.g., "Mathematics", "Machine Learning", "Software Engineering", "Physics").
5. Assign a difficulty rating from 1 to 10 (1 = trivial, 10 = advanced graduate level).
6. Assign an importance rating from 1 to 10 (1 = optional/peripheral, 10 = absolute core prerequisite).
7. Return ONLY a valid JSON array of objects. Do not include markdown code blocks, do not write "json", do not add explanations.

JSON Schema:
[
  {
    "name": "Concept Name",
    "description": "Short explanation of the concept based on the context",
    "category": "Broad category name",
    "difficulty": 3,
    "importance": 8
  }
]

Text to analyze:
"{text}"
`;
