# Intelligent-Knowledge-Graph-Engine

![Intelligent Knowledge Graph Engine](https://img.shields.io/badge/Status-Active-brightgreen)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

The **Intelligent Knowledge Graph Engine** is an advanced full-stack application designed to automatically parse educational documents (like PDFs), extract core concepts and relationships using state-of-the-art Large Language Models (LLMs), and visualize them as interactive, analyzable Knowledge Graphs.

The primary goal of the project is to provide learners with an intelligent study companion that automatically builds **Learning Roadmaps**, answers questions using **Graph-Aware Retrieval-Augmented Generation (RAG)**, and performs deep **Graph Analytics** to find learning bottlenecks, critical paths, and prerequisites.

## 🚀 Features

*   **PDF Knowledge Extraction**: Upload educational PDFs and automatically parse text content into manageable chunks.
*   **AI-Powered Concept & Relationship Extraction**: Uses Google Gemini 1.5 Flash to intelligently extract core concepts and their interdependent relationships.
*   **Interactive Knowledge Graph**: Visualizes concepts and dependencies using React Flow and Dagre for automated, aesthetically pleasing hierarchical layouts.
*   **Graph-Aware RAG Chat**: Ask questions about your documents and get answers enriched with multi-modal context (semantic text search + graph prerequisite traversal).
*   **Automated Learning Roadmaps**: Generates step-by-step curriculum study guides using Topological Sorting (Kahn's Algorithm) to ensure prerequisites are learned first.
*   **Advanced Graph Analytics**: Implements custom, highly-optimized algorithms (BFS, DFS, Dijkstra's, PageRank, Tarjan's SCC) to identify critical bottlenecks, importance centrality, and optimal learning paths.
*   **Asynchronous Background Processing**: Uses Redis and BullMQ to handle heavy LLM generation and embedding tasks in non-blocking background workers.

## 🛠️ Technology Stack

### Backend (Server-Side)
*   **Node.js & Express.js**: RESTful API core.
*   **MongoDB & Mongoose**: NoSQL data store & Vector storage.
*   **Google Gemini API**: Core AI engine for NLP extraction and RAG.
*   **Redis & BullMQ**: Asynchronous background job queues.
*   **Multer & PDF-Parse**: File handling and PDF text extraction.
*   **JWT & Bcryptjs**: Secure authentication and session management.

### Frontend (Client-Side)
*   **React.js (v18) & Vite**: High-performance UI rendering and fast builds.
*   **Tailwind CSS**: Utility-first styling framework.
*   **React Flow (`@xyflow/react`)**: Interactive node-based graph rendering.
*   **Dagre**: Directed graph layout engine.
*   **React Router DOM**: Client-side routing.
*   **Framer Motion**: Declarative UI animations.

## 🧠 Core Graph Algorithms
*   **Breadth-First Search (BFS)**: Uses O(1) Queue Pointer technique for level-by-level exploration.
*   **Depth-First Search (DFS)**: Implemented with Iterative Stacks to prevent call stack limits on large graphs.
*   **Dijkstra's Algorithm**: Utilizes a custom Min Binary Heap for finding the optimal (lowest cost) learning path.
*   **Topological Sort**: Employs Kahn's Algorithm to generate linear learning sequences based on prerequisites.
*   **PageRank**: Calculates concept "importance" and centrality.
*   **Tarjan's Algorithm**: Identifies Strongly Connected Components (SCCs) and paradoxical learning cycles.

## 📂 Architecture

The project follows a decoupled service-oriented architecture:
1.  **Client Layer**: React SPA managing state, UI interactions, and graph rendering.
2.  **API Layer**: Express backend handling routing, auth, and rate-limiting.
3.  **Service Layer**: Isolates core business logic (PDF parsing, chunking, LLM prompts, vector search).
4.  **Worker Layer**: BullMQ workers process heavy AI extraction jobs off the main thread.
5.  **Data Layer**: MongoDB collections storing Nodes, Edges, Roadmaps, and Chat History.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new analytics algorithms, better LLM prompts, or UI enhancements, feel free to open an issue or submit a Pull Request.

## 📝 License

This project is open-source and available under the MIT License.
