/**
 * EBDA EDU — Timetable Lesson Query and Sync Service
 */

var LessonService = {
  getAllLessons: function (filterDate) {
    return TimetableService.getAllSlots();
  },

  getLessonById: function (lessonId) {
    var slots = TimetableService.getAllSlots();
    for (var i = 0; i < slots.length; i++) {
      if (String(slots[i].id) === String(lessonId)) {
        return slots[i];
      }
    }
    return null;
  },

  getTodayScheduleForTeacher: function (teacherId, dayOfWeek) {
    var allSlots = TimetableService.getAllSlots();
    return allSlots.filter(function (slot) {
      return (
        String(slot.teacherId) === String(teacherId) &&
        (!dayOfWeek || String(slot.dayOfWeek) === String(dayOfWeek))
      );
    });
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.LessonService = LessonService;
}
if (typeof global !== 'undefined') {
  global.LessonService = LessonService;
}
