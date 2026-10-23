'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  getAllOvertime,
  reviewOvertime,
} = require('../controllers/overtime.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/overtime/request  (employee)
router.post(
  '/request',
  authorize('employee'),
  [
    body('date')
      .notEmpty()
      .withMessage('Date is required.')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format.'),
    body('requestedHours')
      .notEmpty()
      .withMessage('Requested hours is required.')
      .isNumeric()
      .withMessage('Requested hours must be a number.')
      .custom((val) => {
        if (val <= 0) throw new Error('Requested hours must be greater than 0.');
        return true;
      }),
    body('reason').optional().isString(),
  ],
  requestOvertime
);

// GET /api/overtime/my  (employee)
router.get('/my', authorize('employee'), getMyOvertime);

// GET /api/overtime/pending  (manager, admin)
router.get('/pending', authorize('manager', 'admin'), getPendingOvertime);

// GET /api/overtime/all  (admin)
router.get('/all', authorize('admin'), getAllOvertime);

// PUT /api/overtime/:id/review  (manager, admin)
router.put(
  '/:id/review',
  authorize('manager', 'admin'),
  [
    param('id').isMongoId().withMessage('Invalid overtime request ID.'),
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage("Status must be 'approved' or 'rejected'."),
    body('reviewNote').optional().isString(),
  ],
  reviewOvertime
);

module.exports = router;
