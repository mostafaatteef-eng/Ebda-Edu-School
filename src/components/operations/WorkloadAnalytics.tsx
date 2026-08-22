import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { getArabicDayName } from '../../utils/conflicts';
import { exportWorkloadToExcel } from '../../utils/excelHelper';
import { TeacherWorkloadSummary, Teacher, Subject, SchoolClass } from '../../types';

interface WorkloadAnalyticsProps {
  onOpenPrintModal?: () => void;
}

export const WorkloadAnalytics: React.FC<WorkloadAnalyticsProps> = ({ onOpenPrintModal }) => {
  const {
    activeSchool,
    teachers,
    subjects,
    classes,
    timetableSlots,
    teachingRecords,
    getTeacherWorkload,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inspectTeacher, setInspectTeacher] = useState<TeacherWorkloadSummary | null>(null);

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  // Compute summary for all teachers
  const teacherSummaries: TeacherWorkloadSummary[] = teachers.map((t) => getTeacherWorkload(t.id));

  // School aggregate statistics
  const totalTargetHours = teacherSummaries.reduce((sum, t) => sum + t.targetWeeklyHours, 0);
  const totalScheduledHours = teacherSummaries.reduce((sum, t) => sum + t.actualScheduledHours, 0);
  const balancedTeachers = teacherSummaries.filter((t) => t.workloadStatus === 'balanced');
  const overloadedTeachers = teacherSummaries.filter((t) => t.workloadStatus === 'overloaded');
  const underloadedTeachers = teacherSummaries.filter((t) => t.workloadStatus === 'underloaded');

  const filteredSummaries = teacherSummaries.filter((item) => {
    const matchesSearch =
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.workloadStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportWorkloadToExcel(teacherSummaries, activeSchool);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              تحليل وتوزيع أنصبة هيئة التدريس (Teacher Workload Analytics)
            </h1>
            <Badge variant="primary" size="sm">
              معيار 60 دقيقة لكل حصة
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة ومقارنة النصاب التعاقدي بالساعات المجدولة فعليًا ومعدلات توثيق الدروس لكل معلم
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            تصدير كتقرير Excel
          </button>
          {onOpenPrintModal && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="px-4 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة الجداول
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-target"
          title="إجمالي النصاب المطلوب"
          value={`${totalTargetHours} ساعة`}
          subtitle="ساعات أسبوعية مستهدفة للمدرسة"
          icon={<Clock className="w-5 h-5" />}
          accentColor="#25A09F"
        />

        <StatCard
          id="stat-total-scheduled"
          title="إجمالي الساعات المجدولة"
          value={`${totalScheduledHours} ساعة`}
          subtitle="حصص موزعة على الجداول"
          icon={<Layers className="w-5 h-5" />}
          accentColor="#3B82F6"
        />

        <StatCard
          id="stat-balanced-teachers"
          title="معلمون بنصاب مثالي"
          value={`${balancedTeachers.length} من ${teachers.length}`}
          subtitle="تطابق النصاب الفعلي مع المستهدف"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="#10B981"
          badge={{ text: `${Math.round((balancedTeachers.length / (teachers.length || 1)) * 100)}%`, variant: 'success' }}
        />

        <StatCard
          id="stat-workload-alerts"
          title="معلمون بحاجة لتعديل"
          value={`${overloadedTeachers.length + underloadedTeachers.length} معلماً`}
          subtitle={`${overloadedTeachers.length} زائد • ${underloadedTeachers.length} أقل`}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="#F59E0B"
          badge={
            overloadedTeachers.length + underloadedTeachers.length > 0
              ? { text: 'يتطلب مراجعة', variant: 'warning' }
              : { text: 'منضبط', variant: 'success' }
          }
        />
      </div>

      {/* Workload Distribution Grid & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المعلم أو التخصص..."
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="all">جميع حالات النصاب</option>
              <option value="balanced">نصاب مثالي (متوازن)</option>
              <option value="overloaded">فوق النصاب (Overloaded)</option>
              <option value="underloaded">أقل من النصاب (Underloaded)</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            عرض <strong>{filteredSummaries.length}</strong> من إجمالي <strong>{teachers.length}</strong> معلماً
          </div>
        </div>

        {/* Teachers Workload Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 border-l border-slate-800">المعلم والتخصص</th>
                <th className="p-3.5 border-l border-slate-800 text-center">المستهدف (ساعة)</th>
                <th className="p-3.5 border-l border-slate-800 text-center">المجدول الفعلي</th>
                <th className="p-3.5 border-l border-slate-800 text-center">الفارق (Variance)</th>
                <th className="p-3.5 border-l border-slate-800 text-center">حالة النصاب</th>
                <th className="p-3.5 border-l border-slate-800 text-center">نسبة التوثيق</th>
                <th className="p-3.5 border-l border-slate-800 text-center">روابط المواد</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((item) => {
                const teacherObj = teacherMap.get(item.teacherId);
                const diff = item.actualScheduledHours - item.targetWeeklyHours;

                return (
                  <tr key={item.teacherId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Teacher Info */}
                    <td className="p-3.5 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#1E807F] font-black text-xs flex items-center justify-center shrink-0">
                          {item.teacherName.trim().slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{item.teacherName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{item.specialization}</div>
                        </div>
                      </div>
                    </td>

                    {/* Target Hours */}
                    <td className="p-3.5 align-top text-center font-bold text-slate-800">
                      {item.targetWeeklyHours} ساعة
                    </td>

                    {/* Actual Hours */}
                    <td className="p-3.5 align-top text-center font-extrabold text-slate-900 font-mono text-sm">
                      {item.actualScheduledHours} ساعة
                    </td>

                    {/* Variance */}
                    <td className="p-3.5 align-top text-center font-mono font-bold">
                      <span
                        className={`${
                          diff > 0
                            ? 'text-rose-600'
                            : diff < 0
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff} ساعة
                      </span>
                    </td>

                    {/* Workload Status */}
                    <td className="p-3.5 align-top text-center">
                      <Badge
                        variant={
                          item.workloadStatus === 'balanced'
                            ? 'success'
                            : item.workloadStatus === 'overloaded'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.workloadStatus === 'balanced'
                          ? 'نصاب مثالي'
                          : item.workloadStatus === 'overloaded'
                          ? 'فوق النصاب'
                          : 'أقل من النصاب'}
                      </Badge>
                    </td>

                    {/* Documentation Rate */}
                    <td className="p-3.5 align-top text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900 font-mono">{item.documentationRate}%</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-[#25A09F] h-1.5 rounded-full"
                            style={{ width: `${Math.min(item.documentationRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Materials Coverage */}
                    <td className="p-3.5 align-top text-center font-bold text-purple-700 font-mono">
                      {item.materialsCoverageRate}%
                    </td>

                    {/* Action Detail */}
                    <td className="p-3.5 align-top text-center">
                      <button
                        type="button"
                        onClick={() => setInspectTeacher(item)}
                        className="px-3 py-1.5 text-xs font-bold text-[#25A09F] bg-[#25A09F]/10 hover:bg-[#25A09F]/20 rounded-xl transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Detailed Modal */}
      <Modal
        isOpen={!!inspectTeacher}
        onClose={() => setInspectTeacher(null)}
        title={`الملف الأكاديمي والنصاب: ${inspectTeacher?.teacherName || ''}`}
        subtitle={`التخصص: ${inspectTeacher?.specialization || ''} • معيار الجلسات: 60 دقيقة`}
        maxWidth="3xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setInspectTeacher(null)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إغلاق
            </button>
          </div>
        }
      >
        {inspectTeacher && (
          <div className="space-y-6 text-right">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] text-slate-500 font-bold">النصاب المستهدف</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {inspectTeacher.targetWeeklyHours} ساعة
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] text-slate-500 font-bold">المجدول الفعلي</div>
                <div className="text-xl font-extrabold text-[#25A09F] mt-1">
                  {inspectTeacher.actualScheduledHours} ساعة
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] text-slate-500 font-bold">الحصص الموثقة</div>
                <div className="text-xl font-extrabold text-emerald-700 mt-1">
                  {inspectTeacher.completedLessonsCount} حصة
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] text-slate-500 font-bold">تغطية روابط المواد</div>
                <div className="text-xl font-extrabold text-purple-700 mt-1">
                  {inspectTeacher.materialsCoverageRate}%
                </div>
              </div>
            </div>

            {/* Timetable Slots for this Teacher */}
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#25A09F]" />
                الحصص المجدولة أسبوعيًا للمعلم
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">اليوم</th>
                      <th className="p-2.5">التوقيت (60 دقيقة)</th>
                      <th className="p-2.5">المادة</th>
                      <th className="p-2.5">الفصل</th>
                      <th className="p-2.5">القاعة / المعمل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timetableSlots
                      .filter((s) => s.teacherId === inspectTeacher.teacherId)
                      .map((slot) => (
                        <tr key={slot.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-900">{getArabicDayName(slot.dayOfWeek)}</td>
                          <td className="p-2.5 font-mono text-slate-600">{slot.startTime} - {slot.endTime}</td>
                          <td className="p-2.5 font-bold">{subjectMap.get(slot.subjectId)?.nameAr}</td>
                          <td className="p-2.5">فصل: {classMap.get(slot.classId)?.code}</td>
                          <td className="p-2.5 text-slate-500">{slot.roomName}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
