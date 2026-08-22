import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  BookOpen,
  PlusCircle,
  Link,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { getArabicDayName } from '../../utils/conflicts';
import { Subject, SchoolClass, Teacher, TimetableSlot, TeachingRecord } from '../../types';
import { RecordMaterialsModal } from './RecordMaterialsModal';

interface TeacherDashboardProps {
  onSelectTab: (tabId: string) => void;
  onOpenRecordModal?: (prefillSlotId?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onSelectTab,
  onOpenRecordModal,
}) => {
  const {
    currentUser,
    activeSchool,
    teachers,
    subjects,
    classes,
    timetableSlots,
    teachingRecords,
    timeSlots,
    getTeacherWorkload,
  } = useApp();

  const [materialsModalSlot, setMaterialsModalSlot] = useState<TimetableSlot | null>(null);
  const [materialsModalRecord, setMaterialsModalRecord] = useState<TeachingRecord | null>(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);

  // Current teacher object
  const currentTeacher: Teacher =
    teachers.find((t) => t.id === currentUser.teacherId) ||
    teachers[0] || {
      id: currentUser.teacherId || 't-default',
      name: currentUser.name || 'عضو هيئة التدريس',
      code: 'TCH-000',
      specialization: 'العلوم التكنولوجية التطبيقية',
      department: 'التعليم التكنولوجي',
      targetWeeklyLessons: 25,
      schoolId: activeSchool.id,
      isActive: true,
      subjectsTaught: [],
    };

  const workload = getTeacherWorkload(currentTeacher.id);

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  // Today's Day of Week (e.g. Sunday)
  const todayDayName = 'Sunday';
  const todaySlots = timetableSlots
    .filter((s) => s.teacherId === currentTeacher.id && s.dayOfWeek === todayDayName)
    .sort((a, b) => a.slotIndex - b.slotIndex);

  // My recorded lessons
  const myRecords = teachingRecords.filter((r) => r.teacherId === currentTeacher.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Teacher Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E807F] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              بوابة المعلم • نظام المتابعة السريع
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              أهلاً بك، {currentTeacher.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
              تخصص: <strong>{currentTeacher.specialization}</strong> • يمكنك توثيق ما تم تدريسه في حصص اليوم (60 دقيقة) ورفع روابط المحتوى في أقل من 30 ثانية.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('teacher_record')}
              className="w-full sm:w-auto px-6 py-3 bg-[#25A09F] hover:bg-[#1E807F] text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>تسجيل ما تم تدريسه الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Workload Mini-KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          id="stat-teacher-target"
          title="النصاب المستهدف"
          value={`${workload.targetWeeklyHours} ساعة`}
          subtitle="ساعات أسبوعية معتمدة (60 دقيقة)"
          icon={<Clock className="w-5 h-5" />}
          accentColor="#25A09F"
        />

        <StatCard
          id="stat-teacher-actual"
          title="المجدول بالجدول"
          value={`${workload.actualScheduledHours} ساعة`}
          subtitle="إجمالي حصصك المعتمدة"
          icon={<CalendarDays className="w-5 h-5" />}
          accentColor="#3B82F6"
          badge={{
            text: workload.workloadStatus === 'balanced' ? 'نصاب مثالي' : 'مكتمل',
            variant: 'success',
          }}
        />

        <StatCard
          id="stat-teacher-recorded"
          title="الحصص الموثقة"
          value={`${workload.completedLessonsCount} حصة`}
          subtitle={`معدل التوثيق: ${workload.documentationRate}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="#10B981"
        />

        <StatCard
          id="stat-teacher-materials"
          title="تغطية روابط المواد"
          value={`${workload.materialsCoverageRate}%`}
          subtitle="Google Drive / LMS"
          icon={<Link className="w-5 h-5" />}
          accentColor="#8B5CF6"
        />
      </div>

      {/* Today's Schedule Live Action (Mobile First) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#25A09F]" />
              حصص اليوم ({getArabicDayName(todayDayName)})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              الحصص المخصصة لك اليوم بنظام الـ 60 دقيقة لكل جلسة
            </p>
          </div>
          <Badge variant="primary" size="sm">
            {todaySlots.length} حصص اليوم
          </Badge>
        </div>

        {todaySlots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            لا توجد حصص مجدولة لك اليوم، استمتع بيومك!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySlots.map((slot) => {
              const sub = subjectMap.get(slot.subjectId);
              const cl = classMap.get(slot.classId);

              // Check if already recorded today
              const isRecorded = myRecords.some(
                (r) => r.subjectId === slot.subjectId && r.classId === slot.classId
              );

              return (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#25A09F]/50 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#25A09F] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Badge variant={isRecorded ? 'success' : 'warning'} size="sm">
                        {isRecorded ? 'تم التوثيق' : 'بانتظار التسجيل'}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {sub?.nameAr || 'المادة'}
                      </h3>
                      <div className="text-xs text-slate-600 font-bold mt-1">
                        فصل: {cl?.nameAr} ({cl?.code})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        المكان: {slot.roomName || 'القاعة المخصصة'} (60 دقيقة)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenRecordModal) onOpenRecordModal(slot.id);
                        else onSelectTab('teacher_record');
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isRecorded
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-[#25A09F] hover:bg-[#1E807F] text-white shadow-xs'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isRecorded ? 'تعديل توثيق الحصة' : 'توثيق ما تم تدريسه الآن'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const rec = myRecords.find(
                          (r) => r.subjectId === slot.subjectId && r.classId === slot.classId
                        );
                        setMaterialsModalSlot(slot);
                        setMaterialsModalRecord(rec || null);
                        setIsMaterialsModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-bold border border-[#25A09F]/30 bg-teal-50/50 hover:bg-teal-50 text-[#1E807F] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>إرفاق / تعديل رابط المواد</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Recorded Lessons */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">
            سجل الحصص التي قمت بتوثيقها حديثًا
          </h2>
          <button
            type="button"
            onClick={() => onSelectTab('teacher_materials')}
            className="text-xs font-bold text-[#25A09F] hover:underline"
          >
            عرض الكل والمرفقات ←
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {myRecords.slice(0, 4).map((rec) => {
            const sub = subjectMap.get(rec.subjectId);
            const cl = classMap.get(rec.classId);

            return (
              <div key={rec.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{sub?.nameAr}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">فصل {cl?.code}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] text-slate-400">{rec.date}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">
                    موضوع الدرس: <strong>{rec.lessonTopic}</strong>
                  </p>
                  <div className="flex items-center gap-3 pt-0.5">
                    {rec.materialsUrl ? (
                      <a
                        href={rec.materialsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25A09F] hover:underline"
                      >
                        <Link className="w-3 h-3" />
                        <span>رابط المحتوى المرفوع</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold">
                        لم يتم إرفاق رابط بعد
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMaterialsModalSlot(null);
                        setMaterialsModalRecord(rec);
                        setIsMaterialsModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-[#25A09F] hover:underline cursor-pointer"
                    >
                      {rec.materialsUrl ? 'تعديل الرابط' : 'إرفاق رابط مواد'}
                    </button>
                  </div>
                </div>

                <Badge
                  variant={
                    rec.lessonStatus === 'completed'
                      ? 'success'
                      : rec.lessonStatus === 'partially_completed'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {rec.lessonStatus === 'completed' ? 'تم التنفيذ' : 'جزئي'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record / Edit Lesson Materials Modal */}
      <RecordMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => {
          setIsMaterialsModalOpen(false);
          setMaterialsModalSlot(null);
          setMaterialsModalRecord(null);
        }}
        targetSlot={materialsModalSlot}
        targetRecord={materialsModalRecord}
      />
    </div>
  );
};
