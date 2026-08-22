import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Users,
  GraduationCap,
  FlaskConical,
  Wrench,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, DayOfWeek, TimetableConflict, Teacher, Subject, SchoolClass, Grade, Lab, Workshop } from '../../types';
import { getArabicDayName } from '../../utils/conflicts';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Badge } from '../common/Badge';
import { exportTimetableToExcel } from '../../utils/excelHelper';

interface TimetableManagerProps {
  onOpenPrintModal: () => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({ onOpenPrintModal }) => {
  const {
    activeSchool,
    currentAcademicYear,
    timetableSlots,
    timeSlots,
    breaks,
    teachers,
    subjects,
    grades,
    classes,
    labs,
    workshops,
    conflicts,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
  } = useApp();

  const [activeView, setActiveView] = useState<'school' | 'grade' | 'class' | 'teacher' | 'lab' | 'workshop'>('class');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedLabId, setSelectedLabId] = useState<string>(labs[0]?.id || '');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(workshops[0]?.id || '');

  // Week offset state (0 = current week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Slot modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form fields
  const [formDay, setFormDay] = useState<DayOfWeek>('Sunday');
  const [formSlotIndex, setFormSlotIndex] = useState<number>(1);
  const [formGradeId, setFormGradeId] = useState<string>(grades[0]?.id || '');
  const [formClassId, setFormClassId] = useState<string>(classes[0]?.id || '');
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState<string>(teachers[0]?.id || '');
  const [formLocationType, setFormLocationType] = useState<'classroom' | 'lab' | 'workshop'>('classroom');
  const [formLabId, setFormLabId] = useState<string>(labs[0]?.id || '');
  const [formWorkshopId, setFormWorkshopId] = useState<string>(workshops[0]?.id || '');
  const [formRoomName, setFormRoomName] = useState<string>('قاعة 101');

  // Conflict warning feedback inside modal
  const [liveConflictWarning, setLiveConflictWarning] = useState<string | null>(null);

