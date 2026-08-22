/**
 * Unit Tests: EBDA EDU Core Business Rules
 * Validates 60-Minute Lesson Calculations, Teaching Load Calculations,
 * Material URL Validation, and Parent Visibility Rules.
 */

import {
  calculateTeacherWorkload,
  validateMaterialsUrl,
  getParentVisibleRecords,
  hasPermission,
  isSlotOverlappingBreak,
  calculateBreakDuration,
  SYSTEM_DEFAULTS,
} from '../../src/utils/businessRules';
import { hashPassword, validatePassword, validatePasswordPolicy, verifyPasswordHash } from '../../src/utils/security';
import { TimetableSlot, TeachingRecord, User, PermissionKey, SchoolBreak, DayOfWeek } from '../../src/types';

function runUnitTests() {
  console.log('\n🔵 [UNIT TESTS] Running Core Business Rules Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. System Defaults
  assert(SYSTEM_DEFAULTS.LESSON_DURATION_MINUTES === 60, 'Default lesson duration must be exactly 60 minutes');
  assert(SYSTEM_DEFAULTS.TARGET_WEEKLY_LESSONS === 25, 'Standard target weekly lessons must be 25');

  // 2. Workload & Duration Calculations
  const mockSlots: TimetableSlot[] = [
    {
      id: 's1',
      dayOfWeek: 'Sunday',
      slotIndex: 1,
      startTime: '08:00',
      endTime: '09:00',
      durationMinutes: 60,
      teacherId: 't1',
      subjectId: 'sub1',
      gradeId: 'g1',
      classId: 'c1',
      academicYearId: 'ay1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
    {
      id: 's2',
      dayOfWeek: 'Sunday',
      slotIndex: 2,
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      teacherId: 't1',
      subjectId: 'sub1',
      gradeId: 'g1',
      classId: 'c1',
      academicYearId: 'ay1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
  ];

  const mockRecords: TeachingRecord[] = [
    {
      id: 'rec1',
      timetableSlotId: 's1',
      teacherId: 't1',
      subjectId: 'sub1',
      classId: 'c1',
      gradeId: 'g1',
      schoolId: 'badr',
      dayOfWeek: 'Sunday',
      slotIndex: 1,
      locationType: 'classroom',
      date: '2026-02-15',
      startTime: '08:00',
      endTime: '09:00',
      durationMinutes: 60,
      lessonTopic: 'Introduction to Applied Tech',
      lessonStatus: 'completed',
      materialsUrl: 'https://drive.google.com/file/d/123/view',
      parentVisibility: true,
      recordedAt: '2026-02-15T09:00:00Z',
    },
  ];

  const workload = calculateTeacherWorkload('t1', 24, mockSlots, mockRecords, 60);
  assert(workload.targetLessons === 24, 'Target lessons should equal 24');
  assert(workload.targetHours === 24, 'Target hours should equal 24 hours (24 × 60 min)');
  assert(workload.scheduledLessons === 2, 'Scheduled lessons should equal 2');
  assert(workload.scheduledHours === 2, 'Scheduled hours should equal 2 hours');
  assert(workload.deliveredLessons === 1, 'Delivered lessons should equal 1');
  assert(workload.deliveredHours === 1, 'Delivered hours should equal 1 hour');
  assert(workload.varianceLessons === -22, 'Variance lessons should be -22');
  assert(workload.varianceHours === -22, 'Variance hours should be -22');
  assert(workload.achievementPercentage === 8.3, 'Achievement percentage should be 8.3%');
  assert(workload.documentationPercentage === 50, 'Documentation percentage should be 50%');

  // Zero State Protection (no divide by zero)
  const zeroWorkload = calculateTeacherWorkload('t-none', 0, [], [], 60);
  assert(zeroWorkload.achievementPercentage === 0, 'Zero target should safely return 0% achievement');
  assert(!isNaN(zeroWorkload.achievementPercentage), 'Achievement percentage must not be NaN');

  // 3. URL Validation
  const validDrive = validateMaterialsUrl('https://drive.google.com/file/d/abc12345/view');
  assert(validDrive.isValid, 'Valid Google Drive URL should pass validation');

  const validOneDrive = validateMaterialsUrl('https://onedrive.live.com/?id=abc');
  assert(validOneDrive.isValid, 'Valid OneDrive URL should pass validation');

  const invalidUrl = validateMaterialsUrl('ftp://invalid-server.com');
  assert(!invalidUrl.isValid, 'Non-HTTP(S) protocol should fail validation');

  const emptyUrl = validateMaterialsUrl('');
  assert(!emptyUrl.isValid, 'Empty string URL should fail validation');

  // 4. Parent Visibility Filtering
  const privateRecord: TeachingRecord = {
    id: 'rec2',
    timetableSlotId: 's2',
    teacherId: 't1',
    subjectId: 'sub1',
    classId: 'c1',
    gradeId: 'g1',
    schoolId: 'badr',
    dayOfWeek: 'Sunday',
    slotIndex: 2,
    locationType: 'classroom',
    date: '2026-02-15',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    lessonTopic: 'Internal Assessment Prep',
    lessonStatus: 'completed',
    materialsUrl: 'https://internal.school/secret',
    parentVisibility: false,
    recordedAt: '2026-02-15T10:00:00Z',
  };

  const allRecords = [mockRecords[0], privateRecord];
  const parentVisible = getParentVisibleRecords(allRecords, 'parent');
  assert(parentVisible.length === 1, 'Parents should only see 1 record where parentVisibility is true');
  assert(parentVisible[0].id === 'rec1', 'Parents should not receive internal/hidden records');

  const opsRecords = getParentVisibleRecords(allRecords, 'operations_manager');
  assert(opsRecords.length === 2, 'Operations Manager should receive all records regardless of parent visibility');

  // 5. RBAC Permission Checks
  const mockTeacherUser: User = {
    id: 'u-teacher',
    username: 'teacher1@ebda.edu.eg',
    name: 'أحمد محمود',
    role: 'teacher',
    status: 'active',
    createdAt: '2026-01-01',
  };

  const rolePermissions: Record<string, PermissionKey[]> = {
    teacher: ['view_dashboard', 'record_lesson', 'view_lesson_materials'],
    parent: ['view_dashboard', 'view_lesson_materials'],
  };

  assert(
    hasPermission(mockTeacherUser, 'record_lesson', rolePermissions) === true,
    'Teacher should have record_lesson permission'
  );
  assert(
    hasPermission(mockTeacherUser, 'manage_timetable', rolePermissions) === false,
    'Teacher must NOT have manage_timetable permission'
  );
  assert(
    hasPermission(mockTeacherUser, 'manage_users', rolePermissions) === false,
    'Teacher must NOT have manage_users permission'
  );

  const disabledUser: User = { ...mockTeacherUser, status: 'disabled' };
  assert(
    hasPermission(disabledUser, 'record_lesson', rolePermissions) === false,
    'Disabled user must have all permissions revoked'
  );

  // 6. School Breaks Conflict & Overlap Engine Tests
  const mockBreaks: SchoolBreak[] = [
    {
      id: 'brk-morning',
      name: 'Morning Break',
      type: 'break',
      startTime: '10:00',
      endTime: '10:30',
      durationMinutes: 30,
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      status: 'active',
      schoolId: 'badr',
    },
    {
      id: 'brk-disabled',
      name: 'Disabled Break',
      type: 'break',
      startTime: '13:00',
      endTime: '13:30',
      durationMinutes: 30,
      daysOfWeek: ['Sunday' as DayOfWeek],
      status: 'disabled',
      schoolId: 'badr',
    },
  ];

  // Slot overlapping 10:00 - 10:30 active break
  const overlappingSlot = {
    dayOfWeek: 'Sunday' as DayOfWeek,
    startTime: '09:30',
    endTime: '10:30',
  };
  const overlapCheck = isSlotOverlappingBreak(overlappingSlot, mockBreaks);
  assert(overlapCheck.hasConflict === true, 'Slot overlapping active morning break must trigger conflict');
  assert(overlapCheck.conflictingBreak?.id === 'brk-morning', 'Conflicting break must match morning break ID');

  // Slot during inactive break
  const inactiveBreakSlot = {
    dayOfWeek: 'Sunday' as DayOfWeek,
    startTime: '13:00',
    endTime: '14:00',
  };
  const inactiveCheck = isSlotOverlappingBreak(inactiveBreakSlot, mockBreaks);
  assert(inactiveCheck.hasConflict === false, 'Slot during inactive break should not trigger conflict');

  // Non-overlapping slot
  const clearSlot = {
    dayOfWeek: 'Sunday' as DayOfWeek,
    startTime: '08:00',
    endTime: '09:00',
  };
  const clearCheck = isSlotOverlappingBreak(clearSlot, mockBreaks);
  assert(clearCheck.hasConflict === false, 'Slot before break time should not trigger conflict');

  assert(calculateBreakDuration('10:00', '10:30') === 30, 'Break duration calculation 10:00-10:30 must be 30 minutes');
  assert(calculateBreakDuration('12:00', '13:15') === 75, 'Break duration calculation 12:00-13:15 must be 75 minutes');

  // 7. Security: Password Hashing & Policy Validation
  const plainPass = 'SecureAdmin2026';
  const hashed = hashPassword(plainPass);
  assert(hashed !== plainPass, 'Hashed password must not equal plain text');
  assert(verifyPasswordHash(plainPass, hashed) === true, 'Valid password verification against hash must succeed');
  assert(verifyPasswordHash('WrongPassword', hashed) === false, 'Invalid password verification against hash must fail');

  assert(validatePasswordPolicy('abc').isValid === false, 'Short password (3 chars) must fail policy');
  assert(validatePasswordPolicy('password123').isValid === true, 'Valid 8+ char password with digits must pass policy');

  console.log(`🔵 [UNIT TESTS] Results: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runUnitTests();
