import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Link,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeachingRecord, LessonStatus, Teacher, Subject, SchoolClass } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { exportTeachingProgressToExcel } from '../../utils/excelHelper';
import { getArabicDayName } from '../../utils/conflicts';

export const TeachingProgressManager: React.FC = () => {
  const {
    activeSchool,
    teachingRecords,
    teachers,
    subjects,
    classes,
    grades,
    timetableSlots,
    updateTeachingRecord,
    deleteTeachingRecord,
    toggleParentVisibility,
    recordLesson,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [materialsFilter, setMaterialsFilter] = useState<'all' | 'with_link' | 'missing_link'>('all');

  // Edit / Materials Modal State
  const [editingRecord, setEditingRecord] = useState<TeachingRecord | null>(null);
  const [modalTopic, setModalTopic] = useState('');
  const [modalUnit, setModalUnit] = useState('');
  const [modalStatus, setModalStatus] = useState<LessonStatus>('completed');
  const [modalReason, setModalReason] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalVisibility, setModalVisibility] = useState(true);

  // Extra Lesson Modal State (Unscheduled Lesson)
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [extraTeacherId, setExtraTeacherId] = useState(teachers[0]?.id || '');
  const [extraSubjectId, setExtraSubjectId] = useState(subjects[0]?.id || '');
  const [extraGradeId, setExtraGradeId] = useState(grades[0]?.id || '');
  const [extraClassId, setExtraClassId] = useState(classes[0]?.id || '');
  const [extraDate, setExtraDate] = useState(new Date().toISOString().slice(0, 10));
  const [extraTime, setExtraTime] = useState('14:30');
  const [extraTopic, setExtraTopic] = useState('');
  const [extraReason, setExtraReason] = useState('حصة تعويضية إضافية للتدريب العملي');
  const [extraUrl, setExtraUrl] = useState('');

  // Delete modal
  const [recordToDelete, setRecordToDelete] = useState<TeachingRecord | null>(null);

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  // Filtered records
  const filteredRecords = teachingRecords.filter((r) => {
    const teacher = teacherMap.get(r.teacherId);
    const sub = subjectMap.get(r.subjectId);
    const cl = classMap.get(r.classId);

    const matchesSearch =
      r.lessonTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub?.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cl?.code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTeacher = !selectedTeacherId || r.teacherId === selectedTeacherId;
    const matchesSubject = !selectedSubjectId || r.subjectId === selectedSubjectId;
    const matchesClass = !selectedClassId || r.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'all' || r.lessonStatus === selectedStatus;
    const matchesMaterials =
      materialsFilter === 'all'
        ? true
        : materialsFilter === 'with_link'
        ? !!r.materialsUrl && r.materialsUrl.trim() !== ''
        : !r.materialsUrl || r.materialsUrl.trim() === '';

    return matchesSearch && matchesTeacher && matchesSubject && matchesClass && matchesStatus && matchesMaterials;
  });

  const openEditModal = (rec: TeachingRecord) => {
    setEditingRecord(rec);
    setModalTopic(rec.lessonTopic);
    setModalUnit(rec.unitModule || '');
    setModalStatus(rec.lessonStatus);
    setModalReason(rec.notCompletedReason || '');
    setModalUrl(rec.materialsUrl || '');
    setModalNotes(rec.teacherNotes || '');
    setModalVisibility(rec.parentVisibility);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateTeachingRecord(editingRecord.id, {
      lessonTopic: modalTopic,
      unitModule: modalUnit,
      lessonStatus: modalStatus,
      notCompletedReason: modalStatus !== 'completed' ? modalReason : '',
      materialsUrl: modalUrl,
      teacherNotes: modalNotes,
      parentVisibility: modalVisibility,
    });
    setEditingRecord(null);
  };

  const handleSaveExtraLesson = (e: React.FormEvent) => {
    e.preventDefault();
    recordLesson({
      schoolId: activeSchool.id,
      date: extraDate,
      dayOfWeek: 'Sunday',
      slotIndex: 7,
      startTime: extraTime,
      endTime: '15:30',
      durationMinutes: 60,
      teacherId: extraTeacherId,
      subjectId: extraSubjectId,
      gradeId: extraGradeId,
      classId: extraClassId,
      locationType: 'classroom',
      lessonTopic: extraTopic,
      lessonStatus: 'completed',
      materialsUrl: extraUrl,
      parentVisibility: true,
      isUnscheduledExtra: true,
      extraLessonReason: extraReason,
    });
    setIsExtraModalOpen(false);
  };

  const handleExcelExport = () => {
    exportTeachingProgressToExcel(filteredRecords, teachers, subjects, classes);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              متابعة ما تم تدريسه والمحتوى التعليمي (Teaching Progress & Resources)
            </h1>
            <Badge variant="primary" size="sm">
              توثيق 60 دقيقة
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مراجعة الدروس المنفذة، إدارة روابط Google Drive / LMS، والتحكم في ظهور المحتوى لأولياء الأمور
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExcelExport}
            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير تقرير Excel
          </button>
          <button
            type="button"
            onClick={() => setIsExtraModalOpen(true)}
            className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            تسجيل حصة إضافية / تعويضية
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالموضوع، المعلم، المادة، الفصل..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            />
          </div>

          {/* Teacher Filter */}
          <div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">جميع المعلمين</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">جميع المواد</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="">جميع الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="all">جميع الحالات</option>
              <option value="completed">تم التنفيذ بنجاح</option>
              <option value="partially_completed">تنفيذ جزئي</option>
              <option value="not_completed">لم تنفذ</option>
            </select>
          </div>
        </div>

        {/* Material Presence Chips */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">تصفية روابط المحتوى:</span>
            <button
              type="button"
              onClick={() => setMaterialsFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                materialsFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({teachingRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setMaterialsFilter('with_link')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                materialsFilter === 'with_link'
                  ? 'bg-[#25A09F] text-white'
                  : 'bg-teal-50 text-[#1E807F] hover:bg-teal-100'
              }`}
            >
              مع رابط مواد (
              {teachingRecords.filter((r) => !!r.materialsUrl && r.materialsUrl.trim() !== '').length}
              )
            </button>
            <button
              type="button"
              onClick={() => setMaterialsFilter('missing_link')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                materialsFilter === 'missing_link'
                  ? 'bg-[#F35024] text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              تفتقر للرابط (
              {teachingRecords.filter((r) => !r.materialsUrl || r.materialsUrl.trim() === '').length}
              )
            </button>
          </div>

          <div className="text-slate-400 font-medium">
            عدد السجلات المعروضة: <strong>{filteredRecords.length} سجل</strong>
          </div>
        </div>
      </div>

      {/* Teaching Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 border-l border-slate-800">التاريخ والوقت</th>
                <th className="p-3.5 border-l border-slate-800">المادة والفصل</th>
                <th className="p-3.5 border-l border-slate-800">المعلم</th>
                <th className="p-3.5 border-l border-slate-800">موضوع الحصة وما تم تدريسه</th>
                <th className="p-3.5 border-l border-slate-800 text-center">حالة التنفيذ</th>
                <th className="p-3.5 border-l border-slate-800">رابط المواد التعليمية</th>
                <th className="p-3.5 border-l border-slate-800 text-center">ظهور الأهالي</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد سجلات تدريس مطابقة للشروط المحددة.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const teacher = teacherMap.get(rec.teacherId);
                  const sub = subjectMap.get(rec.subjectId);
                  const cl = classMap.get(rec.classId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Date & Time */}
                      <td className="p-3.5 align-top whitespace-nowrap">
                        <div className="font-bold text-slate-900">{rec.date}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {getArabicDayName(rec.dayOfWeek)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {rec.startTime} - {rec.endTime} (60 دقيقة)
                        </div>
                        {rec.isUnscheduledExtra && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                            حصة إضافية
                          </span>
                        )}
                      </td>

                      {/* Subject & Class */}
                      <td className="p-3.5 align-top">
                        <div className="font-extrabold text-slate-900">{sub?.nameAr}</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                          فصل: {cl?.nameAr || cl?.code}
                        </div>
                        <div className="text-[10px] text-slate-400">{rec.roomName || 'القاعة'}</div>
                      </td>

                      {/* Teacher */}
                      <td className="p-3.5 align-top">
                        <div className="font-bold text-slate-900">{teacher?.name}</div>
                        <div className="text-[10px] text-slate-500">{teacher?.specialization}</div>
                      </td>

                      {/* Lesson Topic */}
                      <td className="p-3.5 align-top max-w-xs">
                        <div className="font-bold text-slate-900 leading-snug">{rec.lessonTopic}</div>
                        {rec.unitModule && (
                          <div className="text-[11px] text-[#1E807F] font-medium mt-0.5">
                            {rec.unitModule}
                          </div>
                        )}
                        {rec.teacherNotes && (
                          <div className="text-[10px] text-slate-500 mt-1 italic line-clamp-2">
                            "{rec.teacherNotes}"
                          </div>
                        )}
                        {rec.notCompletedReason && (
                          <div className="text-[10px] text-rose-700 mt-1 font-bold">
                            سبب عدم الاكتمال: {rec.notCompletedReason}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 align-top text-center">
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
                          {rec.lessonStatus === 'completed'
                            ? 'تم التنفيذ'
                            : rec.lessonStatus === 'partially_completed'
                            ? 'تنفيذ جزئي'
                            : 'لم تنفذ'}
                        </Badge>
                      </td>

                      {/* Materials URL */}
                      <td className="p-3.5 align-top">
                        {rec.materialsUrl && rec.materialsUrl.trim() !== '' ? (
                          <a
                            href={rec.materialsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#25A09F] bg-[#25A09F]/10 hover:bg-[#25A09F]/20 rounded-xl transition-colors max-w-[180px] truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">فتح الرابط</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                            ⚠️ لا يوجد رابط
                          </span>
                        )}
                      </td>

                      {/* Parent Visibility Toggle */}
                      <td className="p-3.5 align-top text-center">
                        <button
                          type="button"
                          onClick={() => toggleParentVisibility(rec.id, !rec.parentVisibility)}
                          className={`p-1.5 rounded-xl border transition-all inline-flex items-center gap-1 text-[10px] font-bold ${
                            rec.parentVisibility
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={rec.parentVisibility ? 'مرئي لأولياء الأمور - انقر للإخفاء' : 'مخفي عن أولياء الأمور - انقر للإظهار'}
                        >
                          {rec.parentVisibility ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{rec.parentVisibility ? 'مرئي' : 'مخفي'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 align-top text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(rec)}
                            className="p-1.5 text-slate-500 hover:text-[#25A09F] hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل السجل والمحتوى"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="تعديل توثيق الحصة والمحتوى التعليمي"
        subtitle="تعديل رابط المواد، موضوع الدرس، أو صلاحيات ظهور المحتوى للأهالي"
        maxWidth="xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20"
            >
              حفظ التغييرات
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              موضوع الحصة / ما تم تدريسه
            </label>
            <input
              type="text"
              value={modalTopic}
              onChange={(e) => setModalTopic(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الوحدة / الموديول
              </label>
              <input
                type="text"
                value={modalUnit}
                onChange={(e) => setModalUnit(e.target.value)}
                placeholder="مثال: الوحدة الأولى - نظم الاستشعار"
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة التنفيذ</label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value as LessonStatus)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="completed">تم التنفيذ بالكامل (Completed)</option>
                <option value="partially_completed">تنفيذ جزئي (Partially)</option>
                <option value="not_completed">لم تنفذ (Not Completed)</option>
              </select>
            </div>
          </div>

          {modalStatus !== 'completed' && (
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                سبب عدم اكتمال الحصة
              </label>
              <input
                type="text"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="أدخل سبب عدم اكتمال الحصة..."
                className="w-full text-xs bg-rose-50 border border-rose-300 rounded-xl px-3 py-2 text-rose-900"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>رابط المواد التعليمية والمرفقات (Lesson Materials URL)</span>
              <span className="text-[10px] text-[#25A09F]">Google Drive / OneDrive / Docs</span>
            </label>
            <input
              type="url"
              value={modalUrl}
              onChange={(e) => setModalUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs font-mono text-left bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المعلم / الإدارة</label>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              rows={2}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">إتاحة المحتوى لأولياء الأمور</div>
              <div className="text-[10px] text-slate-500">
                السماح لأولياء الأمور بفتح رابط المواد والدروس في بوابة المتابعة
              </div>
            </div>
            <input
              type="checkbox"
              checked={modalVisibility}
              onChange={(e) => setModalVisibility(e.target.checked)}
              className="w-4 h-4 accent-[#25A09F] rounded"
            />
          </div>
        </form>
      </Modal>

      {/* Extra Unscheduled Lesson Modal */}
      <Modal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        title="تسجيل حصة تعويضية / إضافية (Unscheduled Extra Lesson)"
        subtitle="حصة 60 دقيقة خارج الجدول المعتاد لتعويض المتأخرات أو التدريب المكثف"
        maxWidth="xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsExtraModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveExtraLesson}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20"
            >
              تأكيد وتسجيل الحصة
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveExtraLesson} className="space-y-4 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعلم</label>
              <select
                value={extraTeacherId}
                onChange={(e) => setExtraTeacherId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة</label>
              <select
                value={extraSubjectId}
                onChange={(e) => setExtraSubjectId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفصل</label>
              <select
                value={extraClassId}
                onChange={(e) => setExtraClassId(e.target.value)}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
              <input
                type="date"
                value={extraDate}
                onChange={(e) => setExtraDate(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">سبب الحصة الإضافية</label>
            <input
              type="text"
              value={extraReason}
              onChange={(e) => setExtraReason(e.target.value)}
              className="w-full text-xs font-bold bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الحصة</label>
            <input
              type="text"
              value={extraTopic}
              onChange={(e) => setExtraTopic(e.target.value)}
              placeholder="أدخل عنوان وموضوع الحصة المنفذة..."
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رابط المواد التعليمية (Drive/LMS)</label>
            <input
              type="url"
              value={extraUrl}
              onChange={(e) => setExtraUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs font-mono text-left bg-white border border-slate-300 rounded-xl px-3 py-2"
              dir="ltr"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            deleteTeachingRecord(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        title="تأكيد حذف توثيق الحصة"
        message={`هل أنت متأكد من رغبتك في حذف سجل الحصة [${recordToDelete?.lessonTopic || ''}] المؤرخة في ${recordToDelete?.date}؟`}
      />
    </div>
  );
};
