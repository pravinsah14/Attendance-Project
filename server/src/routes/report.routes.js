'use strict';

const express = require('express');
const { query } = require('express-validator');
const { getDailyReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/reports/daily  (all roles, role-scoped)
router.get(
  '/daily',
  [
    query('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format.'),
  ],
  getDailyReport
);

module.exports = router;
