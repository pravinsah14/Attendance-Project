'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Attendance = require('./models/Attendance.model');
const OvertimeRequest = require('./models/OvertimeRequest.model');
const dayjs = require('dayjs');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      OvertimeRequest.deleteMany({}),
    ]);

    console.log('Creating demo users...');

    // 1. Admin
    const admin = await User.create({
      name: 'Admin Sarah',
      email: 'admin@attendx.com',
      password: 'Password123!',
      role: 'admin',
      department: 'Operations & HR',
      employeeId: 'ADM-001',
      isActive: true,
    });

    // 2. Manager
    const manager = await User.create({
      name: 'Manager Robert',
      email: 'manager@attendx.com',
      password: 'Password123!',
      role: 'manager',
      department: 'Engineering',
      employeeId: 'MGR-001',
      isActive: true,
    });

    // 3. Employees reporting to Manager Robert
    const employee1 = await User.create({
      name: 'John Doe',
      email: 'employee@attendx.com',
      password: 'Password123!',
      role: 'employee',
      department: 'Engineering',
      employeeId: 'EMP-001',
      managerId: manager._id,
      isActive: true,
    });

    const employee2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@attendx.com',
      password: 'Password123!',
      role: 'employee',
      department: 'Engineering',
      employeeId: 'EMP-002',
      managerId: manager._id,
      isActive: true,
    });

    console.log('Demo users created.');

    // 4. Create sample attendance records
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    // Sample placeholder 1x1 png base64 for selfie
    const sampleSelfie =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const att1 = await Attendance.create({
      userId: employee1._id,
      date: yesterday,
      punchIn: dayjs().subtract(1, 'day').hour(9).minute(0).toDate(),
      punchOut: dayjs().subtract(1, 'day').hour(17).minute(30).toDate(),
      selfieUrl: sampleSelfie,
      location: {
        latitude: 28.6139,
        longitude: 77.209,
        address: 'Connaught Place, New Delhi',
      },
      totalHours: 8.5,
      status: 'completed',
      validationStatus: 'valid',
      remarks: 'Verified on site',
      reviewedBy: manager._id,
    });

    const att2 = await Attendance.create({
      userId: employee2._id,
      date: yesterday,
      punchIn: dayjs().subtract(1, 'day').hour(9).minute(30).toDate(),
      punchOut: dayjs().subtract(1, 'day').hour(16).minute(0).toDate(),
      selfieUrl: sampleSelfie,
      location: {
        latitude: 28.5355,
        longitude: 77.391,
        address: 'Sector 62, Noida',
      },
      totalHours: 6.5,
      status: 'incomplete',
      validationStatus: 'pending',
      remarks: '',
    });

    // Overtime request for incomplete shift
    await OvertimeRequest.create({
      userId: employee2._id,
      attendanceId: att2._id,
      date: yesterday,
      requestedHours: 1.5,
      reason: 'Urgent bug fix deployment after shift',
      status: 'pending',
    });

    console.log('\n=============================================');
    console.log(' SEED COMPLETED SUCCESSFULLY');
    console.log('=============================================');
    console.log('Demo Credentials (all use Password: Password123!)');
    console.log('---------------------------------------------');
    console.log('Admin:    admin@attendx.com    / Password123!');
    console.log('Manager:  manager@attendx.com  / Password123!');
    console.log('Employee: employee@attendx.com / Password123!');
    console.log('Employee: jane@attendx.com     / Password123!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