  // Delete modal state
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));
  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));
  const labMap = new Map<string, Lab>(labs.map((l) => [l.id, l]));
  const wsMap = new Map<string, Workshop>(workshops.map((w) => [w.id, w]));

  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  // Filter slots based on active view and selection
  const filteredSlots = timetableSlots.filter((slot) => {
    if (activeView === 'school') return true;
    if (activeView === 'grade') return slot.gradeId === selectedGradeId;
    if (activeView === 'class') return slot.classId === selectedClassId;
    if (activeView === 'teacher') return slot.teacherId === selectedTeacherId;
    if (activeView === 'lab') return slot.locationType === 'lab' && slot.labId === selectedLabId;
    if (activeView === 'workshop') return slot.locationType === 'workshop' && slot.workshopId === selectedWorkshopId;
    return true;
  });

  const openAddSlotModal = (prefillDay?: DayOfWeek, prefillSlotIndex?: number) => {
    setEditingSlot(null);
    setFormDay(prefillDay || 'Sunday');
    setFormSlotIndex(prefillSlotIndex || 1);
    setFormGradeId(selectedGradeId || grades[0]?.id || '');
    setFormClassId(selectedClassId || classes[0]?.id || '');
    setFormSubjectId(subjects[0]?.id || '');
    setFormTeacherId(teachers[0]?.id || '');
    setFormLocationType('classroom');
    setFormLabId(labs[0]?.id || '');
    setFormWorkshopId(workshops[0]?.id || '');
    setFormRoomName('قاعة 101');
    setLiveConflictWarning(null);
    setIsSlotModalOpen(true);
  };

  const openEditSlotModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.dayOfWeek);
    setFormSlotIndex(slot.slotIndex);
    setFormGradeId(slot.gradeId);
    setFormClassId(slot.classId);
    setFormSubjectId(slot.subjectId);
    setFormTeacherId(slot.teacherId);
    setFormLocationType(slot.locationType);
    setFormLabId(slot.labId || labs[0]?.id || '');
    setFormWorkshopId(slot.workshopId || workshops[0]?.id || '');
    setFormRoomName(slot.roomName || 'قاعة 101');
    setLiveConflictWarning(null);
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const timeSlotObj = timeSlots.find((ts) => ts.slotIndex === formSlotIndex) || timeSlots[0];

    const slotPayload = {
      schoolId: activeSchool.id,
      academicYearId: currentAcademicYear.id,
      dayOfWeek: formDay,
      slotIndex: formSlotIndex,
      startTime: timeSlotObj.startTime,
      endTime: timeSlotObj.endTime,
      durationMinutes: 60,
      gradeId: formGradeId,
      classId: formClassId,
      subjectId: formSubjectId,
      teacherId: formTeacherId,
      locationType: formLocationType,
      labId: formLocationType === 'lab' ? formLabId : undefined,
      workshopId: formLocationType === 'workshop' ? formWorkshopId : undefined,
      roomName:
        formLocationType === 'lab'
          ? labMap.get(formLabId)?.nameAr || 'المعمل'
          : formLocationType === 'workshop'
          ? wsMap.get(formWorkshopId)?.nameAr || 'الورشة'
          : formRoomName,
    };

    if (editingSlot) {
      const res = updateTimetableSlot(editingSlot.id, slotPayload);
      if (res.conflict) {
        setLiveConflictWarning(`⚠️ تنبيه تعارض: ${res.conflict.description}`);
      } else {
        setIsSlotModalOpen(false);
      }
    } else {
      const res = addTimetableSlot(slotPayload);
      if (res.conflict) {
        setLiveConflictWarning(`⚠️ تنبيه تعارض: ${res.conflict.description}`);
      } else {
        setIsSlotModalOpen(false);
      }
    }
  };

  const handleExcelExport = () => {
    exportTimetableToExcel(filteredSlots, teachers, subjects, classes, activeSchool);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              الجدول الدراسي الأسبوعي (Weekly Timetable Studio)
            </h1>
            <Badge variant="primary" size="sm">
              حصص 60 دقيقة
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة، بناء، وتخصيص جداول الحصص الدراسية والمعامل مع كاشف التعارضات التلقائي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExcelExport}
            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel
          </button>
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#25A09F]" />
            طباعة معتمدة (A4)
          </button>
          <button
            type="button"
            onClick={() => openAddSlotModal()}
            className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة حصة للجدول
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if any conflicts exist */}
      {conflicts.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
          <div className="flex items-center gap-3 text-rose-800 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            <span>تم اكتشاف {conflicts.length} تعارض في الجدول الأسبوعي (Conflict Detected)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-white border border-rose-200 rounded-2xl text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between text-rose-700 font-bold">
                  <span>نوع التعارض: {c.type === 'teacher' ? 'معلم' : c.type === 'class' ? 'فصل' : c.type === 'lab' ? 'معمل' : 'ورشة'}</span>
                  <span className="font-mono">{c.timeRange}</span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{c.description}</p>
                <div className="p-2 bg-rose-50/50 rounded-lg text-[11px] text-rose-800">
                  💡 <strong>الحل المقترح:</strong> {c.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Switcher Tabs & Filters Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Main Perspective Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'class', label: 'جدول الفصل (Class View)', icon: <Layers className="w-4 h-4" /> },
              { id: 'grade', label: 'جدول الصف (Grade View)', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'teacher', label: 'جدول المعلم (Teacher View)', icon: <Users className="w-4 h-4" /> },
              { id: 'lab', label: 'جدول المعمل (Lab View)', icon: <FlaskConical className="w-4 h-4" /> },
              { id: 'workshop', label: 'جدول الورشة (Workshop View)', icon: <Wrench className="w-4 h-4" /> },
              { id: 'school', label: 'جدول المدرسة العام (School View)', icon: <CalendarDays className="w-4 h-4" /> },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeView === v.id
                    ? 'bg-[#25A09F] text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1 hover:bg-white rounded-lg transition-colors"
              title="الأسبوع السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-2">
              {weekOffset === 0 ? 'الأسبوع الحالي (Current Week)' : weekOffset > 0 ? `الأسبوع +${weekOffset}` : `الأسبوع ${weekOffset}`}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1 hover:bg-white rounded-lg transition-colors"
              title="الأسبوع القادم"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-selector based on active view */}
        <div className="flex flex-wrap items-center gap-3">
          {activeView === 'class' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">اختر الفصل:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr} ({c.code}) - {c.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeView === 'grade' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">اختر الصف:</label>
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeView === 'teacher' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">اختر المعلم:</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.specialization} ({t.targetWeeklyLessons} ساعة مستهدفة)
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeView === 'lab' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">اختر المعمل:</label>
              <select
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5"
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nameAr} ({l.code}) - سعة {l.capacity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeView === 'workshop' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">اختر الورشة:</label>
              <select
                value={selectedWorkshopId}
                onChange={(e) => setSelectedWorkshopId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5"
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nameAr} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-xs text-slate-400 font-medium mr-auto">
            يظهر حالياً <strong>{filteredSlots.length} حصة مجدولة</strong>
          </div>
        </div>
      </div>

      {/* School Breaks Informational Strip */}
      {breaks.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-bold">
            <span className="text-lg">☕</span>
            <span>فترات الاستراحة والفسحة المعتمدة ({breaks.filter((b) => b.status === 'active').length} فترات نشطة):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {breaks
              .filter((b) => b.status === 'active')
              .map((b) => (
                <div
                  key={b.id}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-extrabold text-amber-900 flex items-center gap-2 shadow-2xs"
                >
                  <span>{b.name}</span>
                  <span className="font-mono text-[11px] text-amber-700 dir-ltr">{b.startTime} - {b.endTime}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 rounded-md text-amber-800 font-bold">
                    {b.durationMinutes} دقيقة
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Timetable Weekly Matrix Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold">
                <th className="p-3.5 text-center border-l border-slate-800 w-28">اليوم</th>
                {timeSlots.map((ts) => (
                  <th key={ts.slotIndex} className="p-3.5 text-center border-l border-slate-800 min-w-[170px]">
                    <div className="font-extrabold text-sm">{ts.nameAr}</div>
                    <div className="text-[11px] text-slate-300 font-sans font-medium mt-0.5">
                      {ts.startTime} - {ts.endTime} (60 دقيقة)
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => {
                return (
                  <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    {/* Day Column */}
                    <td className="p-4 bg-slate-50/80 text-center font-extrabold text-slate-900 border-l border-slate-200 text-sm">
                      <div>{getArabicDayName(day)}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{day}</div>
                    </td>

                    {/* Periods 1..6 */}
                    {timeSlots.map((ts) => {
                      const cellSlots = filteredSlots.filter(
                        (s) => s.dayOfWeek === day && s.slotIndex === ts.slotIndex
                      );

                      return (
                        <td
                          key={ts.slotIndex}
                          className="p-2.5 border-l border-slate-200 align-top h-32 relative group"
                        >
                          <div className="h-full flex flex-col justify-between">
                            {cellSlots.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => openAddSlotModal(day, ts.slotIndex)}
                                className="w-full h-full min-h-[90px] border border-dashed border-slate-200 hover:border-[#25A09F] rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:text-[#25A09F] hover:bg-[#25A09F]/5 transition-all text-xs font-semibold gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                <span>إضافة حصة</span>
                              </button>
                            ) : (
                              <div className="space-y-2">
                                {cellSlots.map((slot) => {
                                  const sub = subjectMap.get(slot.subjectId);
                                  const tch = teacherMap.get(slot.teacherId);
                                  const cl = classMap.get(slot.classId);

                                  const hasConflict = conflicts.some(
                                    (c) => c.slot1.id === slot.id || c.slot2.id === slot.id
                                  );

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`p-3 rounded-2xl border text-right transition-all shadow-2xs hover:shadow-md ${
                                        hasConflict
                                          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                                          : slot.locationType === 'lab'
                                          ? 'bg-[#25A09F]/10 border-[#25A09F]/40'
                                          : slot.locationType === 'workshop'
                                          ? 'bg-amber-50 border-amber-300'
                                          : 'bg-slate-50 border-slate-200'
                                      }`}
                                    >
                                      {/* Subject & Actions */}
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <span className="font-extrabold text-xs text-slate-900 leading-tight">
                                          {sub?.nameAr || 'مادة'}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                          <button
                                            type="button"
                                            onClick={() => openEditSlotModal(slot)}
                                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                                            title="تعديل الحصة"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setSlotToDelete(slot)}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                                            title="حذف الحصة"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Teacher Name */}
                                      <div className="text-[11px] font-bold text-[#1E807F]">
                                        {tch?.name || 'غير محدد'}
                                      </div>

                                      {/* Class & Location */}
                                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="font-bold text-slate-700">فصل: {cl?.code || ''}</span>
                                        <span className="font-medium px-1.5 py-0.5 bg-white rounded border border-slate-200">
                                          {slot.roomName || 'القاعة'}
                                        </span>
                                      </div>

                                      {hasConflict && (
                                        <div className="mt-1 text-[10px] font-bold text-rose-700 flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          تعارض نشط
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slot Modal with Real-time Conflict Detection */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlot ? 'تعديل الحصة الدراسية في الجدول' : 'إضافة حصة جديدة في الجدول (60 دقيقة)'}
        subtitle="جميع الحصص مسجلة بجلسة 60 دقيقة وتُفحص تلقائيًا لمنع أي تعارض"
        maxWidth="2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSlotModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveSlot}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20"
            >
              {editingSlot ? 'حفظ التعديلات' : 'تثبيت الحصة بالجدول'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveSlot} className="space-y-4 text-right">
          {liveConflictWarning && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 leading-relaxed font-bold">
              {liveConflictWarning}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اليوم</label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {getArabicDayName(d)} ({d})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحصة والتوقيت (60 دقيقة)</label>
              <select
                value={formSlotIndex}
                onChange={(e) => setFormSlotIndex(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {timeSlots.map((ts) => (
                  <option key={ts.slotIndex} value={ts.slotIndex}>
                    {ts.nameAr} ({ts.startTime} - {ts.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
              <select
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المسؤول</label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization}) - نصاب: {t.targetWeeklyLessons}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
              <select
                value={formGradeId}
                onChange={(e) => setFormGradeId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفصل</label>
              <select
                value={formClassId}
                onChange={(e) => setFormClassId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع المكان / التدريب</label>
              <select
                value={formLocationType}
                onChange={(e) => setFormLocationType(e.target.value as any)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="classroom">فصل دراسي نظري (Classroom)</option>
                <option value="lab">معمل تطبيقي ذكي (Smart Lab)</option>
                <option value="workshop">ورشة تدريبية صناعية (Industrial Workshop)</option>
              </select>
            </div>

            {formLocationType === 'lab' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر المعمل</label>
                <select
                  value={formLabId}
                  onChange={(e) => setFormLabId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nameAr} ({l.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : formLocationType === 'workshop' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الورشة</label>
                <select
                  value={formWorkshopId}
                  onChange={(e) => setFormWorkshopId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم / رقم القاعة</label>
                <input
                  type="text"
                  value={formRoomName}
                  onChange={(e) => setFormRoomName(e.target.value)}
                  placeholder="مثال: قاعة 101"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        onConfirm={() => {
          if (slotToDelete) {
            deleteTimetableSlot(slotToDelete.id);
            setSlotToDelete(null);
          }
        }}
        title="تأكيد حذف الحصة من الجدول"
        message={`هل أنت متأكد من رغبتك في حذف حصة [${
          subjectMap.get(slotToDelete?.subjectId || '')?.nameAr || ''
        }] لفصل [${classMap.get(slotToDelete?.classId || '')?.code || ''}] يوم ${
          slotToDelete ? getArabicDayName(slotToDelete.dayOfWeek) : ''
        }؟`}
        confirmText="حذف الحصة"
      />
    </div>
  );
};
