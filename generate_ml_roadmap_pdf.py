from fpdf import FPDF

class RoadmapPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.set_text_color(15, 23, 42) # Dark slate
        self.cell(0, 10, 'Machine Learning Curriculum and Roadmaps', border=False, align='C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(100, 116, 139) # Slate grey
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

pdf = RoadmapPDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Page 1: Linear Algebra
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241) # Indigo
pdf.cell(0, 10, 'Unit 1: Linear Algebra and Coordinate Spaces', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Linear Algebra serves as the absolute mathematical foundation for representing data in machine learning. "
    "Datasets are represented as high-dimensional matrices, where each row corresponds to a data point and each "
    "column represents a specific feature dimension.\n\n"
    "Key concepts include Vectors, which define positions in multi-dimensional space, and Vector Spaces, "
    "which govern how these vectors scale and combine. Linear Transformations allow us to map, rotate, and "
    "project data from one coordinate space to another. Specifically, Eigenvalues and Eigenvectors are critical "
    "for finding directions of maximum variance in dataset mapping algorithms like Principal Component Analysis (PCA). "
    "Understanding vectors and matrices is the prerequisite for calculating multidimensional equations."
)

# Page 2: Calculus
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 2: Calculus and Optimization Gradients', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Calculus provides the mathematical machinery to train machine learning models by optimizing their weights. "
    "While Linear Algebra represents the parameters of a model, Calculus allows us to adjust those parameters "
    "to reduce prediction errors.\n\n"
    "The core concept is the Derivative, which measures the rate of change of a function. In multidimensional "
    "machine learning, we calculate Partial Derivatives to find changes relative to individual model weights. "
    "By compiling these partial derivatives, we obtain the Gradient vector. The Gradient points in the direction "
    "of steepest increase of the error function. Consequently, algorithms use Gradient Descent to step in the "
    "opposite direction of the gradient to minimize prediction error. You must understand Derivatives and Linear Algebra "
    "before studying Gradient Descent and optimization."
)

# Page 3: Probability
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 3: Probability Theory and Bayes Theorem', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Probability Theory is the mathematical framework for modeling uncertainty and making predictions "
    "in machine learning. Real-world data is noisy and incomplete, requiring probabilistic models to "
    "quantify confidence.\n\n"
    "We use Probability Distributions (like Gaussian or Binomial distributions) to describe how likely "
    "different data outcomes are. Bayes Theorem is the fundamental law of conditional probability, "
    "allowing us to update the probability of a hypothesis as we observe new evidence. Bayes Theorem "
    "is the mathematical prerequisite for probability classification models like Naive Bayes classifiers. "
    "Together, Linear Algebra, Calculus, and Probability Theory form the complete mathematics prerequisite "
    "to learn Machine Learning."
)

# Page 4: Machine Learning
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 4: Machine Learning Foundations', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Machine Learning is the field of computer science that builds algorithms capable of learning from data. "
    "It leverages Linear Algebra, Calculus, and Probability Theory to detect patterns and make predictions.\n\n"
    "Supervised Learning is the training paradigm where models learn from labeled datasets, mapping inputs "
    "to target outputs (for example, in Regression models predicting housing prices or Classification models "
    "predicting image labels). Unsupervised Learning discovers hidden patterns and clusters in unlabeled data. "
    "Understanding basic Machine Learning classification concepts is the prerequisite to advance to Neural Networks."
)

# Page 5: Neural Networks
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 5: Neural Networks and Backpropagation', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Neural Networks are a class of machine learning models inspired by the biological brain, forming the "
    "foundation of deep learning. A Neural Network consists of layers of nodes (neurons): an input layer, "
    "one or more hidden layers, and an output layer.\n\n"
    "During the forward pass, data flows through weights and activation functions to make a prediction. "
    "The core optimization technique is Backpropagation, which uses the calculus chain rule to compute "
    "the error gradient with respect to all model weights. These weights are then updated using Gradient Descent. "
    "Prerequisites for Neural Networks include general Machine Learning concepts, Calculus derivatives, and "
    "Linear Algebra matrix operations. Mastery of basic Neural Networks is required before moving to specialized "
    "architectures like CNNs and RNNs."
)

# Page 6: CNNs and RNNs
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 6: Convolutional and Recurrent Neural Networks', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Once you understand basic Neural Networks, you can study specialized deep architectures optimized for "
    "different data formats.\n\n"
    "Convolutional Neural Networks (CNNs) are specialized networks designed to process grid-like spatial data, "
    "such as digital images, using kernel filters to extract features. Recurrent Neural Networks (RNNs) are "
    "specialized for processing sequential data, such as time series or text, by maintaining a temporal loop "
    "state. Understanding sequential RNN structures is a key prerequisite to learning the Attention Mechanism "
    "and Transformers."
)

# Page 7: Transformers
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 7: Transformers and Attention Mechanisms', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Transformers are the modern state-of-the-art deep learning architectures that have revolutionized "
    "how models process sequential data, replacing older sequential RNN structures.\n\n"
    "The core mechanism of a Transformer is Self-Attention, which calculates the mathematical alignment "
    "between all words in a sentence simultaneously. This allows parallel processing on modern GPUs, "
    "overcoming the temporal sequence limits of RNNs. The prerequisite to learn Transformers is a solid "
    "understanding of Neural Networks, matrix math from Linear Algebra, and sequential text modeling. "
    "Transformers are the primary building block for Large Language Models."
)

# Page 8: LLMs
pdf.add_page()
pdf.set_font('helvetica', 'B', 14)
pdf.set_text_color(99, 102, 241)
pdf.cell(0, 10, 'Unit 8: Large Language Models and NLP', border=0, ln=1)
pdf.ln(5)
pdf.set_font('helvetica', '', 11)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(0, 8, 
    "Large Language Models (LLMs) represent the cutting edge of Natural Language Processing (NLP). "
    "LLMs are massive neural networks trained on vast textual datasets to generate human-like text.\n\n"
    "These models are built directly using the Transformer architecture and trained via self-supervised "
    "objectives, predicting masked words in a sentence. Key techniques include fine-tuning and prompt engineering. "
    "The prerequisite path to understand LLMs goes through Linear Algebra, Calculus, Probability, Machine Learning, "
    "Neural Networks, and Transformers."
)

pdf.output('machine_learning_test.pdf')
print("Successfully generated machine_learning_test.pdf")
