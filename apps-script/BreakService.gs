/**
 * EBDA EDU — School Breaks Configuration Service
 * Manages non-teaching periods (Morning Break, Lunch, Assemblies).
 * Strict Business Rule: Breaks MUST NEVER count towards lesson totals, teaching loads, or achievement rates.
 */

const BreakService = {
  getAllBreaks: function () {
    const breaks = SpreadsheetService.getAll('Breaks');
    return breaks.map((b) => {
      let days = [];
      try {
        days = typeof b.daysOfWeekJson === 'string' ? JSON.parse(b.daysOfWeekJson) : b.daysOfWeekJson;
      } catch (e) {
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      }
      return {
        id: b.id,
        name: b.name,
        type: b.type || 'break',
        startTime: b.startTime,
        endTime: b.endTime,
        durationMinutes: Number(b.durationMinutes) || this.calculateDurationMinutes(b.startTime, b.endTime),
        daysOfWeek: Array.isArray(days) ? days : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        status: b.status || 'active',
        schoolId: b.schoolId || 'badr',
        notes: b.notes || '',
      };
    });
  },

  calculateDurationMinutes: function (startStr, endStr) {
    if (!startStr || !endStr) return 0;
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return Math.max(0, endMins - startMins);
  },

  createBreak: function (data, user) {
    if (!data.name || !data.startTime || !data.endTime) {
      throw new Error('اسم الاستراحة ووقت البداية والنهاية حقول مطلوبة.');
    }

    const duration = this.calculateDurationMinutes(data.startTime, data.endTime);
    if (duration <= 0) {
      throw new Error('وقت نهاية الاستراحة يجب أن يكون بعد وقت البداية.');
    }

    const days = Array.isArray(data.daysOfWeek) ? data.daysOfWeek : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

    const record = {
      id: Utils.generateUUID(),
      name: data.name,
      type: data.type || 'break',
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes: duration,
      daysOfWeekJson: JSON.stringify(days),
      status: data.status || 'active',
      schoolId: data.schoolId || 'badr',
      notes: data.notes || '',
    };

    const created = SpreadsheetService.insert('Breaks', record);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_BREAK',
      entityType: 'break',
      entityId: created.id,
      description: 'إضافة فترة استراحة جديدة: ' + created.name + ' (' + duration + ' دقيقة)',
    });

    return created;
  },

  updateBreak: function (id, updates, user) {
    const existing = SpreadsheetService.findById('Breaks', id);
    if (!existing) throw new Error('فترة الاستراحة غير موجودة.');

    const start = updates.startTime || existing.startTime;
    const end = updates.endTime || existing.endTime;
    const duration = this.calculateDurationMinutes(start, end);

    if (duration <= 0) {
      throw new Error('وقت نهاية الاستراحة يجب أن يكون بعد وقت البداية.');
    }

    const recordUpdates = Object.assign({}, updates, {
      durationMinutes: duration,
    });

    if (updates.daysOfWeek) {
      recordUpdates.daysOfWeekJson = JSON.stringify(updates.daysOfWeek);
      delete recordUpdates.daysOfWeek;
    }

    const updated = SpreadsheetService.update('Breaks', id, recordUpdates);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_BREAK',
      entityType: 'break',
      entityId: id,
      description: 'تحديث فترة الاستراحة: ' + existing.name,
    });

    return updated;
  },

  deleteBreak: function (id, user) {
    const existing = SpreadsheetService.findById('Breaks', id);
    if (!existing) return true;

    SpreadsheetService.deleteById('Breaks', id);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE_BREAK',
      entityType: 'break',
      entityId: id,
      description: 'حذف فترة الاستراحة: ' + existing.name,
    });

    return true;
  },
};
