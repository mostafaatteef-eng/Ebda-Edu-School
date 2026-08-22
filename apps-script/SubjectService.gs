/**
 * EBDA EDU — Subject Management Service
 */

const SubjectService = {
  getAllSubjects: function () {
    return SpreadsheetService.getAll('Subjects').map(function (s) {
      return {
        id: s.id,
        code: s.code || '',
        nameAr: s.nameAr,
        nameEn: s.nameEn || '',
        gradeId: s.gradeId,
        weeklyLessonsRequired: Number(s.weeklyLessonsRequired) || 0,
        weeklyLessonsTarget: Number(s.weeklyLessonsTarget) || 0,
        department: s.department || 'عام',
        category: s.category || 'academic',
        color: s.color || '#25A09F',
        isPractical: String(s.isPractical) === 'true',
        preferredLocationType: s.preferredLocationType || 'classroom',
        schoolId: s.schoolId || 'badr',
      };
    });
  },

  createSubject: function (data, user) {
    if (!data.nameAr || !data.gradeId) {
      throw new Error('اسم المادة والمرحلة الدراسية حقول مطلوبة.');
    }
    const record = {
      id: Utils.generateUUID(),
      code: data.code || '',
      nameAr: data.nameAr,
      nameEn: data.nameEn || '',
      gradeId: data.gradeId,
      weeklyLessonsRequired: Number(data.weeklyLessonsRequired) || 0,
      weeklyLessonsTarget: Number(data.weeklyLessonsTarget) || Number(data.weeklyLessonsRequired) || 0,
      department: data.department || 'عام',
      category: data.category || 'academic',
      color: data.color || '#25A09F',
      isPractical: Boolean(data.isPractical),
      preferredLocationType: data.preferredLocationType || 'classroom',
      schoolId: data.schoolId || 'badr',
    };
    const created = SpreadsheetService.insert('Subjects', record);
    AuditService.log({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE_SUBJECT',
      entityType: 'subject',
      entityId: created.id,
      description: 'إضافة مادة دراسية: ' + created.nameAr,
    });
    return created;
  },
};
