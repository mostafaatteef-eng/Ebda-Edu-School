import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  Sparkles,
  Layers,
  Save,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SchoolBreak, BreakType } from '../../types';
import { Badge } from '../common/Badge';
import { calculateBreakDuration } from '../../utils/businessRules';

const DAYS_OF_WEEK = [
  { id: 'Sunday', labelAr: 'الأحد' },
  { id: 'Monday', labelAr: 'الإثنين' },
  { id: 'Tuesday', labelAr: 'الثلاثاء' },
  { id: 'Wednesday', labelAr: 'الأربعاء' },
  { id: 'Thursday', labelAr: 'الخميس' },
];

const BREAK_TYPES: Record<BreakType, { id: BreakType; labelAr: string; icon: string }> = {
  break: { id: 'break', labelAr: 'فسحة صباحية / استراحة (Break)', icon: '☕' },
  lunch: { id: 'lunch', labelAr: 'استراحة غداء (Lunch)', icon: '🍱' },
  activity: { id: 'activity', labelAr: 'نشاط مدرسي (Activity)', icon: '🏃' },
  assembly: { id: 'assembly', labelAr: 'طابور / تجمع مدرسي (Assembly)', icon: '📢' },
  non_teaching: { id: 'non_teaching', labelAr: 'فترة غير تدريسية (Non-teaching)', icon: '⏱️' },
};

