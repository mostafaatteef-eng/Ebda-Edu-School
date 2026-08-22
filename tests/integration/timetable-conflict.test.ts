/**
 * Integration Tests: EBDA EDU Timetable Conflict Detection Engine
 * Validates teacher collision detection, class collision detection,
 * lab reservation conflicts, workshop reservation conflicts, and adjacent non-conflicting slots.
 */

import { detectTimetableConflicts } from '../../src/utils/conflicts';
import { TimetableSlot, Teacher, SchoolClass, Lab, Workshop, Subject } from '../../src/types';

function runIntegrationTests() {
  console.log('\n🟢 [INTEGRATION TESTS] Running Timetable Conflict Detection Tests...');
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

  const mockTeachers: Teacher[] = [
    {
      id: 't-1',
      name: 'م. أحمد خالد',
      code: 'TCH-01',
      specialization: 'شبكات واتصالات',
      department: 'تكنولوجيا المعلومات',
      targetWeeklyLessons: 20,
      schoolId: 'badr',
      active: true,
    },
    {
      id: 't-2',
      name: 'م. سارة محمود',
      code: 'TCH-02',
      specialization: 'إلكترونيات صناعية',
      department: 'الكهرباء والتحكم',
      targetWeeklyLessons: 20,
      schoolId: 'badr',
      active: true,
    },
  ];

  const mockClasses: SchoolClass[] = [
    {
      id: 'c-1',
      code: 'G1-A',
      nameAr: 'فصل 1/1 - شبكات',
      gradeId: 'g-1',
      roomNumber: '101',
      studentCount: 25,
      schoolId: 'badr',
    },
    {
      id: 'c-2',
      code: 'G1-B',
      nameAr: 'فصل 1/2 - إلكترونيات',
      gradeId: 'g-1',
      roomNumber: '102',
      studentCount: 25,
      schoolId: 'badr',
    },
  ];

  const mockLabs: Lab[] = [
    {
      id: 'lab-net',
      code: 'LAB-01',
      nameAr: 'معمل هندسة الشبكات',
      capacity: 30,
      location: 'مبنى B - الدور الثاني',
      schoolId: 'badr',
    },
  ];

  const mockWorkshops: Workshop[] = [
    {
      id: 'ws-elec',
      code: 'WS-01',
      nameAr: 'ورشة الإلكترونيات والدوائر',
      capacity: 25,
      location: 'المبنى الصناعي',
      schoolId: 'badr',
    },
  ];

  const mockSubjects: Subject[] = [
    {
      id: 'sub-1',
      code: 'NET-101',
      nameAr: 'أساسيات الشبكات',
      weeklyLessonsRequired: 4,
      gradeId: 'g-1',
      isPractical: true,
      preferredLocationType: 'lab',
      schoolId: 'badr',
    },
    {
      id: 'sub-2',
      code: 'ELC-101',
      nameAr: 'الدوائر الإلكترونية',
      weeklyLessonsRequired: 4,
      gradeId: 'g-1',
      isPractical: true,
      preferredLocationType: 'workshop',
      schoolId: 'badr',
    },
  ];

  // 1. Teacher Double-Booking Collision
  const teacherConflictSlots: TimetableSlot[] = [
    {
      id: 'slot-1',
      dayOfWeek: 'Monday',
      slotIndex: 1,
      startTime: '08:00',
      endTime: '09:00',
      durationMinutes: 60,
      teacherId: 't-1', // Same teacher
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-1', // Class 1
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
    {
      id: 'slot-2',
      dayOfWeek: 'Monday',
      slotIndex: 1,
      startTime: '08:00',
      endTime: '09:00',
      durationMinutes: 60,
      teacherId: 't-1', // Same teacher
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-2', // Class 2
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
  ];

  const teacherConflicts = detectTimetableConflicts(
    teacherConflictSlots,
    mockTeachers,
    mockClasses,
    mockLabs,
    mockWorkshops,
    mockSubjects
  );
  assert(teacherConflicts.length === 1, 'Should detect exactly 1 teacher collision');
  assert(teacherConflicts[0].type === 'teacher', 'Conflict type should be "teacher"');

  // 2. Class Double-Booking Collision
  const classConflictSlots: TimetableSlot[] = [
    {
      id: 'slot-3',
      dayOfWeek: 'Tuesday',
      slotIndex: 2,
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      teacherId: 't-1',
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-1', // Same class
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
    {
      id: 'slot-4',
      dayOfWeek: 'Tuesday',
      slotIndex: 2,
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      teacherId: 't-2',
      subjectId: 'sub-2',
      gradeId: 'g-1',
      classId: 'c-1', // Same class
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
  ];

  const classConflicts = detectTimetableConflicts(
    classConflictSlots,
    mockTeachers,
    mockClasses,
    mockLabs,
    mockWorkshops,
    mockSubjects
  );
  assert(classConflicts.length === 1, 'Should detect exactly 1 class collision');
  assert(classConflicts[0].type === 'class', 'Conflict type should be "class"');

  // 3. Lab Double-Booking Collision
  const labConflictSlots: TimetableSlot[] = [
    {
      id: 'slot-5',
      dayOfWeek: 'Wednesday',
      slotIndex: 3,
      startTime: '10:30',
      endTime: '11:30',
      durationMinutes: 60,
      teacherId: 't-1',
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-1',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'lab',
      labId: 'lab-net',
    },
    {
      id: 'slot-6',
      dayOfWeek: 'Wednesday',
      slotIndex: 3,
      startTime: '10:30',
      endTime: '11:30',
      durationMinutes: 60,
      teacherId: 't-2',
      subjectId: 'sub-2',
      gradeId: 'g-1',
      classId: 'c-2',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'lab',
      labId: 'lab-net',
    },
  ];

  const labConflicts = detectTimetableConflicts(
    labConflictSlots,
    mockTeachers,
    mockClasses,
    mockLabs,
    mockWorkshops,
    mockSubjects
  );
  assert(labConflicts.length === 1, 'Should detect exactly 1 lab collision');
  assert(labConflicts[0].type === 'lab', 'Conflict type should be "lab"');

  // 4. Workshop Double-Booking Collision
  const workshopConflictSlots: TimetableSlot[] = [
    {
      id: 'slot-7',
      dayOfWeek: 'Thursday',
      slotIndex: 4,
      startTime: '11:30',
      endTime: '12:30',
      durationMinutes: 60,
      teacherId: 't-1',
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-1',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'workshop',
      workshopId: 'ws-elec',
    },
    {
      id: 'slot-8',
      dayOfWeek: 'Thursday',
      slotIndex: 4,
      startTime: '11:30',
      endTime: '12:30',
      durationMinutes: 60,
      teacherId: 't-2',
      subjectId: 'sub-2',
      gradeId: 'g-1',
      classId: 'c-2',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'workshop',
      workshopId: 'ws-elec',
    },
  ];

  const wsConflicts = detectTimetableConflicts(
    workshopConflictSlots,
    mockTeachers,
    mockClasses,
    mockLabs,
    mockWorkshops,
    mockSubjects
  );
  assert(wsConflicts.length === 1, 'Should detect exactly 1 workshop collision');
  assert(wsConflicts[0].type === 'workshop', 'Conflict type should be "workshop"');

  // 5. Valid Non-Conflicting Schedule (different slots / days)
  const validScheduleSlots: TimetableSlot[] = [
    {
      id: 'valid-1',
      dayOfWeek: 'Sunday',
      slotIndex: 1,
      startTime: '08:00',
      endTime: '09:00',
      durationMinutes: 60,
      teacherId: 't-1',
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-1',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
    {
      id: 'valid-2',
      dayOfWeek: 'Sunday',
      slotIndex: 2, // Next hour (different slot)
      startTime: '09:00',
      endTime: '10:00',
      durationMinutes: 60,
      teacherId: 't-1', // Same teacher in sequential non-overlapping hour
      subjectId: 'sub-1',
      gradeId: 'g-1',
      classId: 'c-2',
      academicYearId: 'ay-1',
      schoolId: 'badr',
      locationType: 'classroom',
    },
  ];

  const validConflicts = detectTimetableConflicts(
    validScheduleSlots,
    mockTeachers,
    mockClasses,
    mockLabs,
    mockWorkshops,
    mockSubjects
  );
  assert(validConflicts.length === 0, 'Sequential non-overlapping slots should produce 0 conflicts');

  console.log(`🟢 [INTEGRATION TESTS] Results: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runIntegrationTests();
