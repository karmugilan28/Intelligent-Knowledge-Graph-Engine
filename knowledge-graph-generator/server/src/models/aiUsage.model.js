import mongoose from 'mongoose';

const AIUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  operationType: {
    type: String, // e.g., 'concept_extraction', 'relationship_extraction', 'chat_qa', 'embedding'
    required: true,
  },
  tokensUsed: {
    type: Number,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  cost: {
    type: Number, // Cost in USD
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

AIUsageSchema.index({ userId: 1 });
AIUsageSchema.index({ documentId: 1 });

const AIUsage = mongoose.model('AIUsage', AIUsageSchema);
export default AIUsage;
