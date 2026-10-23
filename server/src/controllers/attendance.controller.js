'use strict';

const dayjs = require('dayjs');
const { validationResult } = require('express-validator');
const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');

/**
 * @route   POST /api/attendance/punch-in
 * @desc    Record punch-in for today
 * @access  Employee
 */
const punchIn = async (req, res, next) => {
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
    const today = dayjs().format('YYYY-MM-DD');

    // Check if already punched in today
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already punched in for today.',
      });
    }

    const { selfie, location } = req.body;

    const lat = location?.latitude !== undefined ? location.latitude : location?.lat;
    const lng = location?.longitude !== undefined ? location.longitude : location?.lng;

    const attendance = await Attendance.create({
      userId,
      date: today,
      punchIn: new Date(),
      selfieUrl: selfie || null,
      location: {
        latitude: lat || null,
        longitude: lng || null,
        address: location?.address || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Punch-in recorded successfully.',
      attendance,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/attendance/punch-out
 * @desc    Record punch-out for today
 * @access  Employee
 */
const punchOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().format('YYYY-MM-DD');

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No punch-in record found for today. Please punch in first.',
      });
    }

    if (attendance.punchOut) {
      return res.status(409).json({
        success: false,
        message: 'You have already punched out for today.',
      });
    }

    const punchOutTime = new Date();
    const totalHours = (punchOutTime - attendance.punchIn) / (1000 * 60 * 60);

    attendance.punchOut = punchOutTime;
    attendance.totalHours = parseFloat(totalHours.toFixed(2));
    attendance.status = totalHours >= 8 ? 'completed' : 'incomplete';

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Punch-out recorded successfully.',
      attendance,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/my
 * @desc    Get current user's attendance with pagination and date filter
 * @access  Employee
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Attendance records retrieved.',
      attendances: records,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        attendances: records,
        records,
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
 * @route   GET /api/attendance/team
 * @desc    Get attendance for all team members under this manager
 * @access  Manager
 */
const getTeamAttendance = async (req, res, next) => {
  try {
    const managerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Find all team members under this manager
    const teamMembers = await User.find({ managerId, isActive: true }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);

    if (teamIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No team members found.',
        attendances: [],
        records: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
        data: { attendances: [], records: [], pagination: { total: 0, page, limit, totalPages: 0 } },
      });
    }

    const query = { userId: { $in: teamIds } };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('userId', 'name email department')
        .populate('reviewedBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Team attendance records retrieved.',
      attendances: records,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        attendances: records,
        records,
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
 * @route   GET /api/attendance/all
 * @desc    Get all attendance records (admin)
 * @access  Admin
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { startDate, endDate, userId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('userId', 'name email department role')
        .populate('reviewedBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: 'All attendance records retrieved.',
      attendances: records,
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        attendances: records,
        records,
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
 * @route   PUT /api/attendance/:id/validate
 * @desc    Validate or invalidate an attendance record
 * @access  Manager, Admin
 */
const validateAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { validationStatus, remarks } = req.body;
    const { id } = req.params;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
    }

    // Manager can only validate their own team members' attendance
    if (req.user.role === 'manager') {
      const employee = await User.findById(attendance.userId);
      if (!employee || String(employee.managerId) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'You can only validate attendance for your own team members.',
        });
      }
    }

    attendance.validationStatus = validationStatus;
    attendance.remarks = remarks || attendance.remarks;
    attendance.reviewedBy = req.user._id;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: `Attendance marked as '${validationStatus}'.`,
      attendance,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/attendance/today
 * @desc    Get current logged in user's attendance for today
 * @access  Employee, Manager, Admin
 */
const getTodayStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().format('YYYY-MM-DD');

    const attendance = await Attendance.findOne({ userId, date: today });

    return res.status(200).json({
      success: true,
      attendance: attendance || null,
      data: { attendance: attendance || null },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  validateAttendance,
  getTodayStatus,
};
