# Intelligent Knowledge Graph Generator - Comprehensive Documentation

## 1. Introduction & Overview
The **Intelligent Knowledge Graph Generator** is an advanced full-stack application designed to automatically parse educational documents (like PDFs), extract core concepts and relationships using state-of-the-art Large Language Models (LLMs), and visualize them as interactive, analyzable Knowledge Graphs. 

The primary goal of the project is to provide learners with an intelligent study companion that automatically builds **Learning Roadmaps**, answers questions using **Graph-Aware Retrieval-Augmented Generation (RAG)**, and performs deep **Graph Analytics** to find learning bottlenecks, critical paths, and prerequisites.

This document serves as an exhaustive guide to every component, algorithm, service, and technology used in the application.

---

## 2. Technology Stack

### 2.1 Backend (Server-Side)
- **Node.js & Express.js**: Forms the robust, asynchronous core of the RESTful API. Express is used for routing, middleware management, and request handling.
- **MongoDB & Mongoose**: Used as the primary NoSQL data store. Mongoose provides object data modeling (ODM), schema validations, and relationship management. MongoDB also handles Vector storage for semantic search.
- **Google Gemini API (`@google/generative-ai`)**: The core AI engine (Gemini 1.5 Flash) used for Concept Extraction, Relationship Extraction, and Graph-Aware RAG Chat.
- **BullMQ & Redis**: Utilized for handling heavy, asynchronous background tasks (like processing large PDFs and generating embeddings) in a robust queue system.
- **Multer**: Middleware for handling `multipart/form-data`, primarily used for PDF document uploads.
- **PDF-Parse**: Used to extract raw text content from uploaded PDF documents.
- **Bcryptjs & JsonWebToken (JWT)**: Handles secure user authentication, password hashing, and session management.
- **Winston & Morgan**: Used for comprehensive logging of application states, errors, and HTTP request tracking.

### 2.2 Frontend (Client-Side)
- **React.js (v18)**: The core UI library, utilizing hooks and functional components for building a reactive interface.
- **Vite**: A lightning-fast modern build tool and development server.
- **Tailwind CSS & Autoprefixer**: Utility-first CSS framework for rapid, highly customizable, and responsive styling.
- **React Router DOM**: Handles client-side routing and protected routes (e.g., `/dashboard`, `/graph/:id`).
- **React Flow (`@xyflow/react`)**: A powerful library used to render the interactive, node-based Knowledge Graph interface.
- **Framer Motion**: Used for declarative, fluid UI animations.
- **Axios**: Promise-based HTTP client for making API calls to the backend.
- **Dagre**: A directed graph layout engine used alongside React Flow to automatically position nodes in an aesthetically pleasing, hierarchical tree structure.
- **Lucide React**: Provides beautiful, consistent icons across the UI.

---

## 3. Architecture Deep Dive

The application follows a decoupled client-server architecture:

1. **Client Layer**: A Vite-powered React Single Page Application (SPA). It manages user state (`AuthContext`), handles file uploads via dropzones, and renders dynamic learning paths and interactive graphs.
2. **API Layer**: An Express.js backend that handles routing, authentication middleware, rate-limiting (`express-rate-limit`), and security (`helmet`).
3. **Service Layer**: The brain of the backend. It isolates complex business logic like interacting with Gemini, chunking PDFs, parsing relationships, and performing vector searches.
4. **Data Layer**: MongoDB stores User profiles, Documents, raw Text Chunks, Concepts, Relationships, Chat History, and Learning Roadmaps.
5. **Worker/Queue Layer**: Heavy NLP processing is pushed to Redis-backed BullMQ queues so the main Express thread remains non-blocking.

---

## 4. Core Algorithms (Deep Analysis)

The project implements a suite of highly optimized computer science graph algorithms located in `server/src/algorithms/graph.algorithms.production.js`.

### 4.1 Graph Statistics Engine
Calculates standard mathematical properties of the generated graph:
- **Node/Edge Counts**: Total vertices and edges.
- **Average/Min/Max Degree**: The number of connections per node.
- **Density**: Calculated as `E / (V * (V - 1))`. It determines how interconnected the concepts are.
- **Isolated Nodes**: Detects concepts that have no relationships, which might indicate extraction errors or standalone topics.

