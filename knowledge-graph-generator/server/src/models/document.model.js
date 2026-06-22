import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a document title'],
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  currentStage: {
    type: String,
    enum: [
      'uploaded',
      'text_extracted',
      'chunked',
      'concept_extracted',
      'relationships_extracted',
      'graph_built',
      'embeddings_generated',
      'completed',
      'failed',
    ],
    default: 'uploaded',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

DocumentSchema.index({ userId: 1, _id: 1 });
DocumentSchema.index({ status: 1 });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;
