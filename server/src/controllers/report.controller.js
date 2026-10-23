'use strict';

const dayjs = require('dayjs');
const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');

/**
 * @route   GET /api/reports/daily
 * @desc    Get daily attendance report (role-scoped)
 * @access  All (employee sees own, manager sees team, admin sees all)
 */
const getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const reportDate = date || dayjs().format('YYYY-MM-DD');

    const user = req.user;
    let userIds = [];

    if (user.role === 'employee') {
      // Employee sees only their own
      userIds = [user._id];
    } else if (user.role === 'manager') {
      // Manager sees their own team
      const teamMembers = await User.find({ managerId: user._id, isActive: true }).select('_id');
      userIds = [user._id, ...teamMembers.map((m) => m._id)];
    } else {
      // Admin sees all active users
      const allUsers = await User.find({ isActive: true }).select('_id');
      userIds = allUsers.map((u) => u._id);
    }

    const attendanceRecords = await Attendance.find({
      date: reportDate,
      userId: { $in: userIds },
    })
      .populate('userId', 'name email department role')
      .populate('reviewedBy', 'name email')
      .lean();

    // Map userId -> attendance
    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[String(record.userId._id)] = record;
    });

    // Build report with user info and attendance (or null if absent)
    const usersData = await User.find({ _id: { $in: userIds } }).select('name email department role').lean();

    const report = usersData.map((u) => ({
      user: {
        _id: u._id,
        name: u.name,
        email: u.email,
        department: u.department,
        role: u.role,
      },
      attendance: attendanceMap[String(u._id)] || null,
    }));

    return res.status(200).json({
      success: true,
      message: `Daily report for ${reportDate}.`,
      date: reportDate,
      report,
      totalUsers: report.length,
      present: report.filter((r) => r.attendance !== null).length,
      absent: report.filter((r) => r.attendance === null).length,
      data: {
        date: reportDate,
        report,
        totalUsers: report.length,
        present: report.filter((r) => r.attendance !== null).length,
        absent: report.filter((r) => r.attendance === null).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDailyReport };
