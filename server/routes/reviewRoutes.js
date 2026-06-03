const express = require('express');
const multer = require('multer');
const router = express.Router();
const { submitReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { reviewLimiter } = require('../middleware/rateLimiter');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    /\.(js|ts|py|java|go|rs|php|rb|cpp|c|cs)$/i.test(file.originalname) ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

router.post('/', protect, reviewLimiter, upload.single('codeFile'), submitReview);
module.exports = router;
