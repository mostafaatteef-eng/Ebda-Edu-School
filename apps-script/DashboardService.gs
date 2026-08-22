/**
 * EBDA EDU — Operations Intelligence Dashboard Service
 * Live real-time statistics and analytics.
 * Strictly excludes breaks from lesson counts and workload statistics.
 */

const DashboardService = {
  getDashboardStats: function (filterDate) {
    const today = filterDate || new Date().toISOString().slice(0, 10);
    const dayOfWeek = 'Sunday'; // Standard calculation day or dynamic

    const allSlots = SpreadsheetService.getAll('Timetable');
    const allRecords = SpreadsheetService.getAll('TeachingRecords');
    const allTeachers = SpreadsheetService.getAll('Teachers');
    const allMaterials = SpreadsheetService.getAll('LessonMaterials');
    const allBreaks = SpreadsheetService.getAll('Breaks');

    // Total scheduled lessons (Breaks are NEVER timetable slots, strictly lessons)
    const totalScheduled = allSlots.length;

    // Teaching records for the period
    const todayRecords = allRecords.filter((r) => !filterDate || r.date === filterDate);
    const completedRecords = todayRecords.filter((r) => r.lessonStatus === 'completed');
    const pendingCount = Math.max(0, totalScheduled - completedRecords.length);
    const notCompletedCount = todayRecords.filter((r) => r.lessonStatus === 'not_completed').length;

    // Materials statistics
    const recordsWithMaterials = completedRecords.filter((r) => r.materialsUrl && String(r.materialsUrl).trim() !== '');
    const materialsUploaded = recordsWithMaterials.length;
    const materialsMissing = Math.max(0, completedRecords.length - materialsUploaded);

    // Rates
    const documentationRate = totalScheduled > 0 ? Math.round((completedRecords.length / totalScheduled) * 100) : 0;
    const materialsCoverageRate = completedRecords.length > 0 ? Math.round((materialsUploaded / completedRecords.length) * 100) : 0;

    return {
      date: today,
      totalScheduled: totalScheduled,
      completed: completedRecords.length,
      pending: pendingCount,
      notCompleted: notCompletedCount,
      materialsUploaded: materialsUploaded,
      materialsMissing: materialsMissing,
      documentationRate: documentationRate,
      materialsCoverageRate: materialsCoverageRate,
      activeTeachersCount: allTeachers.filter((t) => t.active === true || t.active === 'true').length,
      activeBreaksCount: allBreaks.filter((b) => b.status === 'active').length,
    };
  },
};
