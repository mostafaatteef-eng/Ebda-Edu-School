import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimeSlot } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const DailyPeriodsManager: React.FC = () => {
  const {
    timeSlots,
    updateTimeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    setDailyPeriodsCount,
    breaks,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<TimeSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlot | null>(null);

  // Form states
  const [slotName, setSlotName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-generator states
  const [targetPeriodsCount, setTargetPeriodsCount] = useState(timeSlots.length || 6);
  const [dayStartHour, setDayStartHour] = useState('08:00');
  const [defaultDuration, setDefaultDuration] = useState(60);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    const nextIndex = timeSlots.length + 1;
    const arabicOrdinalNames = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];
    setSlotName(`الحصة ${arabicOrdinalNames[nextIndex - 1] || nextIndex}`);

    if (timeSlots.length > 0) {
      const last = timeSlots[timeSlots.length - 1];
      setStartTime(last.endTime);
      const [h, m] = last.endTime.split(':').map(Number);
      const totalM = (h + 1) * 60 + m;
      const eh = Math.floor(totalM / 60);
      const em = totalM % 60;
      setEndTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
    } else {
      setStartTime('08:00');
      setEndTime('09:00');
    }
    setDurationMinutes(60);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (slot: TimeSlot) => {
    setSlotToEdit(slot);
    setSlotName(slot.nameAr);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setDurationMinutes(slot.durationMinutes || 60);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotName.trim()) {
      setFormError('يرجى كتابة اسم الحصة');
      return;
    }
    if (startTime >= endTime) {
      setFormError('وقت نهاية الحصة يجب أن يكون بعد وقت البدء');
      return;
    }

    addTimeSlot({
      nameAr: slotName.trim(),
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 60,
    });
    setIsAddModalOpen(false);
    showToast(`تمت إضافة ${slotName} بنجاح إلى جدول الحصص اليومي.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotToEdit) return;
    if (!slotName.trim()) {
      setFormError('يرجى كتابة اسم الحصة');
      return;
    }
    if (startTime >= endTime) {
      setFormError('وقت نهاية الحصة يجب أن يكون بعد وقت البدء');
      return;
    }

    updateTimeSlot(slotToEdit.slotIndex, {
      nameAr: slotName.trim(),
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 60,
    });
    setIsEditModalOpen(false);
    showToast(`تم تحديث توقيت ${slotName} بنجاح.`);
  };

  const handleConfirmDelete = () => {
    if (!slotToDelete) return;
    deleteTimeSlot(slotToDelete.slotIndex);
    const name = slotToDelete.nameAr;
    setSlotToDelete(null);
    showToast(`تم حذف ${name} من هيكل اليوم المدرسي.`);
  };

  const handleApplyPresetCount = (count: number) => {
    setTargetPeriodsCount(count);
    setDailyPeriodsCount(count, dayStartHour, defaultDuration);
    showToast(`تمت إعادة ضبط اليوم الدراسي بنجاح على ${count} حصص يومياً.`);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header & Quick Preset Bar */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 text-[#25A09F] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                إدارة وتعديل عدد الحصص والمواعيد اليومية
              </h2>
              <Badge variant="primary" size="sm">
                {timeSlots.length} حصص يومياً
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              تحديد عدد الحصص في اليوم المدرسي، تسمية كل حصة، وضبط أوقات البداية والنهاية وفق المعيار المعتمد (60 دقيقة لكل حصة).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#25A09F] hover:bg-[#1E807F] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة مخصصة</span>
          </button>
        </div>

        {/* Quick Periods Count Selector */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <Sliders className="w-4 h-4 text-[#25A09F]" />
              <span>الضبط السريع لعدد حصص اليوم المدرسي:</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">اختر لتطبيق التوليد التلقائي الفوري</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[4, 5, 6, 7, 8].map((count) => {
              const isActive = timeSlots.length === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleApplyPresetCount(count)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-white border-[#25A09F] ring-2 ring-[#25A09F]/20 text-[#1E807F] shadow-xs'
                      : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-black">{count} حصص يومياً</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {count === 6 ? 'المعيار المعتمد' : `${count * 60} دقيقة تعليمية`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#25A09F]" />
            <h3 className="text-xs font-black text-slate-900">جدول الحصص والتوقيتات النشطة</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">إجمالي: {timeSlots.length} حصة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 border-l border-slate-800 text-center w-16">#</th>
                <th className="p-3.5 border-l border-slate-800">اسم الحصة</th>
                <th className="p-3.5 border-l border-slate-800 text-center">وقت البدء</th>
                <th className="p-3.5 border-l border-slate-800 text-center">وقت الانتهاء</th>
                <th className="p-3.5 border-l border-slate-800 text-center">المدة</th>
                <th className="p-3.5 text-center w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeSlots.map((slot, index) => {
                // Check if this slot follows a break
                const isAfterBreak = slot.slotIndex === 4 && slot.startTime >= '11:30';

                return (
                  <React.Fragment key={slot.slotIndex}>
                    {isAfterBreak && (
                      <tr className="bg-amber-50/60 text-amber-900 border-y border-amber-200/60 font-bold">
                        <td colSpan={6} className="p-2.5 text-center text-xs">
                          ☕ فترة الاستراحة الصباحية / الفسحة المعتمدة (11:00 ص - 11:30 ص • 30 دقيقة)
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                        {slot.slotIndex}
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#25A09F]" />
                          <span>{slot.nameAr}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800" dir="ltr">
                        {slot.startTime}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800" dir="ltr">
                        {slot.endTime}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant="primary" size="sm">
                          {slot.durationMinutes || 60} دقيقة
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition hover:bg-teal-50 cursor-pointer"
                            title="تعديل الحصة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSlotToDelete(slot)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition hover:bg-rose-50 cursor-pointer"
                            title="حذف الحصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informational Guidance */}
      <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#25A09F] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900 mb-1">
            ملاحظة تنظيمية للجدول الأسبوعي:
          </p>
          <p>
            أي تعديل في عدد الحصص أو مواعيدها ينعكس تلقائيًا على شبكة الجدول الأسبوعي (Timetable)، وبطاقات المعلمين، وسجلات ما تم تدريسه، وبوابة أولياء الأمور، وتقارير الطباعة A4.
          </p>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة حصة دراسية جديدة"
        size="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-right" dir="rtl">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl font-bold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الحصة <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              placeholder="مثال: الحصة السابعة"
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت البدء <span className="text-rose-500">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت الانتهاء <span className="text-rose-500">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مدة الحصة (بالدقائق)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={15}
              max={180}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md cursor-pointer"
            >
              حفظ وإضافة الحصة
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات الحصة الدراسية"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-right" dir="rtl">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl font-bold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الحصة <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت البدء <span className="text-rose-500">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت الانتهاء <span className="text-rose-500">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مدة الحصة (بالدقائق)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={15}
              max={180}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md cursor-pointer"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الحصة"
        message={`هل أنت متأكد من حذف ${slotToDelete?.nameAr} (${slotToDelete?.startTime} - ${slotToDelete?.endTime}) من اليوم المدرسي؟`}
        confirmText="نعم، حذف الحصة"
        confirmVariant="danger"
      />
    </div>
  );
};
