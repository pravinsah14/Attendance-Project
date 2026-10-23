'use strict';

const { validationResult } = require('express-validator');
const OvertimeRequest = require('../models/OvertimeRequest.model');
const Attendance = require('../models/Attendance.model');

/**
 * @route   POST /api/overtime/request
 * @desc    Employee submits an overtime request for a specific attendance date
 * @access  Employee
 */
const requestOvertime = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const userId = req.user._id;
    const { date, requestedHours, reason } = req.body;

    // Find attendance for that date
    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: `No attendance record found for date ${date}.`,
      });
    }

    // Check for duplicate pending request
    const existingRequest = await OvertimeRequest.findOne({
      userId,
      attendanceId: attendance._id,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'A pending overtime request already exists for this date.',
      });
    }

    const overtimeRequest = await OvertimeRequest.create({
      userId,
      attendanceId: attendance._id,
      date,
      requestedHours,
      reason,
    });

    return res.status(201).json({
      success: true,
      message: 'Overtime request submitted successfully.',
      overtimeRequest,
      data: { overtimeRequest },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/overtime/my
 * @desc    Get current employee's overtime requests
 * @access  Employee
 */
const getMyOvertime = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      OvertimeRequest.find({ userId })
        .populate('attendanceId')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OvertimeRequest.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Your overtime requests retrieved.',
      overtimes: requests,
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        overtimes: requests,
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/overtime/pending
 * @desc    Get all pending overtime requests (manager/admin)
 * @access  Manager, Admin
 */
const getPendingOvertime = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      OvertimeRequest.find({ status: 'pending' })
        .populate('userId', 'name email department')
        .populate('attendanceId')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OvertimeRequest.countDocuments({ status: 'pending' }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Pending overtime requests retrieved.',
      overtimes: requests,
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        overtimes: requests,
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/overtime/all
 * @desc    Get all overtime requests (admin)
 * @access  Admin
 */
const getAllOvertime = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      OvertimeRequest.find({})
        .populate('userId', 'name email department')
        .populate('attendanceId')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OvertimeRequest.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      message: 'All overtime requests retrieved.',
      overtimes: requests,
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        overtimes: requests,
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/overtime/:id/review
 * @desc    Approve or reject an overtime request
 * @access  Manager, Admin
 */
const reviewOvertime = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
    }

    const overtimeRequest = await OvertimeRequest.findById(id);

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Overtime request not found.',
      });
    }

    if (overtimeRequest.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `This request has already been ${overtimeRequest.status}.`,
      });
    }

    overtimeRequest.status = status;
    overtimeRequest.reviewedBy = req.user._id;
    overtimeRequest.reviewNote = reviewNote || null;

    await overtimeRequest.save();

    // Update attendance overtimeRequested flag if approved
    if (status === 'approved') {
      await Attendance.findByIdAndUpdate(overtimeRequest.attendanceId, {
        overtimeRequested: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Overtime request ${status}.`,
      overtimeRequest,
      data: { overtimeRequest },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  getAllOvertime,
  reviewOvertime,
};
