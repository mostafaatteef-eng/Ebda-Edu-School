/**
 * EBDA EDU — Parent Portal & Weekly Learning Record Service
 * Delivers transparent learning progress to parents while strictly protecting internal records.
 */

const ParentService = {
  getAllParents: function () {
    const parents = SpreadsheetService.getAll('Parents');
    return parents.map((p) => {
      let studentIds = [];
      try {
        studentIds = typeof p.studentIdsJson === 'string' ? JSON.parse(p.studentIdsJson) : p.studentIdsJson;
      } catch (e) {
        studentIds = [];
      }
      return {
        id: p.id,
        userId: p.userId,
        parentName: p.parentName,
        phone: p.phone || '',
        email: p.email || '',
        studentIds: Array.isArray(studentIds) ? studentIds : [],
        status: p.status || 'active',
      };
    });
  },

  /**
   * Retrieves Weekly Learning Record for a class, strictly filtering by parentVisibility = true.
   */
  getWeeklyLearningRecord: function (classId) {
    const allRecords = SpreadsheetService.getAll('TeachingRecords');
    const allSubjects = SpreadsheetService.getAll('Subjects');
    const allTeachers = SpreadsheetService.getAll('Teachers');

    const subjectMap = {};
    allSubjects.forEach((s) => (subjectMap[s.id] = s.nameAr));

    const teacherMap = {};
    allTeachers.forEach((t) => (teacherMap[t.id] = t.name));

    // Filter strictly for class and parent visibility
    const visibleRecords = allRecords.filter(
      (r) =>
        String(r.classId) === String(classId) &&
        (r.parentVisibility === true || r.parentVisibility === 'true')
    );

    return visibleRecords.map((r) => ({
      id: r.id,
      date: r.date,
      dayOfWeek: r.dayOfWeek,
      slotIndex: Number(r.slotIndex) || 1,
      startTime: r.startTime,
      endTime: r.endTime,
      durationMinutes: Number(r.durationMinutes) || 60,
      subjectName: subjectMap[r.subjectId] || 'المادة الدراسية',
      teacherName: teacherMap[r.teacherId] || 'عضو هيئة التدريس',
      lessonTopic: r.lessonTopic,
      unitModule: r.unitModule || '',
      lessonStatus: r.lessonStatus,
      materialsUrl: r.materialsUrl || '',
    }));
  },
};
