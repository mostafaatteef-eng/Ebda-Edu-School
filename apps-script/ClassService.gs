/**
 * EBDA EDU — Class & Academic Grade Management Service
 */

const ClassService = {
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
    const record = {
      id: Utils.generateUUID(),
      code: data.code || '',
      nameAr: data.nameAr,
      gradeId: data.gradeId,
      studentCount: Number(data.studentCount) || 0,
      roomNumber: data.roomNumber || '',
      schoolId: data.schoolId || 'badr',
    };
    const created = SpreadsheetService.insert('Classes', record);
    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_CLASS',
      entityType: 'class',
      entityId: created.id,
      description: 'إضافة فصل دراسي: ' + created.nameAr,
    });
    return created;
  },
};
