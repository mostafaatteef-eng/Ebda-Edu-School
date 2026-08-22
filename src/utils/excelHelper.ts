import * as XLSX from 'xlsx';
import {
  TimetableSlot,
  Teacher,
  Subject,
  SchoolClass,
  TeachingRecord,
  School,
  TeacherWorkloadSummary,
} from '../types';
import { getArabicDayName } from './conflicts';

/** Helper to trigger direct CSV download with UTF-8 BOM for Arabic support */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface TeachingPerformanceData {
  teacherId: string;
  teacherCode: string;
  teacherName: string;
  specialization: string;
  department: string;
  targetLessons: number; // e.g. 20 (equals 20 hours at 60 min/lesson)
  targetHours: number; // 60 min each
  scheduledLessons: number;
  scheduledHours: number;
  deliveredLessons: number;
  deliveredHours: number;
  completedLessons: number;
  partiallyCompletedLessons: number;
  notCompletedLessons: number;
  completionRate: number; // % of delivered that are completed
  scheduledVsDeliveredDiff: number; // delivered - scheduled
  documentationRate: number; // delivered / scheduled %
  materialsAttachedCount: number;
  materialsCoverageRate: number; // % of delivered with materials link
  parentVisibleCount: number;
}

export function computeTeachingPerformanceMetrics(
  teachers: Teacher[],
  slots: TimetableSlot[],
  records: TeachingRecord[]
): TeachingPerformanceData[] {
  return teachers.map((t) => {
    const teacherSlots = slots.filter((s) => s.teacherId === t.id);
    const teacherRecords = records.filter((r) => r.teacherId === t.id);

    const scheduledLessons = teacherSlots.length;
    const scheduledHours = scheduledLessons; // Standard 60 min
    const targetLessons = t.targetWeeklyLessons || 25;
    const targetHours = targetLessons;

    const deliveredLessons = teacherRecords.length;
    const deliveredHours = deliveredLessons; // Standard 60 min

    const completedLessons = teacherRecords.filter((r) => r.lessonStatus === 'completed').length;
    const partiallyCompletedLessons = teacherRecords.filter((r) => r.lessonStatus === 'partially_completed').length;
    const notCompletedLessons = teacherRecords.filter((r) => r.lessonStatus === 'not_completed').length;

    const completionRate =
      deliveredLessons > 0 ? Math.round((completedLessons / deliveredLessons) * 100) : 0;

    const documentationRate =
      scheduledLessons > 0 ? Math.round((deliveredLessons / scheduledLessons) * 100) : 0;

    const materialsAttachedCount = teacherRecords.filter(
      (r) => !!r.materialsUrl && r.materialsUrl.trim() !== ''
    ).length;

    const materialsCoverageRate =
      deliveredLessons > 0 ? Math.round((materialsAttachedCount / deliveredLessons) * 100) : 0;

    const parentVisibleCount = teacherRecords.filter((r) => r.parentVisibility).length;

    return {
      teacherId: t.id,
      teacherCode: t.code,
      teacherName: t.name,
      specialization: t.specialization,
      department: t.department || 'العلوم التكنولوجية التطبيقية',
      targetLessons,
      targetHours,
      scheduledLessons,
      scheduledHours,
      deliveredLessons,
      deliveredHours,
      completedLessons,
      partiallyCompletedLessons,
      notCompletedLessons,
      completionRate,
      scheduledVsDeliveredDiff: deliveredLessons - scheduledLessons,
      documentationRate,
      materialsAttachedCount,
      materialsCoverageRate,
      parentVisibleCount,
    };
  });
}

