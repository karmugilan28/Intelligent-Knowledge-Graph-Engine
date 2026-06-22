from fpdf import FPDF

class DocumentationPDF(FPDF):
    def header(self):
        # Draw top banner line
        self.set_fill_color(99, 102, 241) # Premium Indigo
        self.rect(0, 0, 210, 4, 'F')
        
        # Title Header
        self.set_font('helvetica', 'B', 10)
        self.set_text_color(100, 116, 139) # Slate grey
        self.cell(0, 10, 'KNOWLEDGEGRAPH.AI - PRODUCT DOCUMENTATION & ARCHITECTURE', border=0, align='R')
        self.ln(12)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(148, 163, 184) # Light grey
        self.cell(0, 10, f'Page {self.page_no()}', border=0, align='C')

    def add_section_header(self, text):
        self.set_font('helvetica', 'B', 14)
        self.set_text_color(99, 102, 241) # Indigo
        self.cell(0, 10, text, border='B', ln=1)
        self.ln(4)

    def add_subsection_header(self, text):
        self.set_font('helvetica', 'B', 11)
        self.set_text_color(15, 23, 42) # Dark Slate
        self.cell(0, 8, text, border=0, ln=1)
        self.ln(2)

    def add_body_text(self, text):
        self.set_font('helvetica', '', 10)
        self.set_text_color(51, 65, 85) # Slate text
        self.multi_cell(0, 6, text)
        self.ln(4)

# Create PDF instance
pdf = DocumentationPDF()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.set_margins(20, 20, 20)

# ==================== PAGE 1 ====================
pdf.add_page()

# Main Title block
pdf.ln(10)
pdf.set_font('helvetica', 'B', 24)
pdf.set_text_color(15, 23, 42) # Dark Slate
pdf.cell(0, 12, 'KnowledgeGraph.AI', border=0, ln=1, align='L')

pdf.set_font('helvetica', 'B', 12)
pdf.set_text_color(99, 102, 241) # Indigo
pdf.cell(0, 8, 'Intelligent Educational Graph Synthesizer & RAG Companion', border=0, ln=1, align='L')
pdf.ln(10)

# Section: Product Overview
pdf.add_section_header('1. Product Overview')
pdf.add_body_text(
    "KnowledgeGraph.AI is a state-of-the-art educational tech platform designed to transform "
    "unstructured textbooks, lecture notes, and learning documents (PDFs) into interactive, "
    "visual learning pathways. By combining natural language processing, vector search indexers, "
    "and graph theory algorithms, the application generates a personalized visual conceptual model "
    "of any academic document. Students can navigate concepts interactively, run pathway animations, "
    "engage in question-answering with an AI tutor grounded in the text, and generate structured study roadmaps."
)

# Section: Core Architecture
pdf.add_section_header('2. Processing Pipeline Architecture')
pdf.add_body_text(
    "When a user uploads a PDF document through the dashboard, it triggers a background process "
    "orchestrated through an advanced asynchronous queue structure. The processing follows six key stages:"
)

pdf.add_subsection_header('Stage A: Text Extraction')
pdf.add_body_text(
    "The server processes the uploaded PDF binary using a page-by-page rendering pipeline, "
    "extracting the raw textual character stream and compiling metadata such as total page counts."
)

pdf.add_subsection_header('Stage B: Page-by-Page Chunking')
pdf.add_body_text(
    "The raw text is segmented into distinct semantic chunks mapped to specific pages, ensuring "
    "that context window sizes are optimized for downstream AI processing and citation reference lookup."
)

# ==================== PAGE 2 ====================
pdf.add_page()
pdf.ln(5)

pdf.add_subsection_header('Stage C: AI Concept Extraction')
pdf.add_body_text(
    "The text chunks are analyzed using Google Gemini 1.5 Flash (or local rules-based mock modes "
    "when offline). The AI extracts key educational concepts, difficulty scores (1-10), importance "
    "levels, and concise summaries, merging duplicates dynamically using a concept normalizer database."
)

pdf.add_subsection_header('Stage D: AI Relationship Discovery')
pdf.add_body_text(
    "Concepts are correlated to discover structural connections. The system extracts relationships "
    "such as 'prerequisite' (e.g., Algebra -> Calculus) or 'related_to'. Edge links are verified "
    "against document concepts and filtered using confidence scores (threshold >= 0.70)."
)

pdf.add_subsection_header('Stage E: Topology Graph Construction')
pdf.add_body_text(
    "The backend compiles concepts (nodes) and relationships (edges) into a network layout snapshot. "
    "The coordinates are mathematically calculated to layout nodes from left (lower difficulty) to "
    "right (higher difficulty) and group them vertically by academic categories."
)

pdf.add_subsection_header('Stage F: Vector Index Generation')
pdf.add_body_text(
    "High-dimensional word embeddings are calculated for all chunks and concepts using text-embedding "
    "models. These vectors are indexed in MongoDB to support real-time semantic search and RAG Q&A."
)

# ==================== PAGE 3 ====================
pdf.add_page()
pdf.ln(5)

# Section: Feature Modules
pdf.add_section_header('3. Interactive Feature Modules')

pdf.add_subsection_header('A. Dashboard & Document Hub')
pdf.add_body_text(
    "The homepage of logged-in users lists all processed textbooks and learning materials. "
    "Users can upload new files (up to 15MB) and monitor extraction progress in real-time "
    "via progress bars and stage labels (e.g., 'Assembling Topology Graph'). Once completed, "
    "shortcuts open the Graph, Chat, or Roadmaps pages."
)

pdf.add_subsection_header('B. Graph Viewer (React Flow Canvas)')
pdf.add_body_text(
    "The core visual tool renders the topological knowledge map of the document. Key details include:\n"
    "1. Interactive Nodes: Concept boxes color-coded by academic categories (e.g., Pink for Deep Learning).\n"
    "2. Premium Styled Edges: Smoothstep lines showing prerequisites (dashed red) and general links (blue).\n"
    "3. Edge Labels: Floating 'prerequisite' indicators styled with dark theme slate backgrounds and edge-matching borders.\n"
    "4. Concept Inspector Sidebar: Clicking any node pulls up its metadata, occurrence frequency, and highlights the precise source text paragraphs with clickable page citations.\n"
    "5. Exact, Fuzzy, and Semantic Search: Highlights matching concepts instantly with glowing indigo outlines.\n"
    "6. Visual Traversal DSA: Students select a starting topic, choose BFS (Breadth-First Search) or DFS (Depth-First Search), and click 'Animate Path' to watch the logical learning sequence light up step-by-step."
)

pdf.add_subsection_header('C. RAG Chat Assistant')
pdf.add_body_text(
    "A conversational tutoring chatbot grounded in the document contents. It pulls relevant text chunks "
    "using semantic similarity search on the user question, synthesizing a clear educational response "
    "with highlighted concepts and inline text citations."
)

pdf.add_subsection_header('D. Study Roadmaps (Learning Path Generator)')
pdf.add_body_text(
    "Generates step-by-step custom curriculum plans for any selected target topic. The algorithm "
    "calculates prerequisite dependencies recursively and outputs sequential study milestones "
    "with estimated study times, category descriptions, and prerequisites."
)

# Output PDF file
pdf.output('KnowledgeGraph_AI_Documentation.pdf')
print("Successfully generated KnowledgeGraph_AI_Documentation.pdf")
