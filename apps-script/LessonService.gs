/**
 * EBDA EDU — Timetable Lesson Query and Sync Service
 */

const LessonService = {
  getAllLessons: function (filterDate) {
    return TimetableService.getAllSlots();
  },

  getLessonById: function (lessonId) {
    return TimetableService.getSlotById(lessonId);
  },

  getTodayScheduleForTeacher: function (teacherId, dayOfWeek) {
    const allSlots = TimetableService.getAllSlots();
    return allSlots.filter(function (slot) {
      return (
        String(slot.teacherId) === String(teacherId) &&
        (!dayOfWeek || String(slot.dayOfWeek) === String(dayOfWeek))
      );
    });
  },
};
