import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  chunkNumber: {
    type: Number,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tokenCount: {
    type: Number,
    required: true,
  },
  embedding: {
    type: [Number], // Stored as array of floats for semantic search
    default: undefined, // Mongoose indexes arrays nicely if default is undefined
  },
});

// Compound index for fast queries by document
ChunkSchema.index({ documentId: 1, chunkNumber: 1 });

const Chunk = mongoose.model('Chunk', ChunkSchema);
export default Chunk;
