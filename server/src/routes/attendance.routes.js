'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  validateAttendance,
  getTodayStatus,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/attendance/today (current user status)
router.get('/today', getTodayStatus);

// POST /api/attendance/punch-in  (employee)
router.post(
  '/punch-in',
  authorize('employee'),
  [
    body('selfie').optional().isString().withMessage('Selfie must be a base64 string.'),
    body('location.latitude').optional(),
    body('location.lat').optional(),
    body('location.longitude').optional(),
    body('location.lng').optional(),
    body('location.address').optional().isString(),
  ],
  punchIn
);

// PUT /api/attendance/punch-out  (employee)
router.put('/punch-out', authorize('employee'), punchOut);

// GET /api/attendance/my  (employee)
router.get('/my', authorize('employee'), getMyAttendance);

// GET /api/attendance/team  (manager)
router.get('/team', authorize('manager'), getTeamAttendance);

// GET /api/attendance/all  (admin)
router.get('/all', authorize('admin'), getAllAttendance);

// PUT /api/attendance/:id/validate  (manager, admin)
router.put(
  '/:id/validate',
  authorize('manager', 'admin'),
  [
    param('id').isMongoId().withMessage('Invalid attendance ID.'),
    body('validationStatus')
      .isIn(['valid', 'invalid'])
      .withMessage("validationStatus must be 'valid' or 'invalid'."),
    body('remarks').optional().isString(),
  ],
  validateAttendance
);

module.exports = router;