export const SchoolBreaksManager: React.FC = () => {
  const { breaks, addBreak, updateBreak, deleteBreak, toggleBreakStatus, activeSchool } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreakId, setEditingBreakId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<BreakType>('break');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [applicableDays, setApplicableDays] = useState<string[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const duration = calculateBreakDuration(startTime, endTime);

  const openAddModal = () => {
    setEditingBreakId(null);
    setName('');
    setType('break');
    setStartTime('10:00');
    setEndTime('10:30');
    setApplicableDays(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (brk: SchoolBreak) => {
    setEditingBreakId(brk.id);
    setName(brk.name);
    setType(brk.type);
    setStartTime(brk.startTime);
    setEndTime(brk.endTime);
    setApplicableDays(brk.daysOfWeek || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
    setNotes(brk.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleDaySelection = (dayId: string) => {
    if (applicableDays.includes(dayId)) {
      if (applicableDays.length === 1) {
        setFormError('يجب تحديد يوم واحد على الأقل للاستراحة');
        return;
      }
      setApplicableDays(applicableDays.filter((d) => d !== dayId));
    } else {
      setApplicableDays([...applicableDays, dayId]);
    }
  };

  const handleSelectAllDays = () => {
    setApplicableDays(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الاستراحة أو الفسحة');
      return;
    }

    if (duration <= 0) {
      setFormError('وقت نهاية الاستراحة يجب أن يكون بعد وقت بدايتها');
      return;
    }

    if (applicableDays.length === 0) {
      setFormError('يرجى تحديد أيام تطبيق هذه الاستراحة');
      return;
    }

    if (editingBreakId) {
      const res = updateBreak(editingBreakId, {
        name: name.trim(),
        type,
        startTime,
        endTime,
        durationMinutes: duration,
        applicableDays,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء تعديل الاستراحة');
        return;
      }

      setFeedback({ type: 'success', message: `تم تحديث بيانات الاستراحة "${name}" بنجاح` });
    } else {
      const res = addBreak({
        name: name.trim(),
        type,
        startTime,
        endTime,
        durationMinutes: duration,
        applicableDays,
        status: 'active',
        schoolId: activeSchool.id,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء إضافة الاستراحة');
        return;
      }

      setFeedback({ type: 'success', message: `تمت إضافة الاستراحة المعتمدة "${name}" بنجاح إلى جدول المدرسة` });
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (brk: SchoolBreak) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف استراحة "${brk.name}"؟`)) {
      const res = deleteBreak(brk.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `تم حذف استراحة "${brk.name}" من النظام` });
        setTimeout(() => setFeedback(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 text-right" id="school-breaks-section">
      {/* Section Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                إدارة فترات الاستراحة والفسحة المدرسية (School Break Configuration)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد مواعيد الفسحة والاستراحات الرسمية بمرونة كاملة لمنع تعارض الحصص وضمان دقة احتساب النصاب
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
            id="add-break-btn"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فترة استراحة جديدة</span>
          </button>
        </div>

        {/* Informational Guidance */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-1.5">
          <div className="font-extrabold flex items-center gap-2 text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            قواعد الاستراحات والفسحة في النظام الأكاديمي:
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px] pr-2">
            <li><strong>ديناميكية وغير ثابتة:</strong> يمكنك تحديد مواعيد دقيقة، فترات مختلفة، وأيام سريان لكل استراحة.</li>
            <li><strong>حماية الجداول:</strong> يمنع محرك كشف التعارضات جدولة أي حصص دراسية تتداخل مع فترات الاستراحة النشطة.</li>
            <li><strong>عدم احتساب النصاب:</strong> الاستراحات لا تُحسب ضمن النصاب التدريسي الإلزامي (25 حصة/ساعة أسبوعياً للمعلم).</li>
            <li><strong>الظهور الشامل:</strong> تظهر الاستراحات بلون مميز في جداول الفصول، المعلمين، ولوحة متابعة أولياء الأمور.</li>
          </ul>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        {/* Breaks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {breaks.map((brk) => {
            const isActive = brk.status === 'active';
            return (
              <div
                key={brk.id}
                id={`break-card-${brk.id}`}
                className={`p-5 rounded-2xl border transition-all relative ${
                  isActive
                    ? 'bg-slate-50/60 border-slate-200/90 hover:border-amber-400 hover:shadow-xs'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0" role="img" aria-label="break-icon">
                      {brk.type === 'morning_break'
                        ? '☕'
                        : brk.type === 'lunch_break'
                        ? '🍱'
                        : brk.type === 'prayer_break'
                        ? '🕌'
                        : brk.type === 'assembly'
                        ? '📢'
                        : '⏱️'}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        {brk.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        كود: {brk.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleBreakStatus(brk.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                      title={isActive ? 'تعطيل الاستراحة' : 'تفعيل الاستراحة'}
                    >
                      {isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(brk)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100/60 rounded-lg transition"
                      title="تعديل الاستراحة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brk)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-lg transition"
                      title="حذف الاستراحة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timing and Duration */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-200/70 text-xs mb-3 font-bold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>التوقيت:</span>
                    <span className="font-mono text-slate-900 dir-ltr">{brk.startTime} - {brk.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 justify-end">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>المدة:</span>
                    <span className="font-extrabold text-amber-700">{brk.durationMinutes} دقيقة</span>
                  </div>
                </div>

                {/* Applicable Days */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>أيام التطبيق:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = brk.applicableDays?.includes(day.id);
                      return (
                        <span
                          key={day.id}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            isSelected
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {day.labelAr}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {brk.notes && (
                  <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 italic">
                    ملاحظات: {brk.notes}
                  </p>
                )}
              </div>
            );
          })}

          {breaks.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
              <Coffee className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-xs">لا توجد استراحات مضافة حتى الآن</p>
              <p className="text-[11px] text-slate-400 mt-1">
                انقر على "إضافة فترة استراحة جديدة" لضبط فترات الفسحة والاستراحة المدرسية
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {editingBreakId ? 'تعديل فترة الاستراحة' : 'إضافة فترة استراحة جديدة'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تكوين مواعيد الفسحة وأيام سريانها في مدرسة {activeSchool.nameAr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم الاستراحة / الفسحة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  placeholder="مثال: الفسحة الصباحية الرئيسية، استراحة الغداء، صلاة الظهر"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع الاستراحة
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as BreakType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                >
                  {Object.values(BREAK_TYPES).map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.icon} {bt.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    وقت البداية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition text-left"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    وقت النهاية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition text-left"
                    required
                  />
                </div>
              </div>

              {/* Calculated Duration Display */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  المدة المحسوبة تلقائياً:
                </span>
                <span className="font-extrabold text-sm text-amber-800 font-mono">
                  {duration > 0 ? `${duration} دقيقة` : 'توقيت غير صالح'}
                </span>
              </div>

              {/* Days Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    أيام سريان الاستراحة <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllDays}
                    className="text-[11px] text-amber-700 hover:underline font-bold"
                  >
                    تحديد جميع أيام الدراسة
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = applicableDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDaySelection(day.id)}
                        className={`py-2 px-1 text-xs rounded-xl font-bold border transition text-center ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day.labelAr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات أو توجيهات تشغيلية (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition resize-none"
                  placeholder="ملاحظات حول الإشراف أثناء الفسحة أو تنظيم الكافتيريا..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBreakId ? 'حفظ التعديلات' : 'إضافة الاستراحة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
