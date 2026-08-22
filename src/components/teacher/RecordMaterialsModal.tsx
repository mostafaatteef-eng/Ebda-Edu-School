import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  ExternalLink,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeachingRecord, TimetableSlot, Subject, SchoolClass } from '../../types';
import { validateMaterialsUrl } from '../../utils/businessRules';

interface RecordMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot?: TimetableSlot | null;
  targetRecord?: TeachingRecord | null;
  onSuccess?: () => void;
}

export const RecordMaterialsModal: React.FC<RecordMaterialsModalProps> = ({
  isOpen,
  onClose,
  targetSlot,
  targetRecord,
  onSuccess,
}) => {
  const {
    activeSchool,
    currentUser,
    teachingRecords,
    subjects,
    classes,
    updateMaterialsUrl,
    recordLesson,
  } = useApp();

  const [url, setUrl] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Find existing record if slot was passed
  const existingRecord =
    targetRecord ||
    (targetSlot
      ? teachingRecords.find(
          (r) =>
            r.timetableSlotId === targetSlot.id ||
            (r.teacherId === currentUser.teacherId &&
              r.subjectId === targetSlot.subjectId &&
              r.classId === targetSlot.classId)
        )
      : null);

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  const subject =
    (existingRecord && subjectMap.get(existingRecord.subjectId)) ||
    (targetSlot && subjectMap.get(targetSlot.subjectId));

  const schoolClass =
    (existingRecord && classMap.get(existingRecord.classId)) ||
    (targetSlot && classMap.get(targetSlot.classId));

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      if (existingRecord) {
        setUrl(existingRecord.materialsUrl || '');
        setLessonTopic(existingRecord.lessonTopic || '');
      } else {
        setUrl('');
        setLessonTopic('');
      }
    }
  }, [isOpen, existingRecord]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUrl = url.trim();

    if (trimmedUrl) {
      const validation = validateMaterialsUrl(trimmedUrl);
      if (!validation.isValid) {
        setError(validation.error || 'الرابط غير صالح');
        return;
      }
    }

    if (existingRecord) {
      const res = updateMaterialsUrl(existingRecord.id, trimmedUrl);
      if (!res.success) {
        setError(res.error || 'حدث خطأ أثناء حفظ الرابط');
        return;
      }
      setSuccessMsg('تم تحديث رابط المواد التعليمية بنجاح وإتاحته للأولياء والطلاب.');
    } else if (targetSlot) {
      // Record a new completed lesson with this material link
      const res = recordLesson({
        schoolId: activeSchool.id,
        timetableSlotId: targetSlot.id,
        date: new Date().toISOString().slice(0, 10),
        dayOfWeek: targetSlot.dayOfWeek,
        slotIndex: targetSlot.slotIndex,
        startTime: targetSlot.startTime,
        endTime: targetSlot.endTime,
        durationMinutes: 60,
        teacherId: currentUser.teacherId || targetSlot.teacherId,
        subjectId: targetSlot.subjectId,
        gradeId: targetSlot.gradeId,
        classId: targetSlot.classId,
        locationType: targetSlot.locationType,
        labId: targetSlot.labId,
        workshopId: targetSlot.workshopId,
        roomName: targetSlot.roomName,
        lessonTopic: lessonTopic.trim() || `درس ${subject?.nameAr || 'المادة'}`,
        lessonStatus: 'completed',
        materialsUrl: trimmedUrl,
        parentVisibility: true,
      });

      if (!res.success) {
        setError(res.error || 'حدث خطأ أثناء توثيق الحصة');
        return;
      }
      setSuccessMsg('تم توثيق الحصة وحفظ رابط المواد التعليمية بنجاح!');
    }

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    if (!existingRecord) return;
    if (confirm('هل أنت متأكد من رغبتك في إزالة رابط المواد التعليمية لهذه الحصة؟')) {
      const res = updateMaterialsUrl(existingRecord.id, '');
      if (res.success) {
        setUrl('');
        setSuccessMsg('تم حذف رابط المواد التعليمية بنجاح.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-right animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#25A09F] text-white flex items-center justify-center shadow-xs">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {existingRecord?.materialsUrl ? 'تعديل أو إزالة رابط المواد التعليمية' : 'إرفاق رابط المواد التعليمية (Lesson Materials)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                مشاركة المذكرات، العروض، وروابط Google Drive مع الطلاب وأولياء الأمور
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson Information Box */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>{subject?.nameAr || 'المادة التعليمية'}</span>
            <span className="text-slate-500">فصل: {schoolClass?.nameAr || schoolClass?.code || '—'}</span>
          </div>
          {targetSlot && (
            <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#25A09F]" />
              <span>{targetSlot.startTime} - {targetSlot.endTime} (60 دقيقة)</span>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {!existingRecord && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                موضوع الدرس أو عنوان المحتوى <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                placeholder="مثال: مقدمة في دوائر التحكم الكهروميكانيكية"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>رابط المواد التعليمية (External URL)</span>
              <span className="text-[10px] text-slate-400 font-mono">HTTPS Approved Only</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... أو https://onedrive.live.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                dir="ltr"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              يدعم روابط Google Drive, OneDrive, Dropbox, LMS, أو أي موقع تعليمي معتمد.
            </p>
          </div>

          {/* URL Live Preview if valid */}
          {url.trim().startsWith('http') && (
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-teal-900 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#25A09F]" />
                معاينة الرابط:
              </span>
              <a
                href={url.trim()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E807F] hover:underline"
              >
                <span>اختبار فتح الرابط</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {existingRecord?.materialsUrl ? (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إزالة الرابط</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الرابط</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