export function exportTeachingPerformanceReportToExcel(
  performanceData: TeachingPerformanceData[],
  school: School,
  academicYear: string = '2025/2026'
) {
  const rows = performanceData.map((d, idx) => ({
    'م': idx + 1,
    'كود المعلم': d.teacherCode,
    'اسم المعلم': d.teacherName,
    'التخصص': d.specialization,
    'القسم': d.department,
    'النصاب المستهدف (حصص/ساعات 60 دقيقة)': `${d.targetLessons} س`,
    'الحصص المجدولة (ساعات)': `${d.scheduledLessons} س`,
    'الحصص المنفذة فعلياً (ساعات)': `${d.deliveredLessons} س`,
    'الفارق (المنفذ - المجدول)': `${d.scheduledVsDeliveredDiff > 0 ? '+' : ''}${d.scheduledVsDeliveredDiff}`,
    'معدل توثيق التدريس (Documentation Rate)': `${d.documentationRate}%`,
    'الحصص المكتملة بالكامل': d.completedLessons,
    'حصص تنفيذ جزئي': d.partiallyCompletedLessons,
    'حصص لم تنفذ': d.notCompletedLessons,
    'معدل اكتمال الحصص (Completion Rate)': `${d.completionRate}%`,
    'الحصص المرفق بها رابط مواد': d.materialsAttachedCount,
    'معدل تغطية روابط المواد (Materials Coverage Rate)': `${d.materialsCoverageRate}%`,
    'المواد المعتمدة لظهور الأهالي': d.parentVisibleCount,
    'حالة الأداء العام':
      d.documentationRate >= 90 && d.completionRate >= 90
        ? 'أداء ممتاز (Excellent)'
        : d.documentationRate >= 75
        ? 'أداء جيد (Good)'
        : 'بحاجة إلى متابعة (Needs Action)',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الأداء الأكاديمي');

  const fileName = `EBDA_EDU_Teaching_Performance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportTeachingPerformanceReportToCSV(
  performanceData: TeachingPerformanceData[],
  school: School
) {
  const rows = performanceData.map((d, idx) => ({
    'م': idx + 1,
    'كود المعلم': d.teacherCode,
    'اسم المعلم': d.teacherName,
    'التخصص': d.specialization,
    'القسم': d.department,
    'النصاب المستهدف (ساعات 60 د)': d.targetLessons,
    'الحصص المجدولة (ساعات)': d.scheduledLessons,
    'الحصص المنفذة (ساعات)': d.deliveredLessons,
    'الفارق': d.scheduledVsDeliveredDiff,
    'معدل توثيق التدريس %': d.documentationRate,
    'الحصص المكتملة': d.completedLessons,
    'تنفيذ جزئي': d.partiallyCompletedLessons,
    'لم تنفذ': d.notCompletedLessons,
    'معدل الاكتمال %': d.completionRate,
    'روابط المواد المرفقة': d.materialsAttachedCount,
    'معدل تغطية الروابط %': d.materialsCoverageRate,
    'المواد المنشورة للأهالي': d.parentVisibleCount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const fileName = `EBDA_EDU_Teaching_Performance_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvOutput, fileName);
}

export function exportTimetableToExcel(
  slots: TimetableSlot[],
  teachers: Teacher[],
  subjects: Subject[],
  classes: SchoolClass[],
  school: School,
  viewName: string = 'الجدول الدراسي الأسبوعي'
) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));

  const rows = slots.map((s, idx) => {
    const teacher = teacherMap.get(s.teacherId);
    const subject = subjectMap.get(s.subjectId);
    const cl = classMap.get(s.classId);

    return {
      'م': idx + 1,
      'اليوم': getArabicDayName(s.dayOfWeek),
      'رقم الحصة': s.slotIndex,
      'وقت البداية': s.startTime,
      'وقت النهاية': s.endTime,
      'المدة (دقيقة)': s.durationMinutes || 60,
      'الفصل': cl?.nameAr || cl?.code || '',
      'المادة الدراسية': subject?.nameAr || '',
      'كود المادة': subject?.code || '',
      'المعلم': teacher?.name || '',
      'المكان / القاعة': s.roomName || 'الفصل',
      'نوع الحصة': s.locationType === 'lab' ? 'معمل تطبيقي' : s.locationType === 'workshop' ? 'ورشة تدريبية' : 'فصل نظري',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الجدول الأسبوعي');

  const fileName = `EBDA_EDU_${school.nameEn?.replace(/ /g, '_') || 'Badr'}_Timetable_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportWorkloadReportToExcel(
  teachers: Teacher[],
  slots: TimetableSlot[],
  records: TeachingRecord[],
  school: School
) {
  const rows = teachers.map((t, idx) => {
    const weeklySlotsCount = slots.filter((s) => s.teacherId === t.id).length;
    const targetHours = t.targetWeeklyLessons;
    const variance = weeklySlotsCount - t.targetWeeklyLessons;
    const achievement = t.targetWeeklyLessons > 0
      ? `${Math.round((weeklySlotsCount / t.targetWeeklyLessons) * 100 * 10) / 10}%`
      : '0%';
    const recordedCount = records.filter((r) => r.teacherId === t.id).length;
    const materialsCount = records.filter((r) => r.teacherId === t.id && !!r.materialsUrl).length;

    return {
      'م': idx + 1,
      'كود المعلم': t.code,
      'اسم المعلم': t.name,
      'التخصص': t.specialization,
      'القسم': t.department || 'العلوم التكنولوجية',
      'النصاب المستهدف (حصص/ساعات 60 دقيقة)': targetHours,
      'النصاب الفعلي المجدول (حصص/ساعات)': weeklySlotsCount,
      'الفارق (Variance)': variance,
      'نسبة الإنجاز': achievement,
      'حالة النصاب': variance > 2 ? 'عبء زائد (Overload)' : variance < -1 ? 'أقل من المستهدف (Below)' : 'مثالي (Optimal)',
      'الحصص الموثقة': recordedCount,
      'الحصص المرفق لها روابط تعليمية': materialsCount,
      'البريد الإلكتروني': t.email || '',
      'رقم الهاتف': t.phone || t.phoneNumber || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نصاب المعلمين والتشغيل');

  const fileName = `EBDA_EDU_Teacher_Workload_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportWorkloadToExcel(
  summaries: TeacherWorkloadSummary[],
  school: School
) {
  const rows = summaries.map((s, idx) => ({
    'م': idx + 1,
    'اسم المعلم': s.teacherName,
    'التخصص': s.specialization,
    'النصاب المستهدف (ساعة)': s.targetWeeklyHours,
    'المجدول بالجدول (ساعة)': s.actualScheduledHours,
    'الحصص الموثقة': s.completedLessonsCount,
    'نسبة التوثيق': `${s.documentationRate}%`,
    'نسبة إرفاق الروابط': `${s.materialsCoverageRate}%`,
    'الحالة': s.workloadStatus === 'balanced' ? 'نصاب متوازن' : s.workloadStatus === 'overloaded' ? 'عبء زائد' : 'أقل من المستهدف',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نصاب المعلمين');

  const fileName = `EBDA_EDU_Workload_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function generateExcelTemplate() {
  const sampleData = [
    {
      'اليوم': 'الأحد',
      'رقم الحصة': 1,
      'وقت البداية': '08:00',
      'وقت النهاية': '09:00',
      'الفصل': '1/1',
      'المادة الدراسية': 'تحكم منطقي مبرمج PLC',
      'كود المعلم': 'TCH-001',
      'اسم المعلم': 'م. تامر عبد الحميد',
      'المكان / المعمل': 'معمل التحكم والـ PLC',
      'نوع الحصة': 'معمل تطبيقي',
    },
    {
      'اليوم': 'الأحد',
      'رقم الحصة': 2,
      'وقت البداية': '09:00',
      'وقت النهاية': '10:00',
      'الفصل': '1/1',
      'المادة الدراسية': 'رياضيات تطبيقية وهندسية',
      'كود المعلم': 'TCH-002',
      'اسم المعلم': 'د. منى فؤاد',
      'المكان / المعمل': 'قاعة 101',
      'نوع الحصة': 'فصل نظري',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج إدخال الجداول');

  XLSX.writeFile(workbook, 'EBDA_EDU_Timetable_Standard_Template.xlsx');
}

export function exportTeachingProgressToExcel(
  records: TeachingRecord[],
  teachers: Teacher[],
  subjects: Subject[],
  classes: SchoolClass[]
) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));

  const rows = records.map((r, idx) => {
    const teacher = teacherMap.get(r.teacherId);
    const subject = subjectMap.get(r.subjectId);
    const cl = classMap.get(r.classId);

    const statusAr =
      r.lessonStatus === 'completed'
        ? 'تم التنفيذ (Completed)'
        : r.lessonStatus === 'partially_completed'
        ? 'تنفيذ جزئي (Partially)'
        : 'لم تنفذ (Not Completed)';

    return {
      'م': idx + 1,
      'التاريخ': r.date,
      'اليوم': getArabicDayName(r.dayOfWeek),
      'الوقت': `${r.startTime} - ${r.endTime}`,
      'المدة': `${r.durationMinutes} دقيقة (ساعة كاملة)`,
      'المادة': subject?.nameAr || '',
      'الفصل': cl?.nameAr || cl?.code || '',
      'المعلم': teacher?.name || '',
      'موضوع الحصة / ما تم تدريسه': r.lessonTopic,
      'الوحدة / الموديول': r.unitModule || '',
      'حالة التنفيذ': statusAr,
      'سبب عدم الاكتمال': r.notCompletedReason || '',
      'رابط المواد التعليمية (Drive/LMS)': r.materialsUrl || 'لا يوجد رابط',
      'متاح لأولياء الأمور': r.parentVisibility ? 'نعم' : 'مخفي',
      'ملاحظات المعلم': r.teacherNotes || '',
      'تاريخ التوثيق': r.recordedAt,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل ما تم تدريسه');

  const fileName = `EBDA_EDU_Teaching_Records_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

