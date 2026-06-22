export const RELATIONSHIP_EXTRACTION_PROMPT = `
Analyze the list of concepts and the supporting text chunk provided below.
Identify meaningful educational or logical relationships between these concepts based ONLY on the text.

Supported Relationship Types:
- "prerequisite": Concept A must be learned before Concept B (e.g. "Linear Algebra" -> "PCA").
- "depends_on": Concept B requires Concept A, but is not strictly a classic prerequisite.
- "part_of": Concept A is a subconcept or structural part of Concept B.
- "related_to": Concept A and Concept B share a strong topical connection.
- "foundation_of": Concept A provides the foundational base for Concept B.
- "used_in": Concept A is applied inside the implementation or execution of Concept B.
- "extends": Concept B is an extension or specialization of Concept A.
- "implements": Concept B implements the theoretical framework of Concept A.

Rules:
1. Do not hallucinate or make assumptions. Only map relationships explicitly supported by the text.
2. Provide a confidence score between 0.0 and 1.0 based on how explicitly the relationship is stated in the text.
3. Return ONLY a valid JSON array of objects. Do not include markdown wraps, do not write "json", do not add explanations.

JSON Schema:
[
  {
    "source": "Concept Name A",
    "target": "Concept Name B",
    "relation": "prerequisite",
    "confidence": 0.85
  }
]

Concepts List:
{concepts}

Supporting Text Chunk:
"{text}"
`;