### 4.2 Breadth-First Search (BFS) Optimization
- **Implementation**: Utilizes a highly optimized **O(1) Queue Pointer Technique**. Instead of using `.shift()` on an array (which is O(N) in JavaScript), the algorithm uses a `front` pointer integer that increments.
- **Purpose**: Explores concepts level-by-level, finding the shortest unweighted path and understanding immediate neighbors.

### 4.3 Depth-First Search (DFS)
- **Implementation**: Uses an **Iterative Stack** approach instead of standard recursion. This is a production-grade optimization that prevents the "Maximum Call Stack Size Exceeded" error on extremely large concept graphs.
- **Purpose**: Deeply explores learning paths to their final conclusions (leaf nodes). Neighbors are pushed in reverse to maintain left-to-right topological traversal.

### 4.4 Dijkstra's Algorithm & Min Priority Queue
- **Implementation**: Custom implementation of a **Min Binary Heap** (Priority Queue). It guarantees O(log N) insertions and extractions, drastically outperforming standard array sorting (O(N log N)).
- **Purpose**: Finds the optimal, "cheapest" learning path between two concepts. The algorithm dynamically calculates "Cost" based on a combination of the target node's `difficulty` and `importance` (Cost = max(1, difficulty + (10 - importance))).

### 4.5 Topological Sort (Kahn's Algorithm)
- **Implementation**: Kahn's Algorithm based on In-Degrees. Nodes with 0 incoming edges are processed first, decrementing neighbor in-degrees iteratively.
- **Purpose**: Crucial for generating linear **Learning Roadmaps**. It ensures that a user learns all prerequisite concepts before advancing to dependent concepts. It also features fallback logic if a cycle is detected (returning a partial stable sort).

### 4.6 Cycle Detection & Strongly Connected Components (SCC)
- **Cycle Detection**: Uses a 3-state DFS map (`unvisited`, `visiting`, `visited`) to pinpoint circular prerequisite chains (e.g., A needs B, B needs C, C needs A), which represent paradoxes in learning.
- **Tarjan's Algorithm for SCC**: Uses low-link values and a stack to find tightly connected sub-graphs. Identifies "isolated tight learning clusters" where a group of concepts are highly interdependent.
- **Disjoint Set Union (DSU)**: An alternative mechanism using `find` and `union` operations with rank optimizations to find weakly connected components.

### 4.7 Learning Analytics Engine
- **PageRank Algorithm**: Originally built by Google for web pages, repurposed here to calculate **Concept Importance**. Concepts that are pointed to by many other important concepts receive a higher rank. Iteratively updates ranks using a `dampingFactor` (0.85).
- **Bottleneck Detection**: Identifies concepts with the highest out-degree (concepts that act as prerequisites for a massive number of other topics). Mastering these unlocks the most future learning.
- **Difficulty Propagation**: Dynamically adjusts a concept's base difficulty by factoring in its Dependency Depth (In-Degree) and PageRank Centrality. This ensures concepts deep in the tree reflect their true learning curve.

---

## 5. Backend Components

### 5.1 Models (Mongoose Schemas)
- **Concept**: Stores `name`, `description`, `category`, `difficulty`, `importance`, and an array of floats (`embedding`) for vector search. Uses text indexes for fast lookups.
- **Relationship**: Links two concepts. Stores `source`, `target`, `relation` (enum: prerequisite, depends_on, part_of, etc.), and AI `confidence`.
- **Document & Chunk**: Represents uploaded PDFs and their linearly segmented text blocks (`content`, `tokenCount`).
- **LearningGraph**: A snapshot document that ties together nodes and edges for rapid frontend consumption.
- **Roadmap**: Stores generated topological study paths, current generation stage, curriculum metrics, and user progress.
- **AIUsage**: Tracks token usage and estimated costs for Gemini API calls to monitor application expenses.
- **ChatHistory**: Persists user interactions with the RAG assistant.

### 5.2 Controllers
Controllers orchestrate the flow between HTTP requests and internal services.
- **Document Controller**: Handles file uploads, triggering chunking, and dispatching tasks to the BullMQ job queue.
- **Graph Controller**: Exposes the graph snapshot and acts as the API bridge for running the aforementioned graph algorithms (BFS, DFS, Dijkstra, Benchmarks).
- **Learning Controller**: Manages the generation of personalized Curriculums and Study Guides using topological sorting and LLM enrichment.
- **Chat Controller**: Handles the Graph-Aware RAG system, managing chat history and streaming responses.
- **Search Controller**: Provides semantic vector search capabilities across concepts.

