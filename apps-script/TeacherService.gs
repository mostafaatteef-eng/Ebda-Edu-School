/**
 * EBDA EDU — Teacher Management & Workload Analytics Service
 * Official Standard: 25 Lessons Weekly Target (25 Hours at 60 min/lesson).
 */

const TeacherService = {
  getAllTeachers: function () {
    const teachers = SpreadsheetService.getAll('Teachers');
    return teachers.map((t) => ({
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
    }));
  },

  createTeacher: function (data, user) {
    if (!data.name || !data.code || !data.specialization) {
      throw new Error('اسم المعلم، الكود، والتخصص حقول مطلوبة.');
    }

    const settings = SettingsService.getSettings();
    const target = Number(data.targetWeeklyLessons) || settings.weeklyTeachingTarget || 25;

    const record = {
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

    const created = SpreadsheetService.insert('Teachers', record);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_TEACHER',
      entityType: 'teacher',
      entityId: created.id,
      description: 'إضافة معلم جديد: ' + created.name + ' (' + created.code + ')',
    });

    return created;
  },

  updateTeacher: function (id, updates, user) {
    const existing = SpreadsheetService.findById('Teachers', id);
    if (!existing) throw new Error('المعلم غير موجود.');

    const updated = SpreadsheetService.update('Teachers', id, updates);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_TEACHER',
      entityType: 'teacher',
      entityId: id,
      description: 'تحديث بيانات المعلم: ' + existing.name,
    });

    return updated;
  },

  deleteTeacher: function (id, user) {
    const existing = SpreadsheetService.findById('Teachers', id);
    if (!existing) return true;

    SpreadsheetService.deleteById('Teachers', id);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_TEACHER',
      entityType: 'teacher',
      entityId: id,
      description: 'حذف المعلم: ' + existing.name,
    });

    return true;
  },

  /**
   * Calculates teacher workload statistics against official 25-lesson standard.
   */
  calculateWorkload: function (teacherId) {
    const teacher = SpreadsheetService.findById('Teachers', teacherId);
    const settings = SettingsService.getSettings();
    const lessonDuration = Number(settings.lessonDurationMinutes) || 60;
    const targetLessons = teacher ? Number(teacher.targetWeeklyLessons) || 25 : 25;
    const targetHours = (targetLessons * lessonDuration) / 60;

    const allSlots = SpreadsheetService.getAll('Timetable');
    const teacherSlots = allSlots.filter((s) => String(s.teacherId) === String(teacherId));
    const scheduledLessonsCount = teacherSlots.length;
    const scheduledHours = (scheduledLessonsCount * lessonDuration) / 60;

    const allRecords = SpreadsheetService.getAll('TeachingRecords');
    const teacherRecords = allRecords.filter((r) => String(r.teacherId) === String(teacherId));
    const completedRecords = teacherRecords.filter((r) => r.lessonStatus === 'completed');
    const completedCount = completedRecords.length;

    const recordsWithMaterials = completedRecords.filter((r) => r.materialsUrl && String(r.materialsUrl).trim() !== '');

    const documentationRate = scheduledLessonsCount > 0 ? Math.round((completedCount / scheduledLessonsCount) * 100) : 0;
    const materialsCoverageRate = completedCount > 0 ? Math.round((recordsWithMaterials.length / completedCount) * 100) : 0;

    let workloadStatus = 'balanced';
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
