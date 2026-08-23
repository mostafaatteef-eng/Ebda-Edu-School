/**
 * EBDA EDU — Class & Academic Grade Management Service
 */

var ClassService = {
  getAllClasses: function () {
    return SpreadsheetService.getAll('Classes').map(function (c) {
      return {
        id: c.id,
        code: c.code || '',
        nameAr: c.nameAr,
        gradeId: c.gradeId,
        studentCount: Number(c.studentCount) || 0,
        roomNumber: c.roomNumber || '',
        schoolId: c.schoolId || 'badr',
      };
    });
  },

  getAllGrades: function () {
    return SpreadsheetService.getAll('Grades').map(function (g) {
      return {
        id: g.id,
        code: g.code || '',
        nameAr: g.nameAr,
        level: Number(g.level) || 1,
        schoolId: g.schoolId || 'badr',
      };
    });
  },

  createClass: function (data, user) {
    if (!data.nameAr || !data.gradeId) {
      throw new Error('اسم الفصل والمرحلة الدراسية حقول مطلوبة.');
    }
    var record = {
      id: Utils.generateUUID(),
      code: data.code || '',
      nameAr: data.nameAr,
      gradeId: data.gradeId,
      studentCount: Number(data.studentCount) || 0,
      roomNumber: data.roomNumber || '',
      schoolId: data.schoolId || 'badr',
    };
    var created = SpreadsheetService.insert('Classes', record);
    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_CLASS',
        entityType: 'class',
        entityId: created.id,
        description: 'إضافة فصل دراسي: ' + created.nameAr,
      });
    } catch (e) {}
    return created;
  },

  updateClass: function (id, updates, user) {
    var updated = SpreadsheetService.update('Classes', id, updates);
    if (updated) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'UPDATE_CLASS',
          entityType: 'class',
          entityId: id,
          description: 'تحديث بيانات الفصل: ' + (updated.nameAr || id),
        });
      } catch (e) {}
    }
    return updated;
  },

  deleteClass: function (id, user) {
    var deleted = SpreadsheetService.deleteById('Classes', id);
    if (deleted) {
      try {
        AuditService.log({
          userId: user ? user.id : 'SYSTEM',
          userName: user ? user.name : 'SYSTEM',
          userRole: user ? user.role : 'operations_manager',
          action: 'DELETE_CLASS',
          entityType: 'class',
          entityId: id,
          description: 'حذف الفصل الدراسي: ' + id,
        });
      } catch (e) {}
    }
    return deleted;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.ClassService = ClassService;
}
if (typeof global !== 'undefined') {
  global.ClassService = ClassService;
}
