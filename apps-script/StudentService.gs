/**
 * EBDA EDU — Student Directory Management Service
 */

var StudentService = {
  getAllStudents: function () {
    var students = SpreadsheetService.getAll('Students');
    return students.map(function (s) {
      return {
        id: s.id,
        nationalId: s.nationalId || '',
        name: s.name,
        gradeId: s.gradeId,
        classId: s.classId,
        parentId: s.parentId || '',
        phone: s.phone || '',
        status: s.status || 'active',
      };
    });
  },

  createStudent: function (data, user) {
    if (!data.name || !data.gradeId || !data.classId) {
      throw new Error('اسم الطالب، المرحلة، والفصل حقول مطلوبة.');
    }

    var record = {
      id: Utils.generateUUID(),
      nationalId: data.nationalId || '',
      name: data.name,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId || '',
      phone: data.phone || '',
      status: data.status || 'active',
    };

    var created = SpreadsheetService.insert('Students', record);

    try {
      AuditService.log({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'SYSTEM',
        userRole: user ? user.role : 'operations_manager',
        action: 'CREATE_STUDENT',
        entityType: 'student',
        entityId: created.id,
        description: 'تسجيل طالب جديد: ' + created.name,
      });
    } catch (e) {}

    return created;
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.StudentService = StudentService;
}
if (typeof global !== 'undefined') {
  global.StudentService = StudentService;
}
