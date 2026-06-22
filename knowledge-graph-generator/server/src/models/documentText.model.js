import mongoose from 'mongoose';

const DocumentTextSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    unique: true,
  },
  text: {
    type: String,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
});

const DocumentText = mongoose.model('DocumentText', DocumentTextSchema);
export default DocumentText;
