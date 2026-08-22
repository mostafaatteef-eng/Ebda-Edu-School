import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  Layers,
  BookOpen,
  Link,
  Users,
  Search,
  CheckSquare,
  AlertCircle,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { NTSSEmblem, NTSSLogo } from '../common/NTSSLogo';
import {
  computeTeachingPerformanceMetrics,
  exportTeachingPerformanceReportToExcel,
  exportTeachingPerformanceReportToCSV,
  exportWorkloadReportToExcel,
  exportTeachingProgressToExcel,
  TeachingPerformanceData,
} from '../../utils/excelHelper';
import { getArabicDayName } from '../../utils/conflicts';

interface ReportsViewProps {
  onOpenPrintModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenPrintModal }) => {
  const {
    activeSchool,
    currentAcademicYear,
    timetableSlots,
    teachingRecords,
    teachers,
    subjects,
    classes,
    labs,
    workshops,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'performance' | 'scheduled_vs_delivered' | 'materials_coverage' | 'workload' | 'labs'
  >('performance');

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Compute all metrics
  const performanceData = useMemo(() => {
    return computeTeachingPerformanceMetrics(teachers, timetableSlots, teachingRecords);
  }, [teachers, timetableSlots, teachingRecords]);

  // Filtered performance data
  const filteredPerformanceData = useMemo(() => {
    return performanceData.filter((item) => {
      const matchesSearch =
        item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teacherCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeacher = !selectedTeacherId || item.teacherId === selectedTeacherId;
      const matchesDept = !selectedDepartment || item.department === selectedDepartment;
      return matchesSearch && matchesTeacher && matchesDept;
    });
  }, [performanceData, searchQuery, selectedTeacherId, selectedDepartment]);

  // Aggregates
  const totalScheduled = performanceData.reduce((acc, curr) => acc + curr.scheduledLessons, 0);
  const totalDelivered = performanceData.reduce((acc, curr) => acc + curr.deliveredLessons, 0);
  const totalCompleted = performanceData.reduce((acc, curr) => acc + curr.completedLessons, 0);
  const totalWithMaterials = performanceData.reduce((acc, curr) => acc + curr.materialsAttachedCount, 0);

  const overallCompletionRate = totalDelivered > 0 ? Math.round((totalCompleted / totalDelivered) * 100) : 0;
  const overallMaterialsCoverage = totalDelivered > 0 ? Math.round((totalWithMaterials / totalDelivered) * 100) : 0;
  const overallDocumentationRate = totalScheduled > 0 ? Math.round((totalDelivered / totalScheduled) * 100) : 0;

  // Export handlers
  const handleExportExcel = () => {
    exportTeachingPerformanceReportToExcel(filteredPerformanceData, activeSchool, currentAcademicYear.name);
  };

  const handleExportCSV = () => {
    exportTeachingPerformanceReportToCSV(filteredPerformanceData, activeSchool);
  };

  const handleTriggerPrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              تقارير أداء التدريس والمتابعة الأكاديمية (Teaching Performance & Audits)
            </h1>
            <Badge variant="primary" size="sm">
              معيار 60 دقيقة
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إصدار ومراجعة تقارير الحصص المجدولة مقابل المنفذة، معدلات الاكتمال، تغطية المرفقات والروابط، وتوثيق التدريس
          </p>
        </div>

        {/* Global Export Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="تصدير تقرير تفصيلي كملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="تصدير كملف CSV باللغة العربية (UTF-8)"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير CSV (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="px-4 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Top High-Impact Metric Cards (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Scheduled vs Delivered */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-right">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>المجدول مقابل المنفذ</span>
            <div className="p-2 rounded-xl bg-teal-50 text-[#25A09F]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalDelivered}</span>
            <span className="text-xs text-slate-500 font-bold">من {totalScheduled} حصة (ساعة)</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>فارق التنفيذ:</span>
            <span
              className={`font-bold ${
                totalDelivered >= totalScheduled ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {totalDelivered - totalScheduled >= 0 ? `+${totalDelivered - totalScheduled}` : totalDelivered - totalScheduled} ساعة
            </span>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-right">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>معدل اكتمال الدروس (Completion)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{overallCompletionRate}%</span>
            <span className="text-xs text-slate-500 font-bold">({totalCompleted} منجز بالكامل)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(overallCompletionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Materials Coverage Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-right">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>تغطية روابط المواد (Drive/LMS)</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Link className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{overallMaterialsCoverage}%</span>
            <span className="text-xs text-slate-500 font-bold">({totalWithMaterials} حصة بروابط)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(overallMaterialsCoverage, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Teaching Documentation Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-right">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>معدل توثيق التدريس الأسبوعي</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F35024]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#F35024]">{overallDocumentationRate}%</span>
            <span className="text-xs text-slate-500 font-bold">التزام هيئة التدريس</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#F35024] h-1.5 rounded-full"
              style={{ width: `${Math.min(overallDocumentationRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveReportTab('performance')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeReportTab === 'performance'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          تقرير أداء التدريس الشامل
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('scheduled_vs_delivered')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeReportTab === 'scheduled_vs_delivered'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          المجدول مقابل المنفذ ومعدل الاكتمال
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('materials_coverage')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeReportTab === 'materials_coverage'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          تغطية المرفقات والروابط التعليمية
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('workload')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeReportTab === 'workload'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          نصاب هيئة التدريس الفعلي (60 د)
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('labs')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeReportTab === 'labs'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          تشغيل المعامل والورش التطبيقية
        </button>
      </div>

      {/* Filter and Search Bar for Reports */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالمعلم أو التخصص أو الكود..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            />
          </div>

          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
          >
            <option value="">جميع المعلمين ({teachers.length})</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          عرض <strong>{filteredPerformanceData.length}</strong> من إجمالي <strong>{teachers.length}</strong> معلم
        </div>
      </div>

      {/* Main Report Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-right">
        {/* Document Subheader with NTSS Authentic Emblem */}
        <div className="border-b-2 border-[#00908E] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <NTSSEmblem className="w-10 h-10" color="#00908E" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900">NTSS</span>
                <span className="font-extrabold text-sm text-slate-900">{activeSchool.nameAr}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-[#00908E] font-bold">
                  المدارس الوطنية للعلوم التقنية
                </span>
              </div>
              <p className="text-xs text-[#00908E] font-extrabold mt-0.5">
                {activeReportTab === 'performance' && 'تقرير الأداء الأكاديمي الشامل (Comprehensive Teaching Performance)'}
                {activeReportTab === 'scheduled_vs_delivered' && 'تقرير الحصص المجدولة مقابل المنفذة ومعدلات الاكتمال (Scheduled vs Delivered)'}
                {activeReportTab === 'materials_coverage' && 'تقرير تغطية روابط المواد التعليمية والمرفقات (Materials Coverage Report)'}
                {activeReportTab === 'workload' && 'تقرير النصاب التعاقدي والفعلي لهيئة التدريس (معيار 60 دقيقة)'}
                {activeReportTab === 'labs' && 'تقرير تشغيل واستغلال المعامل والورش الهندسية'}
              </p>
            </div>
          </div>
          <div className="text-left text-xs text-slate-500 font-mono">
            <div>العام الدراسي: {currentAcademicYear.name} ({currentAcademicYear.term})</div>
            <div>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        {/* Tab 1: Comprehensive Performance Report */}
        {activeReportTab === 'performance' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 border-l border-slate-800">المعلم والكود</th>
                    <th className="p-3 border-l border-slate-800">التخصص</th>
                    <th className="p-3 border-l border-slate-800 text-center">المستهدف (س)</th>
                    <th className="p-3 border-l border-slate-800 text-center">المجدول (س)</th>
                    <th className="p-3 border-l border-slate-800 text-center">المنفذ (س)</th>
                    <th className="p-3 border-l border-slate-800 text-center">معدل التوثيق</th>
                    <th className="p-3 border-l border-slate-800 text-center">معدل الاكتمال</th>
                    <th className="p-3 border-l border-slate-800 text-center">تغطية الروابط</th>
                    <th className="p-3 text-center">التقييم الأكاديمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPerformanceData.map((d) => (
                    <tr key={d.teacherId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">
                        <div>{d.teacherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{d.teacherCode}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{d.specialization}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{d.targetHours} س</td>
                      <td className="p-3 text-center font-bold text-[#25A09F]">{d.scheduledHours} س</td>
                      <td className="p-3 text-center font-extrabold text-slate-900">{d.deliveredHours} س</td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-slate-900">{d.documentationRate}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-bold ${
                            d.completionRate >= 90
                              ? 'text-emerald-600'
                              : d.completionRate >= 70
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {d.completionRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-purple-700">{d.materialsCoverageRate}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            d.documentationRate >= 90 && d.completionRate >= 90
                              ? 'success'
                              : d.documentationRate >= 75
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {d.documentationRate >= 90 && d.completionRate >= 90
                            ? 'أداء ممتاز'
                            : d.documentationRate >= 75
                            ? 'أداء جيد'
                            : 'يتطلب متابعة'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Scheduled vs Delivered & Completion Rate */}
        {activeReportTab === 'scheduled_vs_delivered' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              يوضح هذا التقرير مقارنة دقيقة بين الحصص المخططة بالجدول المدرسي والحصص التي تم تسجيل تدريسها فعليًا، مع حساب ساعات العمل المعتمدة (60 دقيقة للجلسة).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 border-l border-slate-800">المعلم</th>
                    <th className="p-3 border-l border-slate-800 text-center">المجدول (حصص/ساعات)</th>
                    <th className="p-3 border-l border-slate-800 text-center">المنفذ (حصص/ساعات)</th>
                    <th className="p-3 border-l border-slate-800 text-center">الفارق (Variance)</th>
                    <th className="p-3 border-l border-slate-800 text-center">مكتمل بالكامل</th>
                    <th className="p-3 border-l border-slate-800 text-center">تنفيذ جزئي</th>
                    <th className="p-3 border-l border-slate-800 text-center">لم تنفذ</th>
                    <th className="p-3 text-center">نسبة الاكتمال (Completion Rate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPerformanceData.map((d) => (
                    <tr key={d.teacherId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{d.teacherName}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">{d.scheduledLessons} س</td>
                      <td className="p-3 text-center font-mono font-extrabold text-[#25A09F]">{d.deliveredLessons} س</td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span
                          className={
                            d.scheduledVsDeliveredDiff > 0
                              ? 'text-emerald-600'
                              : d.scheduledVsDeliveredDiff < 0
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }
                        >
                          {d.scheduledVsDeliveredDiff > 0 ? `+${d.scheduledVsDeliveredDiff}` : d.scheduledVsDeliveredDiff} س
                        </span>
                      </td>
                      <td className="p-3 text-center text-emerald-700 font-bold">{d.completedLessons}</td>
                      <td className="p-3 text-center text-amber-700 font-bold">{d.partiallyCompletedLessons}</td>
                      <td className="p-3 text-center text-rose-700 font-bold">{d.notCompletedLessons}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-slate-900">{d.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Materials Coverage & Documentation */}
        {activeReportTab === 'materials_coverage' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              يقيس هذا التقرير مدى التزام المعلمين بإرفاق روابط Google Drive وLMS والملازم التوضيحية داخل سجلات التدريس لتسهيل وصول أولياء الأمور والطلاب للمواد العلمية.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 border-l border-slate-800">المعلم</th>
                    <th className="p-3 border-l border-slate-800 text-center">إجمالي الحصص الموثقة</th>
                    <th className="p-3 border-l border-slate-800 text-center">الحصص بروابط مواد</th>
                    <th className="p-3 border-l border-slate-800 text-center">نسبة التغطية (Materials Rate)</th>
                    <th className="p-3 border-l border-slate-800 text-center">المعتمد لأولياء الأمور</th>
                    <th className="p-3 text-center">حالة الجاهزية الرقمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPerformanceData.map((d) => (
                    <tr key={d.teacherId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{d.teacherName}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">{d.deliveredLessons}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-purple-700">{d.materialsAttachedCount}</td>
                      <td className="p-3 text-center font-mono font-bold">
                        <Badge
                          variant={d.materialsCoverageRate >= 80 ? 'success' : d.materialsCoverageRate >= 50 ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {d.materialsCoverageRate}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-emerald-700 font-bold">{d.parentVisibleCount} حصة</td>
                      <td className="p-3 text-center">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {d.materialsCoverageRate >= 80 ? 'محتوى رقمي متكامل' : 'بحاجة لإرفاق المزيد'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Workload Report */}
        {activeReportTab === 'workload' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              يوضح هذا التقرير مدى توازن الساعات التدريسية الأسبوعية لجميع المعلمين مقارنة بالنصاب التعاقدي المستهدف (معيار 60 دقيقة للجلسة).
            </p>
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">المعلم</th>
                    <th className="p-3">التخصص</th>
                    <th className="p-3 text-center">المستهدف</th>
                    <th className="p-3 text-center">المجدول</th>
                    <th className="p-3 text-center">الفارق</th>
                    <th className="p-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const scheduled = timetableSlots.filter((s) => s.teacherId === t.id).length;
                    const diff = scheduled - t.targetWeeklyLessons;
                    return (
                      <tr key={t.id}>
                        <td className="p-3 font-bold text-slate-900">{t.name}</td>
                        <td className="p-3 text-slate-600">{t.specialization}</td>
                        <td className="p-3 text-center font-mono">{t.targetWeeklyLessons} س</td>
                        <td className="p-3 text-center font-mono font-bold text-[#25A09F]">{scheduled} س</td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {diff > 0 ? `+${diff}` : diff} س
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={diff === 0 ? 'success' : diff > 0 ? 'danger' : 'warning'} size="sm">
                            {diff === 0 ? 'نصاب متوازن' : diff > 0 ? 'عبء زائد' : 'أقل من المستهدف'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Labs & Workshops */}
        {activeReportTab === 'labs' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              حالة تشغيل وتوزيع الساعات التدريسية بالمعامل التكنولوجية والورش الصناعية التابعة لمدرسة ابدأ – بدر.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labs.map((l) => (
                <div key={l.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-extrabold text-slate-900 text-sm">{l.nameAr} ({l.code})</div>
                  <div className="text-slate-600">الموقع: {l.location}</div>
                  <div className="text-slate-600">السعة: {l.capacity} طالب • مجهز بالكامل</div>
                  <div className="text-[11px] text-slate-500 pt-1 leading-snug">
                    التجهيزات: {l.equipmentSummary}
                  </div>
                  <div className="font-bold text-[#25A09F] pt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>الحالة: جاهز للتدريب العملي وتطبيق الجدارات</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formal Document Signatures */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div>
            <span className="font-bold text-slate-900">مسؤول توثيق العمليات:</span> أ/ شريف علام (مدير العمليات الأكاديمية)
          </div>
          <div>
            <span className="font-bold text-slate-900">يعتمد، مدير المدرسة:</span> د/ إبراهيم رضوان
          </div>
        </div>
      </div>

      {/* PDF / Formal Printable Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="معاينة التقرير الرسمي المعتمد للطباعة (A4 Print Preview)"
        subtitle="تقرير أداء التدريس والامتثال الأكاديمي الشامل بمدرسة ابدأ – بدر"
        maxWidth="4xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>إرسال إلى الطابعة / حفظ PDF</span>
            </button>
          </div>
        }
      >
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 text-right font-sans text-xs">
          {/* Printable Header with Authentic NTSS Emblem */}
          <div className="border-b-2 border-[#00908E] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NTSSEmblem className="w-12 h-12" color="#00908E" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900">NTSS</span>
                  <span className="text-xs font-bold text-[#00908E]">المدارس الوطنية للعلوم التقنية</span>
                </div>
                <h2 className="text-base font-black text-slate-900">{activeSchool.nameAr}</h2>
                <div className="text-[11px] font-bold text-[#00908E] mt-0.5">
                  تقرير الأداء الأكاديمي والتوثيق المعتمد
                </div>
              </div>
            </div>
            <div className="text-left font-mono text-[11px] text-slate-500">
              <div>العام: {currentAcademicYear.name}</div>
              <div>الفصل: {currentAcademicYear.term}</div>
              <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          {/* Quick Metrics Summary Box */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold">الحصص المجدولة</div>
              <div className="text-lg font-black text-slate-900">{totalScheduled} س</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold">الحصص المنفذة</div>
              <div className="text-lg font-black text-[#25A09F]">{totalDelivered} س</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold">معدل الاكتمال</div>
              <div className="text-lg font-black text-emerald-600">{overallCompletionRate}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold">تغطية الروابط والمواد</div>
              <div className="text-lg font-black text-purple-700">{overallMaterialsCoverage}%</div>
            </div>
          </div>

          {/* Detailed Table */}
          <table className="w-full border border-slate-300 text-right">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 border-l border-slate-300">م</th>
                <th className="p-2 border-l border-slate-300">اسم المعلم</th>
                <th className="p-2 border-l border-slate-300">التخصص</th>
                <th className="p-2 border-l border-slate-300 text-center">المستهدف</th>
                <th className="p-2 border-l border-slate-300 text-center">المجدول</th>
                <th className="p-2 border-l border-slate-300 text-center">المنفذ</th>
                <th className="p-2 border-l border-slate-300 text-center">معدل التوثيق</th>
                <th className="p-2 border-l border-slate-300 text-center">معدل الاكتمال</th>
                <th className="p-2 text-center">تغطية المواد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {performanceData.map((d, idx) => (
                <tr key={d.teacherId}>
                  <td className="p-2 border-l border-slate-200 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-l border-slate-200 font-bold text-slate-900">{d.teacherName}</td>
                  <td className="p-2 border-l border-slate-200 text-slate-600">{d.specialization}</td>
                  <td className="p-2 border-l border-slate-200 text-center font-mono">{d.targetHours} س</td>
                  <td className="p-2 border-l border-slate-200 text-center font-mono">{d.scheduledHours} س</td>
                  <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-[#25A09F]">{d.deliveredHours} س</td>
                  <td className="p-2 border-l border-slate-200 text-center font-mono font-bold">{d.documentationRate}%</td>
                  <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-emerald-700">{d.completionRate}%</td>
                  <td className="p-2 text-center font-mono font-bold text-purple-700">{d.materialsCoverageRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Certification Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 leading-relaxed text-[11px]">
            تشهد إدارة العمليات والتشغيل الأكاديمي بمدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية بأن جميع الساعات التدريسية المسجلة أعلاه قد تم تنفيذها وتوثيقها وفق المعيار المعتمد للمدرسة (60 دقيقة لكل حصة/جلسة)، وتمت مراجعة روابط المواد والملازم الإلكترونية.
          </div>

          {/* Formal Signatures */}
          <div className="pt-6 flex items-center justify-between text-xs text-slate-700">
            <div className="text-center">
              <div>إعداد ومراجعة مدير العمليات:</div>
              <div className="font-extrabold mt-1">أ/ شريف علام</div>
            </div>
            <div className="text-center">
              <div>يعتمد، مدير المدرسة:</div>
              <div className="font-extrabold mt-1">د/ إبراهيم رضوان</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
