import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  targetConcept: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
  roadmapHash: {
    type: String, // To detect if an identical roadmap exists
  },
  graphVersion: {
    type: Number, // Tie roadmap to a specific graph version
    default: 1,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
  },
  currentGenerationStage: {
    type: String,
    enum: ['initialized', 'traversal', 'enrichment', 'study_guide', 'finalized'],
    default: 'initialized',
  },
  path: [
    {
      concept: String,
      category: String,
      description: String,
      difficulty: Number,
      importance: Number,
      estimatedTime: String,
    }
  ],
  studyGuide: {
    type: String,
    default: '',
  },
  curriculumMetrics: {
    dependencyCoverage: { type: Number, default: 0 },
    difficultySmoothness: { type: Number, default: 0 },
    learningContinuity: { type: Number, default: 0 },
    conceptCoverage: { type: Number, default: 0 }
  },
  overallScore: {
    type: Number,
    default: 0,
  },
  progress: {
    completedSteps: [String],
    lastAccessedAt: { type: Date, default: Date.now }
  },
  snapshots: {
    graphSnapshot: { type: mongoose.Schema.Types.Mixed }, // Store a copy of the graph at generation time
    roadmapSnapshot: { type: mongoose.Schema.Types.Mixed } // Store a copy of the roadmap at generation time
  }
});

RoadmapSchema.index({ userId: 1, documentId: 1, targetConcept: 1 });
RoadmapSchema.index({ status: 1 });

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
export default Roadmap;
