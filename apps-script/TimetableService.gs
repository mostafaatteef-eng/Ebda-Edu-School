/**
 * EBDA EDU — Timetable & Conflict Engine Service
 * Validates non-overlapping slots, room/lab bookings, teacher collisions, and break collisions.
 */

const TimetableService = {
  getAllSlots: function () {
    const slots = SpreadsheetService.getAll('Timetable');
    return slots.map((s) => ({
      id: s.id,
      schoolId: s.schoolId || 'badr',
      academicYearId: s.academicYearId || 'ay-2025-2026',
      dayOfWeek: s.dayOfWeek,
      slotIndex: Number(s.slotIndex),
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: Number(s.durationMinutes) || 60,
      gradeId: s.gradeId,
      classId: s.classId,
      subjectId: s.subjectId,
      teacherId: s.teacherId,
      locationType: s.locationType || 'classroom',
      labId: s.labId || '',
      workshopId: s.workshopId || '',
      roomName: s.roomName || '',
    }));
  },

  /**
   * Checks if slot overlaps any active breaks or other slots.
   */
  detectConflicts: function (newSlot, excludeSlotId) {
    const allSlots = this.getAllSlots();
    const allBreaks = BreakService.getAllBreaks().filter((b) => b.status === 'active');

    // 1. Check Break Collision
    for (let i = 0; i < allBreaks.length; i++) {
      const b = allBreaks[i];
      if (b.daysOfWeek.includes(newSlot.dayOfWeek)) {
        if (this.timeRangesOverlap(newSlot.startTime, newSlot.endTime, b.startTime, b.endTime)) {
          return {
            hasConflict: true,
            type: 'break',
            description: 'تعارض مع ' + b.name + ' (' + b.startTime + ' - ' + b.endTime + ')',
            conflictingBreak: b,
          };
        }
      }
    }

    // 2. Check Other Slot Collisions (Teacher, Class, Lab, Workshop)
    for (let j = 0; j < allSlots.length; j++) {
      const existing = allSlots[j];
      if (excludeSlotId && String(existing.id) === String(excludeSlotId)) continue;
      if (existing.dayOfWeek !== newSlot.dayOfWeek) continue;

      if (this.timeRangesOverlap(newSlot.startTime, newSlot.endTime, existing.startTime, existing.endTime)) {
        if (String(existing.teacherId) === String(newSlot.teacherId)) {
          return {
            hasConflict: true,
            type: 'teacher',
            description: 'المعلم معين بالفعل في حصة أخرى بنفس التوقيت (' + existing.startTime + ' - ' + existing.endTime + ')',
            conflictingSlot: existing,
          };
        }
        if (String(existing.classId) === String(newSlot.classId)) {
          return {
            hasConflict: true,
            type: 'class',
            description: 'الفصل لديه حصة أخرى في نفس التوقيت (' + existing.startTime + ' - ' + existing.endTime + ')',
            conflictingSlot: existing,
          };
        }
        if (newSlot.labId && String(existing.labId) === String(newSlot.labId)) {
          return {
            hasConflict: true,
            type: 'lab',
            description: 'المعمل محجوز لحصة أخرى في نفس التوقيت (' + existing.startTime + ' - ' + existing.endTime + ')',
            conflictingSlot: existing,
          };
        }
        if (newSlot.workshopId && String(existing.workshopId) === String(newSlot.workshopId)) {
          return {
            hasConflict: true,
            type: 'workshop',
            description: 'الورشة محجوزة لحصة أخرى في نفس التوقيت (' + existing.startTime + ' - ' + existing.endTime + ')',
            conflictingSlot: existing,
          };
        }
      }
    }

    return { hasConflict: false };
  },

  timeRangesOverlap: function (s1, e1, s2, e2) {
    if (!s1 || !e1 || !s2 || !e2) return false;
    const toMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const start1 = toMins(s1);
    const end1 = toMins(e1);
    const start2 = toMins(s2);
    const end2 = toMins(e2);
    return Math.max(start1, start2) < Math.min(end1, end2);
  },

  createSlot: function (slotData, user) {
    const conflict = this.detectConflicts(slotData);
    if (conflict.hasConflict) {
      throw new Error(conflict.description);
    }

    const settings = SettingsService.getSettings();
    const duration = Number(slotData.durationMinutes) || Number(settings.lessonDurationMinutes) || 60;

    const record = {
      id: Utils.generateUUID(),
      schoolId: slotData.schoolId || 'badr',
      academicYearId: slotData.academicYearId || 'ay-2025-2026',
      dayOfWeek: slotData.dayOfWeek,
      slotIndex: Number(slotData.slotIndex) || 1,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      durationMinutes: duration,
      gradeId: slotData.gradeId,
      classId: slotData.classId,
      subjectId: slotData.subjectId,
      teacherId: slotData.teacherId,
      locationType: slotData.locationType || 'classroom',
      labId: slotData.labId || '',
      workshopId: slotData.workshopId || '',
      roomName: slotData.roomName || '',
    };

    const created = SpreadsheetService.insert('Timetable', record);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_TIMETABLE_SLOT',
      entityType: 'timetable',
      entityId: created.id,
      description: 'إضافة حصة جديدة في الجدول الدراسي: ' + created.dayOfWeek + ' (' + created.startTime + ' - ' + created.endTime + ')',
    });

    return created;
  },

  updateSlot: function (id, updates, user) {
    const existing = SpreadsheetService.findById('Timetable', id);
    if (!existing) throw new Error('الحصة غير موجودة في الجدول.');

    const merged = Object.assign({}, existing, updates);
    const conflict = this.detectConflicts(merged, id);
    if (conflict.hasConflict) {
      throw new Error(conflict.description);
    }

    const updated = SpreadsheetService.update('Timetable', id, updates);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_TIMETABLE_SLOT',
      entityType: 'timetable',
      entityId: id,
      description: 'تعديل حصة في الجدول الدراسي: ' + existing.dayOfWeek + ' (' + existing.startTime + ')',
    });

    return updated;
  },

  deleteSlot: function (id, user) {
    const existing = SpreadsheetService.findById('Timetable', id);
    if (!existing) return true;

    SpreadsheetService.deleteById('Timetable', id);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_TIMETABLE_SLOT',
      entityType: 'timetable',
      entityId: id,
      description: 'حذف حصة من الجدول الدراسي: ' + existing.dayOfWeek + ' (' + existing.startTime + ')',
    });

    return true;
  },
};
