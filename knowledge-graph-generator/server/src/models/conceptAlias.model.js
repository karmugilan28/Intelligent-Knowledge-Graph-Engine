import mongoose from 'mongoose';

const ConceptAliasSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  canonicalName: {
    type: String,
    required: true,
    trim: true,
  },
  aliases: {
    type: [String],
    default: [],
  },
});

// Compound unique index for document context canonical names
ConceptAliasSchema.index({ documentId: 1, canonicalName: 1 }, { unique: true });

const ConceptAlias = mongoose.model('ConceptAlias', ConceptAliasSchema);
export default ConceptAlias;
