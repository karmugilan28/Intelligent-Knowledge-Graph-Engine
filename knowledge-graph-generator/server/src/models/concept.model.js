import mongoose from 'mongoose';

const ConceptSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a concept name'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  importance: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  frequency: {
    type: Number,
    default: 1,
  },
  embedding: {
    type: [Number], // Stored as array of floats for concept semantic matching
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Setup indexes for search and fuzzy matching
ConceptSchema.index({ documentId: 1, name: 1 }, { unique: true });
ConceptSchema.index({ name: 'text', description: 'text' }); // Text indexes for fuzzy/text search

const Concept = mongoose.model('Concept', ConceptSchema);
export default Concept;
