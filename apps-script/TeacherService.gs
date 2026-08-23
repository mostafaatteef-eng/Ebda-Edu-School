/**
 * EBDA EDU — Teacher Management & Workload Analytics Service
 * Official Standard: 25 Lessons Weekly Target (25 Hours at 60 min/lesson).
 */

var TeacherService = {
  getAllTeachers: function () {
    var teachers = SpreadsheetService.getAll('Teachers');
    return teachers.map(function (t) {
      return {
        id: t.id,
        code: t.code,
        name: t.name,
        specialization: t.specialization,
        department: t.department || '',
        email: t.email || '',
        phone: t.phone || '',
        targetWeeklyLessons: Number(t.targetWeeklyLessons) || 25,
        active: t.active === true || t.active === 'true',
        schoolId: t.schoolId || 'badr',
      };
    });
  },

  createTeacher: function (data, user) {
    if (!data.name || !data.code || !data.specialization) {
      throw new Error('اسم المعلم، الكود، والتخصص حقول مطلوبة.');
    }

    var settings = SettingsService.getSettings();
    var target = Number(data.targetWeeklyLessons) || settings.weeklyTeachingTarget || 25;

    var record = {
      id: Utils.generateUUID(),
      code: data.code,
      name: data.name,
      specialization: data.specialization,
      department: data.department || 'التعليم التكنولوجي',
      email: data.email || '',
      phone: data.phone || '',
      targetWeeklyLessons: target,
      active: data.active !== false && data.active !== 'false',
      schoolId: data.schoolId || 'badr',
    };

    var created = SpreadsheetService.insert('Teachers', record);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_TEACHER',
        entityType: 'teacher',
        entityId: created.id,
        description: 'إضافة معلم جديد: ' + created.name + ' (' + created.code + ')',
      });
    } catch (e) {}

    return created;
  },

  updateTeacher: function (id, updates, user) {
    var existing = SpreadsheetService.findById('Teachers', id);
    if (!existing) throw new Error('المعلم غير موجود.');

    var updated = SpreadsheetService.update('Teachers', id, updates);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'UPDATE_TEACHER',
        entityType: 'teacher',
        entityId: id,
        description: 'تحديث بيانات المعلم: ' + existing.name,
      });
    } catch (e) {}

    return updated;
  },

  deleteTeacher: function (id, user) {
    var existing = SpreadsheetService.findById('Teachers', id);
    if (!existing) return true;

    SpreadsheetService.deleteById('Teachers', id);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'DELETE_TEACHER',
        entityType: 'teacher',
        entityId: id,
        description: 'حذف المعلم: ' + existing.name,
      });
    } catch (e) {}

    return true;
  },

  /**
   * Calculates teacher workload statistics against official 25-lesson standard.
   */
  calculateWorkload: function (teacherId) {
    var teacher = SpreadsheetService.findById('Teachers', teacherId);
    var settings = SettingsService.getSettings();
    var lessonDuration = Number(settings.lessonDurationMinutes) || 60;
    var targetLessons = teacher ? Number(teacher.targetWeeklyLessons) || 25 : 25;
    var targetHours = (targetLessons * lessonDuration) / 60;

    var allSlots = SpreadsheetService.getAll('Timetable');
    var teacherSlots = allSlots.filter(function (s) {
      return String(s.teacherId) === String(teacherId);
    });
    var scheduledLessonsCount = teacherSlots.length;
    var scheduledHours = (scheduledLessonsCount * lessonDuration) / 60;

    var allRecords = SpreadsheetService.getAll('TeachingRecords');
    var teacherRecords = allRecords.filter(function (r) {
      return String(r.teacherId) === String(teacherId);
    });
    var completedRecords = teacherRecords.filter(function (r) {
      return r.lessonStatus === 'completed';
    });
    var completedCount = completedRecords.length;

    var recordsWithMaterials = completedRecords.filter(function (r) {
      return r.materialsUrl && String(r.materialsUrl).trim() !== '';
    });

    var documentationRate = scheduledLessonsCount > 0 ? Math.round((completedCount / scheduledLessonsCount) * 100) : 0;
    var materialsCoverageRate = completedCount > 0 ? Math.round((recordsWithMaterials.length / completedCount) * 100) : 0;

    var workloadStatus = 'balanced';
    if (scheduledLessonsCount > targetLessons) workloadStatus = 'overloaded';
    else if (scheduledLessonsCount < targetLessons) workloadStatus = 'underloaded';

    return {
      teacherId: teacherId,
      teacherName: teacher ? teacher.name : '',
      specialization: teacher ? teacher.specialization : '',
      targetWeeklyLessons: targetLessons,
      targetWeeklyHours: targetHours,
      actualScheduledLessons: scheduledLessonsCount,
      actualScheduledHours: scheduledHours,
      completedLessonsCount: completedCount,
      varianceLessons: scheduledLessonsCount - targetLessons,
      varianceHours: scheduledHours - targetHours,
      achievementPercentage: targetLessons > 0 ? Math.round((completedCount / targetLessons) * 100) : 0,
      documentationRate: documentationRate,
      materialsCoverageRate: materialsCoverageRate,
      workloadStatus: workloadStatus,
    };
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.TeacherService = TeacherService;
}
if (typeof global !== 'undefined') {
  global.TeacherService = TeacherService;
}
