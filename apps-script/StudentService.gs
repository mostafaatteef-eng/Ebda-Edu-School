/**
 * EBDA EDU — Student Directory Management Service
 */

const StudentService = {
  getAllStudents: function () {
    const students = SpreadsheetService.getAll('Students');
    return students.map((s) => ({
      id: s.id,
      nationalId: s.nationalId || '',
      name: s.name,
      gradeId: s.gradeId,
      classId: s.classId,
      parentId: s.parentId || '',
      phone: s.phone || '',
      status: s.status || 'active',
    }));
  },

  createStudent: function (data, user) {
    if (!data.name || !data.gradeId || !data.classId) {
      throw new Error('اسم الطالب، المرحلة، والفصل حقول مطلوبة.');
    }

    const record = {
      id: Utils.generateUUID(),
      nationalId: data.nationalId || '',
      name: data.name,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId || '',
      phone: data.phone || '',
      status: data.status || 'active',
    };

    const created = SpreadsheetService.insert('Students', record);

    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_STUDENT',
      entityType: 'student',
      entityId: created.id,
      description: 'تسجيل طالب جديد: ' + created.name,
    });

    return created;
  },
};
