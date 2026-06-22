import mongoose from 'mongoose';

const LearningGraphSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  nodes: {
    type: Array, // Holds React Flow Node arrays: [{ id, data: { label, description, ... }, position: { x, y } }]
    required: true,
  },
  edges: {
    type: Array, // Holds React Flow Edge arrays: [{ id, source, target, label, data: { relation, confidence } }]
    required: true,
  },
  statistics: {
    nodeCount: { type: Number, default: 0 },
    edgeCount: { type: Number, default: 0 },
    clusters: { type: Number, default: 0 },
    density: { type: Number, default: 0 },
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

LearningGraphSchema.index({ documentId: 1 });

const LearningGraph = mongoose.model('LearningGraph', LearningGraphSchema);
export default LearningGraph;
