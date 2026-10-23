'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication + admin role
router.use(protect, authorize('admin'));

// GET /api/users
router.get('/', getAllUsers);

// POST /api/users
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('role')
      .optional()
      .isIn(['employee', 'manager', 'admin'])
      .withMessage("Role must be 'employee', 'manager', or 'admin'."),
    body('department').optional().isString(),
    body('managerId').optional().isMongoId().withMessage('Invalid manager ID.'),
  ],
  createUser
);

// PUT /api/users/:id
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID.'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('role')
      .optional()
      .isIn(['employee', 'manager', 'admin'])
      .withMessage("Role must be 'employee', 'manager', or 'admin'."),
    body('department').optional().isString(),
    body('managerId').optional().isMongoId().withMessage('Invalid manager ID.'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
  ],
  updateUser
);

// PATCH /api/users/:id/toggle-status
router.patch('/:id/toggle-status', [param('id').isMongoId().withMessage('Invalid user ID.')], toggleUserStatus);

// DELETE /api/users/:id
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid user ID.')], deleteUser);

module.exports = router;
