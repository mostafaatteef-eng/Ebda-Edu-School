/**
 * EBDA EDU — Parent Portal & Weekly Learning Record Service
 * Delivers transparent learning progress to parents while strictly protecting internal records.
 */

var ParentService = {
  getAllParents: function () {
    var parents = SpreadsheetService.getAll('Parents');
    return parents.map(function (p) {
      var studentIds = [];
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
    var allRecords = SpreadsheetService.getAll('TeachingRecords');
    var allSubjects = SpreadsheetService.getAll('Subjects');
    var allTeachers = SpreadsheetService.getAll('Teachers');

    var subjectMap = {};
    allSubjects.forEach(function (s) {
      subjectMap[s.id] = s.nameAr;
    });

    var teacherMap = {};
    allTeachers.forEach(function (t) {
      teacherMap[t.id] = t.name;
    });

    // Filter strictly for class and parent visibility
    var visibleRecords = allRecords.filter(function (r) {
      return (
        String(r.classId) === String(classId) &&
        (r.parentVisibility === true || r.parentVisibility === 'true')
      );
    });

    return visibleRecords.map(function (r) {
      return {
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
      };
    });
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.ParentService = ParentService;
}
if (typeof global !== 'undefined') {
  global.ParentService = ParentService;
}
