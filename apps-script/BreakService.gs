/**
 * EBDA EDU — School Breaks Configuration Service
 * Manages non-teaching periods (Morning Break, Lunch, Assemblies).
 * Strict Business Rule: Breaks MUST NEVER count towards lesson totals, teaching loads, or achievement rates.
 */

var BreakService = {
  getAllBreaks: function () {
    var breaks = SpreadsheetService.getAll('Breaks');
    return breaks.map(function (b) {
      var days = [];
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
        durationMinutes: Number(b.durationMinutes) || BreakService.calculateDurationMinutes(b.startTime, b.endTime),
        daysOfWeek: Array.isArray(days) ? days : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        status: b.status || 'active',
        schoolId: b.schoolId || 'badr',
        notes: b.notes || '',
      };
    });
  },

  calculateDurationMinutes: function (startStr, endStr) {
    if (!startStr || !endStr) return 0;
    var sParts = startStr.split(':').map(Number);
    var eParts = endStr.split(':').map(Number);
    var startMins = sParts[0] * 60 + (sParts[1] || 0);
    var endMins = eParts[0] * 60 + (eParts[1] || 0);
    return Math.max(0, endMins - startMins);
  },

  createBreak: function (data, user) {
    if (!data.name || !data.startTime || !data.endTime) {
      throw new Error('اسم الاستراحة ووقت البداية والنهاية حقول مطلوبة.');
    }

    var duration = this.calculateDurationMinutes(data.startTime, data.endTime);
    if (duration <= 0) {
      throw new Error('وقت نهاية الاستراحة يجب أن يكون بعد وقت البداية.');
    }

    var days = Array.isArray(data.daysOfWeek) ? data.daysOfWeek : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

    var record = {
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

    var created = SpreadsheetService.insert('Breaks', record);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_BREAK',
        entityType: 'break',
        entityId: created.id,
        description: 'إضافة فترة استراحة جديدة: ' + created.name + ' (' + duration + ' دقيقة)',
      });
    } catch (e) {}

    return created;
  },

  updateBreak: function (id, updates, user) {
    var existing = SpreadsheetService.findById('Breaks', id);
    if (!existing) throw new Error('فترة الاستراحة غير موجودة.');

    var start = updates.startTime || existing.startTime;
    var end = updates.endTime || existing.endTime;
    var duration = this.calculateDurationMinutes(start, end);

    if (duration <= 0) {
      throw new Error('وقت نهاية الاستراحة يجب أن يكون بعد وقت البداية.');
    }

    var recordUpdates = Object.assign({}, updates, {
      durationMinutes: duration,
    });

    if (updates.daysOfWeek) {
      recordUpdates.daysOfWeekJson = JSON.stringify(updates.daysOfWeek);
      delete recordUpdates.daysOfWeek;
    }

    var updated = SpreadsheetService.update('Breaks', id, recordUpdates);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'UPDATE_BREAK',
        entityType: 'break',
        entityId: id,
        description: 'تحديث فترة الاستراحة: ' + existing.name,
      });
    } catch (e) {}

    return updated;
  },

  deleteBreak: function (id, user) {
    var existing = SpreadsheetService.findById('Breaks', id);
    if (!existing) return true;

    SpreadsheetService.deleteById('Breaks', id);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'DELETE_BREAK',
        entityType: 'break',
        entityId: id,
        description: 'حذف فترة الاستراحة: ' + existing.name,
      });
    } catch (e) {}

    return true;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.BreakService = BreakService;
}
if (typeof global !== 'undefined') {
  global.BreakService = BreakService;
}
