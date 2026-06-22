import mongoose from 'mongoose';

const ConceptReferenceSchema = new mongoose.Schema({
  conceptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Concept',
    required: true,
  },
  chunkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chunk',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  sourceSnippet: {
    type: String,
    required: true,
  },
  surroundingContext: {
    type: String,
    required: true,
  },
});

ConceptReferenceSchema.index({ conceptId: 1 });
ConceptReferenceSchema.index({ chunkId: 1 });
ConceptReferenceSchema.index({ documentId: 1 });

const ConceptReference = mongoose.model('ConceptReference', ConceptReferenceSchema);
export default ConceptReference;
