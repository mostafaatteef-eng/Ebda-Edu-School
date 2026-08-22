import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Download,
  Printer,
  ChevronLeft,
  Search,
  Clock,
  CheckSquare,
  Link,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { NTSSEmblem, NTSSLogo } from '../common/NTSSLogo';
import { getArabicDayName } from '../../utils/conflicts';
import { Teacher, Subject, Grade } from '../../types';

interface ParentPortalViewProps {
  onOpenPrintModal?: () => void;
  initialTab?: 'taught' | 'schedule' | 'summary' | 'materials';
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  onOpenPrintModal,
  initialTab = 'taught',
}) => {
  const {
    activeSchool,
    currentAcademicYear,
    classes,
    grades,
    subjects,
    teachers,
    timetableSlots,
    teachingRecords,
    timeSlots,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'taught' | 'schedule' | 'summary' | 'materials'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));

  // Visible records for this class
  const classRecords = teachingRecords.filter(
    (r) => r.classId === selectedClassId && r.parentVisibility
  );

  const recordsWithMaterials = classRecords.filter(
    (r) => !!r.materialsUrl && r.materialsUrl.trim() !== ''
  );

  // Class timetable slots
  const classSlots = timetableSlots.filter((s) => s.classId === selectedClassId);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Parent Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E807F] p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="relative z-10 space-y-3 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-teal-200">
            <Sparkles className="w-3.5 h-3.5" />
            بوابة أولياء الأمور والمتابعة الأكاديمية الموحدة
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            متابعة أبنائنا في {activeSchool.nameAr}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            مرحبًا بكم في المنصة الرسمية لمتابعة الدروس المنفذة أسبوعيًا، الاطلاع على روابط المحتوى والملازم على Google Drive، ومتابعة الجداول الدراسية المعتمدة (جلسات 60 دقيقة).
          </p>
        </div>

        <div className="shrink-0 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hidden sm:flex items-center justify-center">
          <NTSSLogo variant="white" size="sm" layout="vertical" />
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#25A09F]/10 text-[#25A09F]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500">اختر فصل الطالب للمتابعة:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 mt-0.5"
            >
              {classes.length === 0 ? (
                <option value="">لا توجد فصول دراسية مسجلة حالياً</option>
              ) : (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr} ({c.code}) - {gradeMap.get(c.gradeId)?.nameAr}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('taught')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'taught'
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ما تم تدريسه ({classRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'materials'
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>روابط الملازم ({recordsWithMaterials.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الجدول الأسبوعي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ملخص التعلم الأسبوعي
          </button>
        </div>
      </div>

      {/* Tab 1: What Was Taught (Card Stream) */}
      {activeTab === 'taught' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#25A09F]" />
              الدروس والمواد الموثقة لفصل {selectedClass?.nameAr}
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              يتم تحديث السجلات فور انتهاء الحصة مباشرة
            </div>
          </div>

          {classRecords.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              لم يتم توثيق حصص جديدة لهذا الفصل حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classRecords.map((rec) => {
                const sub = subjectMap.get(rec.subjectId);
                const teacher = teacherMap.get(rec.teacherId);

                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          {rec.date} ({getArabicDayName(rec.dayOfWeek)})
                        </span>
                        <Badge
                          variant={rec.lessonStatus === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {rec.lessonStatus === 'completed' ? 'تم الشرح بالكامل' : 'تنفيذ جزئي'}
                        </Badge>
                      </div>

                      {/* Subject & Teacher */}
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{sub?.nameAr}</h3>
                        <div className="text-xs text-[#1E807F] font-bold mt-0.5">
                          المعلم: {teacher?.name}
                        </div>
                      </div>

                      {/* Lesson Topic */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400">موضوع الدرس:</div>
                        <p className="text-xs font-extrabold text-slate-900 leading-snug">
                          {rec.lessonTopic}
                        </p>
                        {rec.unitModule && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            {rec.unitModule}
                          </div>
                        )}
                      </div>

                      {/* Notes if any */}
                      {rec.teacherNotes && (
                        <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                          📌 <strong>توصية المعلم:</strong> {rec.teacherNotes}
                        </p>
                      )}
                    </div>

                    {/* Materials Link Button */}
                    {rec.materialsUrl && rec.materialsUrl.trim() !== '' ? (
                      <a
                        href={rec.materialsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>فتح الملازم وروابط الشرح (Google Drive)</span>
                      </a>
                    ) : (
                      <div className="py-2 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                        لا توجد مرفقات خارجية لهذا الدرس
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Lesson Materials Links Direct Grid */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Link className="w-5 h-5 text-[#25A09F]" />
              سجل الملازم وروابط المحتوى الدراسي المرفوعة ({recordsWithMaterials.length})
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              روابط سحابية مباشرة ومحمية للمذاكرة والتحميل
            </div>
          </div>

          {recordsWithMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              لم يتم إرفاق روابط ملازم بعد لهذا الفصل.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordsWithMaterials.map((rec) => {
                const sub = subjectMap.get(rec.subjectId);
                const teacher = teacherMap.get(rec.teacherId);

                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 font-mono">{rec.date}</span>
                        <Badge variant="primary" size="sm">
                          {sub?.nameAr}
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{rec.lessonTopic}</h3>
                      <p className="text-xs text-slate-500">المعلم: {teacher?.name}</p>
                    </div>

                    <a
                      href={rec.materialsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>فتح الرابط والملازم</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Class Schedule View */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-base text-slate-900">
              الجدول الأسبوعي لفصل {selectedClass?.nameAr} (جلسات 60 دقيقة)
            </h2>
            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="px-4 py-1.5 text-xs font-bold text-[#25A09F] bg-[#25A09F]/10 hover:bg-[#25A09F]/20 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الجدول</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3 border-l border-slate-800 text-center w-24">اليوم</th>
                  {timeSlots.map((ts) => (
                    <th key={ts.slotIndex} className="p-3 border-l border-slate-800 text-center">
                      <div className="font-bold">{ts.nameAr}</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        {ts.startTime} - {ts.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50">
                    <td className="p-3 font-extrabold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">
                      {getArabicDayName(day)}
                    </td>
                    {timeSlots.map((ts) => {
                      const slot = classSlots.find(
                        (s) => s.dayOfWeek === day && s.slotIndex === ts.slotIndex
                      );
                      if (!slot) {
                        return (
                          <td key={ts.slotIndex} className="p-2 border-l border-slate-200 text-center text-slate-300">
                            —
                          </td>
                        );
                      }
                      const sub = subjectMap.get(slot.subjectId);
                      const tch = teacherMap.get(slot.teacherId);

                      return (
                        <td key={ts.slotIndex} className="p-2 border-l border-slate-200 align-top">
                          <div className="p-2 rounded-xl bg-teal-50/60 border border-teal-200 leading-tight">
                            <div className="font-extrabold text-slate-900 text-[11px]">{sub?.nameAr}</div>
                            <div className="text-[10px] text-[#1E807F] font-semibold mt-0.5">{tch?.name}</div>
                            <div className="text-[9px] text-slate-400 mt-1">{slot.roomName}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Learning Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              ملخص التعلم الأسبوعي الشامل (Weekly Learning Summary)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              نظرة عامة على جميع المهارات، التجارب المعملية، والموضوعات المشروحة هذا الأسبوع
            </p>
          </div>

          <div className="space-y-4">
            {subjects
              .filter((s) => s.gradeId === selectedClass?.gradeId)
              .map((sub) => {
                const subRecords = classRecords.filter((r) => r.subjectId === sub.id);

                return (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-slate-900">{sub.nameAr}</div>
                      <Badge variant="primary" size="sm">
                        {subRecords.length} حصة موثقة
                      </Badge>
                    </div>

                    {subRecords.length === 0 ? (
                      <div className="text-xs text-slate-400">لا توجد سجلات منشورة لهذه المادة بعد.</div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {subRecords.map((r) => (
                          <div key={r.id} className="text-xs text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#25A09F]" />
                              <strong>{r.lessonTopic}</strong>
                            </span>
                            {r.materialsUrl && (
                              <a
                                href={r.materialsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#25A09F] font-bold hover:underline"
                              >
                                رابط المرفقات
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
