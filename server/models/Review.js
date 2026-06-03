const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, maxlength: 100, default: 'Untitled Review' },
  originalCode: { type: String, required: true, maxlength: 50000 },
  language: { type: String, required: true, enum: ['javascript','typescript','python','java','go','rust','php','ruby','cpp','other'], default: 'javascript' },
  bugs: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  optimizedCode: { type: String, default: '' },
  score: { type: Number, min: 0, max: 100, default: 0 },
  explanation: { type: String, default: '' },
  status: { type: String, enum: ['pending','completed','failed'], default: 'completed' },
  processingTime: { type: Number, default: 0 },
}, { timestamps: true });

reviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
