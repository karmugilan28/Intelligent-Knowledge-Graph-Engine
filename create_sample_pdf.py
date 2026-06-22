from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Introduction to Data Science and Machine Learning', border=False, align='C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Page 1
pdf.add_page()
pdf.set_font('helvetica', '', 12)
pdf.multi_cell(0, 10, "Introduction to Linear Algebra.\n\nLinear algebra is the mathematical branch concerning linear equations and linear maps. It studies matrices and vectors. In machine learning, vectors are used to represent data points, and matrices represent systems of linear equations.\n\nKey topics include eigenvalues and eigenvectors, which represent scaling transformations in vector spaces. These are fundamental to dimensionality reduction algorithms like Principal Component Analysis (PCA).")

# Page 2
pdf.add_page()
pdf.multi_cell(0, 10, "Machine Learning Foundations.\n\nMachine learning is a field of computer science that gives computers the ability to learn without being explicitly programmed. ML algorithms build models based on sample training data to make predictions or decisions.\n\nSupervised learning maps inputs to outputs based on labeled datasets. Unsupervised learning finds hidden patterns or clustering in unlabeled datasets.")

# Page 3
pdf.add_page()
pdf.multi_cell(0, 10, "Neural Networks and Layer Architectures.\n\nArtificial neural networks are computing systems inspired by biological neural networks. They comprise nodes called artificial neurons arranged in layers: input, hidden, and output layers.\n\nDuring training, backpropagation calculates gradients of loss functions with respect to the network weights and biases, updating them to minimize error.")

# Page 4
pdf.add_page()
pdf.multi_cell(0, 10, "Deep Learning Advancements.\n\nDeep learning is a subset of machine learning based on deep artificial neural networks. These models, including Convolutional Neural Networks (CNNs) and Recurrent Neural Networks (RNNs), contain many hidden layers.\n\nModern architectures like Transformers are optimized to run on GPUs, enabling massive language model training.")

# Page 5
pdf.add_page()
pdf.multi_cell(0, 10, "Binary Search Trees and Algorithmic Complexity.\n\nA binary search tree (BST) is a node-based binary tree data structure where each node has at most two children. The left subtree contains keys less than the parent, and the right contains keys greater.\n\nWhen writing algorithms, analyzing time complexity using Big O notation (like O(log n) for search or O(n) for traversal) describes the computational runtime scaling.")

# Page 6
pdf.add_page()
pdf.multi_cell(0, 10, "Recursion and Database Systems.\n\nRecursion is a method of solving problems where the solution depends on solutions to smaller instances of the same problem. A recursive function calls itself, requiring a base case to terminate and avoid stack overflow.\n\nDatabase indexing utilizes data structures like B-Trees to speed up query response times on database tables.")

pdf.output('sample_datascience.pdf')
print("Successfully generated sample_datascience.pdf")
