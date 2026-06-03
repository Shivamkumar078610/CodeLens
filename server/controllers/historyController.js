const mongoose = require('mongoose');
const Review = require('../models/Review');

const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { userId: req.user.id };
    if (req.query.language && req.query.language !== 'all') filter.language = req.query.language;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-originalCode -optimizedCode'),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) { next(e); }
};

const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (e) { next(e); }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Fix: use "new" keyword for ObjectId — required in Mongoose 7+
    const oid = new mongoose.Types.ObjectId(userId);

    const [total, avg, langs, recent] = await Promise.all([
      Review.countDocuments({ userId }),
      Review.aggregate([
        { $match: { userId: oid } },
        { $group: { _id: null, avg: { $avg: '$score' } } },
      ]),
      Review.aggregate([
        { $match: { userId: oid } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Review.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title score language createdAt'),
    ]);

    res.json({
      success: true,
      stats: {
        totalReviews: total,
        averageScore: avg[0]?.avg ? Math.round(avg[0].avg) : 0,
        languageBreakdown: langs,
        recentActivity: recent,
      },
    });
  } catch (e) { next(e); }
};

module.exports = { getHistory, getReviewById, deleteReview, getStats };