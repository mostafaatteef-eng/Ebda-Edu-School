/**
 * EBDA EDU — Teaching Record Service (What Was Taught)
 * Captures delivered topics, materials URLs, and parent visibility.
 */

var TeachingRecordService = {
  getAllRecords: function () {
    var records = SpreadsheetService.getAll('TeachingRecords');
    return records.map(function (r) {
      return {
        id: r.id,
        timetableSlotId: r.timetableSlotId || '',
        schoolId: r.schoolId || 'badr',
        date: r.date,
        dayOfWeek: r.dayOfWeek,
        slotIndex: Number(r.slotIndex) || 1,
        startTime: r.startTime,
        endTime: r.endTime,
        durationMinutes: Number(r.durationMinutes) || 60,
        teacherId: r.teacherId,
        subjectId: r.subjectId,
        gradeId: r.gradeId,
        classId: r.classId,
        locationType: r.locationType || 'classroom',
        labId: r.labId || '',
        workshopId: r.workshopId || '',
        roomName: r.roomName || '',
        lessonTopic: r.lessonTopic || '',
        unitModule: r.unitModule || '',
        lessonStatus: r.lessonStatus || 'completed',
        notCompletedReason: r.notCompletedReason || '',
        materialsUrl: r.materialsUrl || '',
        teacherNotes: r.teacherNotes || '',
        parentVisibility: r.parentVisibility === true || r.parentVisibility === 'true',
        recordedAt: r.recordedAt || '',
        lastUpdatedAt: r.lastUpdatedAt || '',
      };
    });
  },

  recordLesson: function (data, user) {
    if (!data.teacherId || !data.subjectId || !data.classId || !data.lessonTopic) {
      throw new Error('المعلم، المادة، الفصل، وموضوع الدرس حقول مطلوبة.');
    }

    var settings = SettingsService.getSettings();
    if (settings.requireMaterialsLink && (!data.materialsUrl || String(data.materialsUrl).trim() === '')) {
      throw new Error('سياسة المدرسة تشترط إضافة رابط المواد التعليمية قبل توثيق الحصة.');
    }

    var duration = Number(data.durationMinutes) || Number(settings.lessonDurationMinutes) || 60;
    var now = Utils.getIsoTimestamp();

    var record = {
      id: Utils.generateUUID(),
      timetableSlotId: data.timetableSlotId || '',
      schoolId: data.schoolId || 'badr',
      date: data.date || now.slice(0, 10),
      dayOfWeek: data.dayOfWeek || 'Sunday',
      slotIndex: Number(data.slotIndex) || 1,
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '09:00',
      durationMinutes: duration,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      gradeId: data.gradeId || '',
      classId: data.classId,
      locationType: data.locationType || 'classroom',
      labId: data.labId || '',
      workshopId: data.workshopId || '',
      roomName: data.roomName || '',
      lessonTopic: data.lessonTopic,
      unitModule: data.unitModule || '',
      lessonStatus: data.lessonStatus || 'completed',
      notCompletedReason: data.notCompletedReason || '',
      materialsUrl: data.materialsUrl || '',
      teacherNotes: data.teacherNotes || '',
      parentVisibility: data.parentVisibility !== undefined ? data.parentVisibility : settings.defaultParentVisibility,
      recordedAt: now,
      lastUpdatedAt: now,
    };

    var created = SpreadsheetService.insert('TeachingRecords', record);

    // If material URL or attachment is present, record in LessonMaterials sheet too
    if (data.materialsUrl && String(data.materialsUrl).trim() !== '') {
      try {
        MaterialService.saveMaterial({
          teachingRecordId: created.id,
          title: data.lessonTopic,
          url: data.materialsUrl,
          type: 'link',
          uploadedBy: user ? user.id : 'SYSTEM',
          parentVisibility: created.parentVisibility,
        });
      } catch (e) {}
    }

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'RECORD_LESSON',
        entityType: 'teaching_record',
        entityId: created.id,
        description: 'توثيق تنفيذ حصة: ' + created.lessonTopic + ' (' + created.date + ')',
      });
    } catch (e) {}

    return created;
  },

  updateRecord: function (id, updates, user) {
    var existing = SpreadsheetService.findById('TeachingRecords', id);
    if (!existing) throw new Error('سجل الحصة غير موجود.');

    var now = Utils.getIsoTimestamp();
    var updated = SpreadsheetService.update('TeachingRecords', id, Object.assign({}, updates, { lastUpdatedAt: now }));

    // Keep MaterialService in sync if materialsUrl updated
    if (updates.materialsUrl !== undefined) {
      try {
        MaterialService.syncMaterialForRecord(id, updates.materialsUrl, existing.lessonTopic, user ? user.id : 'SYSTEM', updated.parentVisibility);
      } catch (e) {}
    }

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'UPDATE_TEACHING_RECORD',
        entityType: 'teaching_record',
        entityId: id,
        description: 'تعديل توثيق الحصة: ' + existing.lessonTopic,
      });
    } catch (e) {}

    return updated;
  },

  toggleParentVisibility: function (id, visible, user) {
    var existing = SpreadsheetService.findById('TeachingRecords', id);
    if (!existing) throw new Error('سجل الحصة غير موجود.');

    var updated = SpreadsheetService.update('TeachingRecords', id, { parentVisibility: visible });

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CHANGE_PARENT_VISIBILITY',
        entityType: 'teaching_record',
        entityId: id,
        description: 'تغيير رؤية أولياء الأمور لسجل الحصة إلى: ' + (visible ? 'مرئي' : 'مخفي'),
      });
    } catch (e) {}

    return updated;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.TeachingRecordService = TeachingRecordService;
}
if (typeof global !== 'undefined') {
  global.TeachingRecordService = TeachingRecordService;
}
