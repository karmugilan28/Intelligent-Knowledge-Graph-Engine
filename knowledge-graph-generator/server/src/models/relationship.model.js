import mongoose from 'mongoose';

const RelationshipSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  target: {
    type: String,
    required: true,
    trim: true,
  },
  relation: {
    type: String,
    enum: [
      'prerequisite',
      'depends_on',
      'part_of',
      'related_to',
      'foundation_of',
      'used_in',
      'extends',
      'implements',
    ],
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0,
  },
});

// Create indexes to optimize adjacency queries
RelationshipSchema.index({ documentId: 1 });
RelationshipSchema.index({ documentId: 1, source: 1 });
RelationshipSchema.index({ documentId: 1, target: 1 });
RelationshipSchema.index({ documentId: 1, source: 1, target: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', RelationshipSchema);
export default Relationship;
