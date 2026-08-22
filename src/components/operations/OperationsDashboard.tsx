import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  FlaskConical,
  BookOpen,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Link,
  ChevronLeft,
  Activity,
  Layers,
  CheckSquare,
  Filter,
  X,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { getArabicDayName } from '../../utils/conflicts';
import { Teacher, Subject, SchoolClass, Grade, TeachingRecord, TimetableSlot } from '../../types';
import { SYSTEM_DEFAULTS, WEEKLY_TEACHING_LOAD } from '../../utils/businessRules';

interface OperationsDashboardProps {
  onSelectTab: (tabId: string) => void;
  onOpenPrintModal: () => void;
  onOpenAddTeacherModal?: () => void;
  onOpenAddSlotModal?: () => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  onSelectTab,
  onOpenPrintModal,
  onOpenAddTeacherModal,
  onOpenAddSlotModal,
}) => {
  const {
    currentUser,
    activeSchool,
    currentAcademicYear,
    timetableSlots,
    teachingRecords,
    teachers,
    subjects,
    grades,
    classes,
    labs,
    workshops,
    conflicts,
    smartAlerts,
    activityLogs,
    resolveAlert,
    getTeacherWorkload,
  } = useApp();

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [materialsFilter, setMaterialsFilter] = useState<'all' | 'with_materials' | 'missing_materials'>('all');

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));
  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));

  const hasActiveFilters =
    periodFilter !== 'all' ||
    selectedTeacherId !== 'all' ||
    selectedGradeId !== 'all' ||
    selectedClassId !== 'all' ||
    selectedSubjectId !== 'all' ||
    selectedStatus !== 'all' ||
    materialsFilter !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const clearFilters = () => {
    setPeriodFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedTeacherId('all');
    setSelectedGradeId('all');
    setSelectedClassId('all');
    setSelectedSubjectId('all');
    setSelectedStatus('all');
    setMaterialsFilter('all');
  };

  // Helper date calculation
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filtered Timetable Slots
  const filteredSlots = useMemo(() => {
    return timetableSlots.filter((slot) => {
      if (selectedTeacherId !== 'all' && slot.teacherId !== selectedTeacherId) return false;
      if (selectedGradeId !== 'all' && slot.gradeId !== selectedGradeId) return false;
      if (selectedClassId !== 'all' && slot.classId !== selectedClassId) return false;
      if (selectedSubjectId !== 'all' && slot.subjectId !== selectedSubjectId) return false;
      return true;
    });
  }, [timetableSlots, selectedTeacherId, selectedGradeId, selectedClassId, selectedSubjectId]);

  // Filtered Teaching Records
  const filteredRecords = useMemo(() => {
    return teachingRecords.filter((rec) => {
      // Period filter
      if (periodFilter === 'today' && rec.date !== todayStr) return false;
      if (periodFilter === 'custom') {
        if (customStartDate && rec.date < customStartDate) return false;
        if (customEndDate && rec.date > customEndDate) return false;
      }

      // Teacher filter
      if (selectedTeacherId !== 'all' && rec.teacherId !== selectedTeacherId) return false;
      // Grade filter
      if (selectedGradeId !== 'all' && rec.gradeId !== selectedGradeId) return false;
      // Class filter
      if (selectedClassId !== 'all' && rec.classId !== selectedClassId) return false;
      // Subject filter
      if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
      // Status filter
      if (selectedStatus !== 'all' && rec.lessonStatus !== selectedStatus) return false;
      // Materials filter
      if (materialsFilter === 'with_materials' && (!rec.materialsUrl || rec.materialsUrl.trim() === '')) return false;
      if (materialsFilter === 'missing_materials' && rec.materialsUrl && rec.materialsUrl.trim() !== '') return false;

      return true;
    });
  }, [
    teachingRecords,
    periodFilter,
    todayStr,
    customStartDate,
    customEndDate,
    selectedTeacherId,
    selectedGradeId,
    selectedClassId,
    selectedSubjectId,
    selectedStatus,
    materialsFilter,
  ]);

  // Dynamic metrics derived purely from filtered data
  const totalScheduledCount = filteredSlots.length;
  const totalScheduledHours = totalScheduledCount * 1; // 60 min standard

  const completedCount = filteredRecords.filter((r) => r.lessonStatus === 'completed').length;
  const partiallyCompletedCount = filteredRecords.filter((r) => r.lessonStatus === 'partially_completed').length;
  const notCompletedCount = filteredRecords.filter((r) => r.lessonStatus === 'not_completed').length;
  const totalRecordedCount = filteredRecords.length;

  const withMaterialsCount = filteredRecords.filter((r) => !!r.materialsUrl && r.materialsUrl.trim() !== '').length;
  const missingMaterialsCount = totalRecordedCount - withMaterialsCount;

  // Pending lessons = scheduled lessons that do not yet have a record
  const pendingCount = Math.max(0, totalScheduledCount - totalRecordedCount);

  // Computed percentages
  const documentationRate = totalScheduledCount > 0 ? Math.round((totalRecordedCount / totalScheduledCount) * 100) : 0;
  const completionRate = totalRecordedCount > 0 ? Math.round((completedCount / totalRecordedCount) * 100) : 0;
  const materialsCoverageRate = totalRecordedCount > 0 ? Math.round((withMaterialsCount / totalRecordedCount) * 100) : 0;

  // Teacher Workload summaries across teachers
  const relevantTeachers = selectedTeacherId === 'all' 
    ? teachers 
    : teachers.filter((t) => t.id === selectedTeacherId);

  const teacherSummaries = relevantTeachers.map((t) => getTeacherWorkload(t.id));
  const totalTargetHours = teacherSummaries.reduce((sum, t) => sum + (t.targetWeeklyHours || WEEKLY_TEACHING_LOAD), 0);
  const totalActualScheduled = teacherSummaries.reduce((sum, t) => sum + t.actualScheduledHours, 0);
  const overloadedTeachersCount = teacherSummaries.filter((t) => t.workloadStatus === 'overloaded').length;
  const underloadedTeachersCount = teacherSummaries.filter((t) => t.workloadStatus === 'underloaded').length;
  const balancedTeachersCount = teacherSummaries.filter((t) => t.workloadStatus === 'balanced').length;

  const unresolvedAlerts = smartAlerts.filter((a) => !a.resolved);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              لوحة العمليات والمتابعة الشاملة (Operations Dashboard)
            </h1>
            <Badge variant="primary" size="sm">
              معيار 25 حصة/أسبوع (60 دقيقة)
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة فورية ومباشرة للأنشطة التشغيلية، نصاب التدريس المعتمد (25 ساعة أسبوعية)، ومؤشرات التوثيق وروابط المحتوى
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#25A09F]" />
            <span>طباعة الجداول</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('timetable')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>إدارة الجدول</span>
          </button>
        </div>
      </div>

      {/* Operations Dashboard Dynamic Filters Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#25A09F]/10 text-[#25A09F]">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">فلاتر لوحة العمليات (Dashboard Filters)</h2>
              <p className="text-[11px] text-slate-500">تحديث لحظي لجميع الإحصائيات والجداول والرسوم البيانية بناءً على المعايير المحددة</p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الفلاتر (Clear Filters)</span>
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Period Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">الفترة الزمنية (Period)</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">جميع الفترات (All Time)</option>
              <option value="today">اليوم (Today)</option>
              <option value="this_week">هذا الأسبوع (This Week)</option>
              <option value="this_month">هذا الشهر (This Month)</option>
              <option value="custom">نطاق مخصص (Custom Range)</option>
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المعلم (Teacher)</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">جميع المعلمين ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Grade / Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">الصف / الفصل (Grade & Class)</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">جميع الفصول ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المادة الدراسية (Subject)</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">جميع المواد ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">حالة الحصة (Lesson Status)</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">جميع الحالات (All Statuses)</option>
              <option value="completed">تم التنفيذ بالكامل (Completed)</option>
              <option value="partially_completed">تنفيذ جزئي (Partially Completed)</option>
              <option value="not_completed">لم تنفذ (Not Completed)</option>
            </select>
          </div>

          {/* Materials Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المواد والمرفقات (Lesson Materials)</label>
            <select
              value={materialsFilter}
              onChange={(e) => setMaterialsFilter(e.target.value as any)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              <option value="all">الكل (All Materials)</option>
              <option value="with_materials">مرفق رابط المواد (Materials Uploaded)</option>
              <option value="missing_materials">بدون رابط مواد (Materials Missing)</option>
            </select>
          </div>

          {/* Custom Date Range if selected */}
          {periodFilter === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">من تاريخ (From Date)</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">إلى تاريخ (To Date)</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#25A09F]"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main KPI Cards Section (Dynamic & Filter-Aware) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scheduled */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الحصص المجدولة</span>
            <span className="text-[10px] bg-[#25A09F]/10 text-[#25A09F] px-2 py-0.5 rounded-full font-bold">
              60 دقيقة / حصة
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalScheduledCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {totalScheduledHours} ساعة تدريس فعلية
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#25A09F] rounded-full transition-all"
                style={{ width: `${Math.min(documentationRate, 100)}%` }}
              />
            </div>
            <span className="font-bold text-slate-700">{documentationRate}%</span>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>تم التنفيذ والتوثيق</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {completedCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              قيد الانتظار: {pendingCount} • جزئي: {partiallyCompletedCount}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <span>نسبة الإنجاز الفعلي</span>
            <span>{completionRate}%</span>
          </div>
        </div>

        {/* Materials Uploaded */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>روابط المواد والملازم</span>
            <Link className="w-4 h-4 text-[#25A09F]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {withMaterialsCount}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              مرفق رابط Google Drive / OneDrive
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-[#1E807F] bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
            <span>تغطية روابط المواد</span>
            <span>{materialsCoverageRate}%</span>
          </div>
        </div>

        {/* Urgent Alerts / Conflicts Bento Card */}
        <div className="bg-[#F35024] text-white p-5 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <span>⚠️ تنبيهات المتابعة</span>
                <span className="bg-white/30 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  {unresolvedAlerts.length}
                </span>
              </h3>
              {conflicts.length > 0 && (
                <span className="text-[10px] font-bold bg-white text-[#F35024] px-2 py-0.5 rounded-full">
                  {conflicts.length} تعارض
                </span>
              )}
            </div>

            {unresolvedAlerts.length === 0 ? (
              <div className="bg-white/20 p-2.5 rounded-xl text-xs backdrop-blur-xs border border-white/20">
                <strong>العمليات منضبطة:</strong> لا توجد أي تعارضات أو نقص في التوثيق حاليًا.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                {unresolvedAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white/20 p-2 rounded-xl text-[11px] backdrop-blur-xs border border-white/20 flex items-center justify-between gap-2"
                  >
                    <div className="truncate font-medium">
                      <strong>{alert.title}:</strong> {alert.message}
                    </div>
                    <button
                      type="button"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-[9px] bg-white/30 hover:bg-white/40 text-white px-2 py-0.5 rounded-lg shrink-0 font-bold"
                    >
                      تم
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 pt-2 flex items-center justify-between text-[10px] text-white/90 border-t border-white/20 mt-1">
            <span>النظام اللحظي المعتمد</span>
            <button
              type="button"
              onClick={() => onSelectTab('timetable')}
              className="text-white font-bold hover:underline"
            >
              فحص الجدول ←
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Filtered Schedule & Teaching Load Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Filtered Schedule Table Preview (3 Columns) */}
        <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#25A09F]" />
                  <span>جدول الحصص والتنفيذ ({filteredSlots.length} حصة)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  معيار الجلسة: 60 دقيقة • معامل وورش تخصصية وقاعات دراسية
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTab('teaching_progress')}
                  className="text-xs bg-[#25A09F]/10 text-[#1E807F] hover:bg-[#25A09F]/20 px-3 py-1.5 rounded-xl font-bold transition-colors"
                >
                  سجل التوثيق الكامل
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('timetable')}
                  className="text-xs bg-[#25A09F] text-white hover:bg-[#1E807F] px-3.5 py-1.5 rounded-xl font-bold transition-colors shadow-xs"
                >
                  إدارة الجدول
                </button>
              </div>
            </div>

            {/* Empty State vs Schedule Rows */}
            {filteredSlots.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-3 my-4">
                <p className="text-xs font-bold text-slate-600">لا توجد حصص أو سجلات مطابقة للفلاتر المحددة (No lessons found)</p>
                <p className="text-[11px] text-slate-400">يرجى تعديل خيارات الفلترة أو الضغط على إعادة تعيين الفلاتر لعرض البيانات.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-[#25A09F] text-white text-xs font-bold rounded-xl hover:bg-[#1E807F] transition shadow-xs"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-4 overflow-x-auto">
                <div className="grid grid-cols-6 min-w-[540px] text-xs font-bold text-slate-400 border-b border-slate-100 pb-2 px-3">
                  <div>اليوم والوقت (60د)</div>
                  <div>المادة</div>
                  <div>المعلم</div>
                  <div>الصف/الفصل</div>
                  <div>المكان / المعمل</div>
                  <div className="text-left">حالة التوثيق والمواد</div>
                </div>

                {filteredSlots.slice(0, 6).map((slot) => {
                  const teacher = teacherMap.get(slot.teacherId);
                  const sub = subjectMap.get(slot.subjectId);
                  const cl = classMap.get(slot.classId);

                  // Find matching record
                  const record = teachingRecords.find(
                    (r) => r.timetableSlotId === slot.id || (r.teacherId === slot.teacherId && r.classId === slot.classId && r.subjectId === slot.subjectId)
                  );

                  return (
                    <div
                      key={slot.id}
                      className="grid grid-cols-6 min-w-[540px] text-xs items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#25A09F]/40 transition-all"
                    >
                      <div className="font-mono text-xs font-bold text-slate-700">
                        <span>{getArabicDayName(slot.dayOfWeek)}</span>
                        <div className="text-[10px] text-slate-400">{slot.startTime} - {slot.endTime}</div>
                      </div>
                      <div className="font-bold text-[#1E807F] truncate">
                        {sub?.nameAr || 'المادة'}
                      </div>
                      <div className="text-slate-800 font-medium truncate">
                        {teacher?.name || 'معلم المادة'}
                      </div>
                      <div className="text-slate-600 truncate">
                        {cl?.nameAr || cl?.code}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {slot.labId ? 'معمل الحاسب / الروبوتكس' : slot.workshopId ? 'ورشة هندسية' : slot.roomName || 'فصل دراسي'}
                      </div>
                      <div className="text-left flex items-center justify-end gap-1.5">
                        {record ? (
                          <>
                            <Badge
                              variant={record.lessonStatus === 'completed' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {record.lessonStatus === 'completed' ? 'تم التوثيق' : 'جزئي'}
                            </Badge>
                            {record.materialsUrl && (
                              <a
                                href={record.materialsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-[#25A09F] hover:bg-teal-50 rounded-lg"
                                title="عرض المواد التعليمية"
                              >
                                <Link className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            بانتظار التسجيل
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Teaching Load Analysis Bento Card (1 Column) */}
        <div className="col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">تحليل نصاب التدريس</h3>
              <button
                type="button"
                onClick={() => onSelectTab('analytics')}
                className="text-[11px] font-bold text-[#25A09F] hover:underline"
              >
                التحليلات ←
              </button>
            </div>

            <div className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">إجمالي الساعات المجدولة</span>
                  <span className="text-slate-900 font-mono">{totalActualScheduled} ساعة</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#25A09F] rounded-full transition-all"
                    style={{ width: `${totalTargetHours > 0 ? Math.min(Math.round((totalActualScheduled / totalTargetHours) * 100), 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Standardized 25 Lesson Weekly Target Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">النصاب المستهدف</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">{WEEKLY_TEACHING_LOAD}</p>
                  <p className="text-[10px] text-slate-400 font-medium">حصة / 25 ساعة</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-[#F35024] font-bold uppercase mb-0.5">تنبيهات النصاب</p>
                  <p className="text-2xl font-black text-[#F35024] font-mono">
                    {overloadedTeachersCount + underloadedTeachersCount}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">معلم بحاجة لتعديل</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">معلمون بنصاب مثالي:</span>
                  <span className="font-extrabold text-emerald-600">{balancedTeachersCount} من {relevantTeachers.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">معلمون فوق النصاب:</span>
                  <span className="font-extrabold text-rose-600">{overloadedTeachersCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">معلمون دون النصاب:</span>
                  <span className="font-extrabold text-amber-600">{underloadedTeachersCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            معيار التدريس الرسمي: <strong>25 حصة أسبوعياً (25 ساعة معتمدة)</strong> بواقع 60 دقيقة لكل حصة.
          </div>
        </div>
      </div>

      {/* Quick Action Logs & Activity Stream */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#25A09F]" />
            <h3 className="text-base font-extrabold text-slate-900">سجل النشاط والعمليات المعتمدة (Recent Audit Logs)</h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('activity_log')}
            className="text-xs font-bold text-[#25A09F] hover:underline"
          >
            عرض سجل التدقيق الكامل ←
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activityLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              لا توجد أنشطة مسجلة في الجلسة الحالية.
            </div>
          ) : (
            activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{log.description}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{log.timestamp.slice(0, 19).replace('T', ' ')}</div>
                </div>
                <Badge variant="neutral" size="sm">
                  {log.action}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
