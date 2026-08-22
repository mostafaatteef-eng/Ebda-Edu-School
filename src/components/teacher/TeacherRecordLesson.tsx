import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Sparkles,
  Link,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { LessonStatus, Subject, SchoolClass, Teacher } from '../../types';
import { Badge } from '../common/Badge';
import { getArabicDayName } from '../../utils/conflicts';

interface TeacherRecordLessonProps {
  prefillSlotId?: string;
  onSuccess?: () => void;
}

export const TeacherRecordLesson: React.FC<TeacherRecordLessonProps> = ({
  prefillSlotId,
  onSuccess,
}) => {
  const {
    currentUser,
    activeSchool,
    teachers,
    subjects,
    classes,
    timetableSlots,
    recordLesson,
  } = useApp();

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

  // Teacher slots
  const mySlots = timetableSlots.filter((s) => s.teacherId === currentTeacher.id);

  // Selected slot or custom
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    prefillSlotId || mySlots[0]?.id || ''
  );
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [lessonTopic, setLessonTopic] = useState('');
  const [unitModule, setUnitModule] = useState('');
  const [lessonStatus, setLessonStatus] = useState<LessonStatus>('completed');
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [materialsUrl, setMaterialsUrl] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [parentVisibility, setParentVisibility] = useState(true);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeSlot = mySlots.find((s) => s.id === selectedSlotId);
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetSlot = activeSlot || mySlots[0];
    if (!targetSlot) return;

    recordLesson({
      schoolId: activeSchool.id,
      timetableSlotId: targetSlot.id,
      date,
      dayOfWeek: targetSlot.dayOfWeek,
      slotIndex: targetSlot.slotIndex,
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      durationMinutes: 60,
      teacherId: currentTeacher.id,
      subjectId: targetSlot.subjectId,
      gradeId: targetSlot.gradeId,
      classId: targetSlot.classId,
      locationType: targetSlot.locationType,
      labId: targetSlot.labId,
      workshopId: targetSlot.workshopId,
      roomName: targetSlot.roomName,
      lessonTopic,
      unitModule,
      lessonStatus,
      notCompletedReason: lessonStatus !== 'completed' ? notCompletedReason : '',
      materialsUrl,
      teacherNotes,
      parentVisibility,
    });

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#25A09F', '#F35024', '#10B981'],
      });
    } catch (err) {
      // Ignored if canvas not supported
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setLessonTopic('');
      setUnitModule('');
      setMaterialsUrl('');
      setTeacherNotes('');
      if (onSuccess) onSuccess();
    }, 2200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs text-right space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#25A09F]" />
            توثيق ما تم تدريسه (30-Second Quick Form)
          </h1>
          <Badge variant="primary" size="sm">
            جلسة 60 دقيقة
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          نموذج سريع ومبسط لتوثيق تفاصيل الحصة، المحتوى المنجز، وروابط Google Drive للأهالي والطلاب
        </p>
      </div>

      {/* Success Notification Banner */}
      {isSubmitted && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-right animate-in fade-in zoom-in-95 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <div className="font-extrabold text-sm text-emerald-900">
              تم توثيق الحصة وتحديث سجل المدرسة بنجاح! 🎉
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              تم احتساب الساعة التدريسية (60 دقيقة) في نصابك الأسبوعي وإتاحة الرابط لمنصة المتابعة.
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-right">
        {/* Step 1: Select Slot */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-2">
            1. اختر الحصة المراد توثيقها
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mySlots.map((slot) => {
              const sub = subjectMap.get(slot.subjectId);
              const cl = classMap.get(slot.classId);
              const isSelected = selectedSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#25A09F]/10 border-[#25A09F] ring-2 ring-[#25A09F]/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{sub?.nameAr}</span>
                    <span className="font-mono text-[11px] font-semibold text-[#1E807F]">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>فصل: {cl?.code}</span>
                    <span>{getArabicDayName(slot.dayOfWeek)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Date & Topic */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-extrabold text-slate-900">
            2. تفاصيل ما تم تدريسه
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الحصة</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الوحدة / الموديول التدريبي
              </label>
              <input
                type="text"
                value={unitModule}
                onChange={(e) => setUnitModule(e.target.value)}
                placeholder="مثال: الوحدة الثانية - التحكم المنطقي PLC"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              موضوع الدرس / ما تم إنجازه في الحصة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              placeholder="مثال: التدريب العملي على برمجة حساسات التقارب الكهروضوئية"
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              required
            />
          </div>
        </div>

        {/* Step 3: Execution Status */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-extrabold text-slate-900">
            3. حالة تنفيذ الحصة (60 دقيقة)
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'completed', label: 'تم التنفيذ بالكامل', color: 'emerald' },
              { id: 'partially_completed', label: 'تنفيذ جزئي', color: 'amber' },
              { id: 'not_completed', label: 'لم تنفذ', color: 'rose' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setLessonStatus(st.id as any)}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold transition-all text-center ${
                  lessonStatus === st.id
                    ? st.id === 'completed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st.id === 'partially_completed'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {lessonStatus !== 'completed' && (
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                سبب عدم اكتمال الحصة بالكامل
              </label>
              <input
                type="text"
                value={notCompletedReason}
                onChange={(e) => setNotCompletedReason(e.target.value)}
                placeholder="أدخل سبب عدم اكتمال الحصة أو المعوقات..."
                className="w-full text-xs font-bold bg-rose-50 border border-rose-300 rounded-xl px-3 py-2 text-rose-900"
                required
              />
            </div>
          )}
        </div>

        {/* Step 4: Materials URL */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-extrabold text-slate-900 flex items-center justify-between">
            <span>4. رابط المواد التعليمية والمرفقات (Google Drive / LMS)</span>
            <span className="text-[10px] text-[#25A09F] font-normal">اختياري ومستحسن</span>
          </label>

          <div className="relative">
            <Link className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="url"
              value={materialsUrl}
              onChange={(e) => setMaterialsUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full text-xs font-mono text-left bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات إضافية / توصيات للطلاب
            </label>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="مثال: يرجى من الطلاب مراجعة المخطط قبل جلسة المعمل القادمة..."
              rows={2}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>حفظ وتوثيق الحصة الآن</span>
          </button>
        </div>
      </form>
    </div>
  );
};
