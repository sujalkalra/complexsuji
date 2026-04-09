import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  code: { type: String, required: true },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  timeExplanation: { type: String, required: true },
  spaceExplanation: { type: String, required: true },
  suggestions: { type: [String], default: [] },
  isCorrect: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'reviewToDataset' // Explicitly set the collection name
});

export default mongoose.model('Analysis', analysisSchema);
