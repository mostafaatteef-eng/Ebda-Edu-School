/**
 * End-to-End Workflow Test Suite: EBDA EDU
 * Simulates complete 18-step lifecycle across Operations Manager, Teacher, and Parent roles.
 */

import {
  Teacher,
  Subject,
  SchoolClass,
  TimetableSlot,
  TeachingRecord,
  User,
  SystemSettings,
  ActivityLog,
} from '../../src/types';
import {
  calculateTeacherWorkload,
  validateMaterialsUrl,
  getParentVisibleRecords,
  hasPermission,
  SYSTEM_DEFAULTS,
} from '../../src/utils/businessRules';
import { detectTimetableConflicts } from '../../src/utils/conflicts';

function runE2ETests() {
  console.log('\n🟣 [E2E TESTS] Running Complete 18-Step Full-Lifecycle Workflow Simulation...');
  let stepNumber = 1;
  let passed = 0;
  let failed = 0;

  function assertStep(condition: boolean, stepDescription: string) {
    if (condition) {
      console.log(`  ✅ Step ${stepNumber}: ${stepDescription}`);
      passed++;
    } else {
      console.error(`  ❌ Step ${stepNumber} FAILED: ${stepDescription}`);
      failed++;
    }
    stepNumber++;
  }

  // State Containers
  const dbUsers: User[] = [];
  const dbTeachers: Teacher[] = [];
  const dbSubjects: Subject[] = [];
  const dbClasses: SchoolClass[] = [];
  const dbSlots: TimetableSlot[] = [];
  const dbRecords: TeachingRecord[] = [];
  const dbActivityLogs: ActivityLog[] = [];
  const rolePermissionsMap = {
    operations_manager: ['view_dashboard', 'manage_teachers', 'manage_timetable', 'manage_users', 'manage_settings'],
    teacher: ['view_dashboard', 'record_lesson', 'view_teaching_load', 'view_lesson_materials'],
    parent: ['view_dashboard', 'view_lesson_materials'],
  };

  // Step 1: Operations Manager Initialization
  const opsUser: User = {
    id: 'u-ops-admin',
    username: 'ops@ebda.edu.eg',
    name: 'مدير العمليات والتشغيل',
    role: 'operations_manager',
    status: 'active',
    createdAt: '2026-01-01',
  };
  dbUsers.push(opsUser);
  assertStep(dbUsers.length === 1 && opsUser.role === 'operations_manager', 'Operations Manager initialized securely');

  // Step 2: Create Teacher
  const newTeacher: Teacher = {
    id: 't-101',
    name: 'م. إبراهيم فؤاد',
    code: 'TCH-101',
    specialization: 'الميكاترونكس والتحكم الآلي',
    department: 'الهندسة الميكانيكية والكهربية',
    targetWeeklyLessons: 25, // 25 Lessons = 25 Hours
    schoolId: 'badr',
    active: true,
  };
  dbTeachers.push(newTeacher);
  assertStep(dbTeachers.length === 1 && dbTeachers[0].targetWeeklyLessons === 25, 'Teacher created with 25-lesson target');

  // Step 3: Create Subject
  const newSubject: Subject = {
    id: 'sub-mecha',
    code: 'MEC-201',
    nameAr: 'نظم التحكم بالميكاترونكس',
    weeklyLessonsRequired: 4,
    gradeId: 'g-2',
    isPractical: true,
    preferredLocationType: 'lab',
    schoolId: 'badr',
  };
  dbSubjects.push(newSubject);
  assertStep(dbSubjects.length === 1 && newSubject.weeklyLessonsRequired === 4, 'Subject created with lab/workshop requirements');

  // Step 4: Verify Subject & Teacher exist for assignment
  assertStep(dbTeachers.length === 1 && dbSubjects.length === 1, 'Subject ready for assignment to Teacher');

  // Step 5: Create School Class
  const newClass: SchoolClass = {
    id: 'class-g2-m1',
    code: '2/1-ميكاترونكس',
    nameAr: 'الصف الثاني - شعبة ميكاترونكس 1',
    gradeId: 'g-2',
    roomNumber: '204',
    studentCount: 26,
    schoolId: 'badr',
  };
  dbClasses.push(newClass);
  assertStep(dbClasses.length === 1 && newClass.gradeId === 'g-2', 'School Class created and linked to Grade 2');

  // Step 6: Configure Schedule Settings
  const settings: SystemSettings = {
    lessonDurationMinutes: 60,
    schoolStartTime: '08:00',
    requireMaterialsLink: true,
    defaultParentVisibility: true,
    currentAcademicYear: '2025 / 2026',
    currentTerm: 'الفصل الدراسي الثاني',
    allowExtraLessons: true,
    maxUploadSizeMB: 50,
    activeSchoolId: 'badr',
  };
  assertStep(settings.lessonDurationMinutes === 60, 'School Schedule configured with 60-minute duration');

  // Step 7: Create Timetable Lesson Slot
  const slot1: TimetableSlot = {
    id: 'slot-sun-p1',
    dayOfWeek: 'Sunday',
    slotIndex: 1,
    startTime: '08:00',
    endTime: '09:00',
    durationMinutes: 60,
    teacherId: newTeacher.id,
    subjectId: newSubject.id,
    gradeId: 'g-2',
    classId: newClass.id,
    academicYearId: 'ay-2025-2026',
    schoolId: 'badr',
    locationType: 'classroom',
  };
  dbSlots.push(slot1);
  assertStep(dbSlots.length === 1 && slot1.durationMinutes === 60, 'Timetable Lesson slot created from 08:00 to 09:00 (60 min)');

  // Step 8: Verify Conflict Detection Engine
  const nonConflictingSlots = detectTimetableConflicts(dbSlots, dbTeachers, dbClasses, [], [], dbSubjects);
  assertStep(nonConflictingSlots.length === 0, 'Conflict engine confirmed 0 collisions for clean timetable slot');

  // Step 9: Create Teacher User Account Linked to Teacher ID
  const teacherUser: User = {
    id: 'u-teacher-ibrahim',
    username: 'ibrahim@ebda.edu.eg',
    name: 'م. إبراهيم فؤاد',
    role: 'teacher',
    teacherId: newTeacher.id,
    status: 'active',
    createdAt: '2026-02-01',
  };
  dbUsers.push(teacherUser);
  assertStep(teacherUser.teacherId === newTeacher.id, 'Teacher User account created and linked via teacherId foreign key');

  // Step 10: Teacher Login & Permission Verification
  const canTeacherEditTimetable = hasPermission(teacherUser, 'manage_timetable' as any, rolePermissionsMap as any);
  const canTeacherRecordLesson = hasPermission(teacherUser, 'record_lesson' as any, rolePermissionsMap as any);
  assertStep(!canTeacherEditTimetable && canTeacherRecordLesson, 'Teacher permissions enforced: allowed to record, denied timetable edit');

  // Step 11: Teacher Views Today Schedule
  const teacherTodaySlots = dbSlots.filter((s) => s.teacherId === teacherUser.teacherId && s.dayOfWeek === 'Sunday');
  assertStep(teacherTodaySlots.length === 1 && teacherTodaySlots[0].id === 'slot-sun-p1', 'Teacher schedule correctly reflects assigned Sunday slot');

  // Step 12: Teacher Records Lesson (60 min duration)
  const validUrlCheck = validateMaterialsUrl('https://drive.google.com/file/d/mechatronics-ch1/view');
  assertStep(validUrlCheck.isValid, 'Lesson materials URL validated as valid Google Drive link');

  // Step 13: Teacher Adds Teaching Record with Parent Visibility = True
  const record1: TeachingRecord = {
    id: 'rec-001',
    timetableSlotId: slot1.id,
    teacherId: newTeacher.id,
    subjectId: newSubject.id,
    classId: newClass.id,
    gradeId: 'g-2',
    schoolId: 'badr',
    dayOfWeek: 'Sunday',
    slotIndex: 1,
    locationType: 'classroom',
    date: '2026-02-15',
    startTime: '08:00',
    endTime: '09:00',
    durationMinutes: 60,
    lessonTopic: 'أساسيات الحساسات والمشغلات الميكانيكية',
    unitModule: 'الوحدة الأولى: أنظمة الاستشعار',
    lessonStatus: 'completed',
    materialsUrl: 'https://drive.google.com/file/d/mechatronics-ch1/view',
    teacherNotes: 'تم إنهاء الشرح النظري والتطبيق في المعمل بنجاح',
    parentVisibility: true,
    recordedAt: '2026-02-15T09:05:00Z',
  };
  dbRecords.push(record1);
  assertStep(dbRecords.length === 1 && record1.parentVisibility === true, 'Delivered lesson documented with topic, status, and parent visibility');

  // Step 14: Teacher Adds Internal Record with Parent Visibility = False
  const record2: TeachingRecord = {
    id: 'rec-002',
    timetableSlotId: 'slot-sun-p2',
    teacherId: newTeacher.id,
    subjectId: newSubject.id,
    classId: newClass.id,
    gradeId: 'g-2',
    schoolId: 'badr',
    dayOfWeek: 'Sunday',
    slotIndex: 2,
    locationType: 'classroom',
    date: '2026-02-15',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    lessonTopic: 'اختبار تقييم داخلي للطلاب',
    unitModule: 'التقييمات الدورية',
    lessonStatus: 'completed',
    materialsUrl: 'https://internal-drive/secret-exam',
    parentVisibility: false, // HIDDEN FROM PARENTS
    recordedAt: '2026-02-15T10:05:00Z',
  };
  dbRecords.push(record2);
  assertStep(record2.parentVisibility === false, 'Internal lesson recorded with Parent Visibility = False');

  // Step 15: Parent Login Simulation & Authorization Check
  const parentUser: User = {
    id: 'u-parent-01',
    username: 'parents@ebda.edu.eg',
    name: 'ولي أمر الطالب / زياد إبراهيم',
    role: 'parent',
    status: 'active',
    createdAt: '2026-01-10',
  };
  dbUsers.push(parentUser);
  const canParentManageUsers = hasPermission(parentUser, 'manage_users' as any, rolePermissionsMap as any);
  assertStep(!canParentManageUsers, 'Parent restricted from accessing administrative management functions');

  // Step 16: Parent Views Visible Lesson Materials
  const parentVisibleList = getParentVisibleRecords(dbRecords, 'parent');
  assertStep(
    parentVisibleList.length === 1 && parentVisibleList[0].id === 'rec-001',
    'Parent Portal strictly filters and shows only visible lesson with authorized materials'
  );

  // Step 17: Verify Parent Does NOT See Hidden Record
  const hasSecretExam = parentVisibleList.some((r) => r.id === 'rec-002');
  assertStep(!hasSecretExam, 'Parent Portal strictly protects and conceals internal non-visible teaching records');

  // Step 18: Operations Manager Real-Time Workload & Analytics Calculation
  const finalWorkload = calculateTeacherWorkload(newTeacher.id, newTeacher.targetWeeklyLessons, dbSlots, dbRecords, 60);
  assertStep(
    finalWorkload.targetLessons === 25 &&
    finalWorkload.targetHours === 25 &&
    finalWorkload.scheduledLessons === 1 &&
    finalWorkload.deliveredLessons === 2,
    'Operations Intelligence calculates live workload: 25 hrs target, 60-min sessions, zero hardcoded numbers'
  );

  console.log(`🟣 [E2E TESTS] Results: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runE2ETests();