### 5.3 Services (Business Logic)
- **PDF Service**: Uses `pdf-parse` to convert binary PDF buffers into raw string text.
- **Chunk Service**: Intelligently splits massive strings into overlapping chunks based on character/token limits to fit within LLM context windows.
- **Gemini Client Service**: Initializes the Google Generative AI client. Automatically falls back to a "Mock Mode" if no API key is provided, ensuring the app remains usable for local testing.
- **Concept Extractor**: Prompts the LLM to extract JSON arrays of concepts from text chunks. Contains a robust Regex/JSON parsing fallback.
- **Relationship Extractor**: Takes identified concepts and cross-references them against the text to identify dependencies, generating JSON arrays of directed edges.
- **Vector Store**: A lightweight abstraction over MongoDB to perform cosine similarity searches on the `embedding` fields.
- **RAG Service (Retrieval-Augmented Generation)**: 
  1. Embeds user question.
  2. Semantically searches Text Chunks.
  3. Semantically searches Concepts.
  4. Retrieves direct Graph Neighbors (Prerequisites) from the Relationship model.
  5. Injects this rich, multi-modal context into the Gemini prompt to answer the user's question accurately without hallucination.
- **Curriculum Service**: Uses the Graph Algorithms (Topological Sort) to generate a step-by-step roadmap, then passes the path to Gemini to generate a formatted Markdown "Study Guide". Calculates curriculum metrics (Difficulty Smoothness, Continuity).

---

## 6. Frontend Components

### 6.1 Pages
- **Home**: The landing page introducing the application features.
- **Dashboard**: Displays user statistics, recent documents, and provides the main Dropzone interface for uploading new PDFs.
- **GraphViewer**: The core interactive workspace. Integrates `React Flow` to render nodes and edges. Uses `dagre` to automatically layout the graph horizontally or vertically. Allows users to click nodes to see details and trigger algorithm benchmarks.
- **ChatAssistant**: A chat interface that communicates with the backend RAG service, allowing users to ask questions "about" their document and graph.
- **LearningPath**: Displays the generated topological roadmap. Features a progress tracker, estimated times, and the LLM-generated markdown study guide.

### 6.2 Contexts & State
- **AuthContext**: Wraps the application to provide global access to `user` state, `login()`, `logout()`, and `loading` statuses. Uses `localStorage` to persist JWT tokens.

---

## 7. AI Integrations & Workflows

### 7.1 The AI Pipeline Workflow
1. **Ingestion**: User uploads a PDF. `Multer` saves it. `PdfService` extracts text.
2. **Chunking**: `ChunkService` splits the text into ~1000-token blocks.
3. **Queueing**: Blocks are pushed to Redis.
4. **Extraction**: Workers process each chunk. `ConceptExtractor` uses Gemini to find entities.
5. **Embedding**: Concepts are vectorized to allow for semantic search.
6. **Relating**: `RelationshipExtractor` asks Gemini how the extracted concepts relate to one another within the context of the chunk.
7. **Graphing**: The individual components are unified into a `LearningGraph` snapshot for the frontend.

### 7.2 Graph-Aware RAG
Standard RAG only retrieves text chunks. This system implements **Graph-Aware RAG**. When a user asks a question, the system retrieves relevant text, BUT also queries the `Relationship` model to find prerequisites for the discussed concepts. 
*Example: If a user asks about "Backpropagation", the LLM is explicitly injected with graph knowledge stating "Calculus is a prerequisite", allowing it to formulate a much more educational and contextually aware answer.*

---

## 8. Conclusion

The Intelligent Knowledge Graph Generator is a masterful combination of standard web technologies, advanced computer science algorithms, and modern Generative AI. 

By meticulously applying optimized algorithms (O(1) Queues, Min Heaps, Iterative Stacks) on top of AI-extracted data, the application transitions from being a simple "PDF Summarizer" into a highly dynamic, mathematically sound **Educational Engine** capable of understanding dependencies, tracking learning bottlenecks, and generating optimal curriculum roadmaps.
