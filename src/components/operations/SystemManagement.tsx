import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher, Subject, SchoolClass, Grade } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface SystemManagementProps {
  initialTab?: 'teachers' | 'subjects' | 'classes';
}

export const SystemManagement: React.FC<SystemManagementProps> = ({ initialTab = 'teachers' }) => {
  const {
    activeSchool,
    teachers,
    subjects,
    classes,
    grades,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'teachers' | 'subjects' | 'classes'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');

  // Teacher Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tName, setTName] = useState('');
  const [tSpecialization, setTSpecialization] = useState('');
  const [tTarget, setTTarget] = useState(18);
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [sNameAr, setSNameAr] = useState('');
  const [sNameEn, setSNameEn] = useState('');
  const [sCode, setSCode] = useState('');
  const [sWeekly, setSWeekly] = useState(4);
  const [sGradeId, setSGradeId] = useState(grades[0]?.id || '');
  const [sCategory, setSCategory] = useState<'core' | 'technical' | 'language' | 'applied'>('technical');

  // Deletion modals
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));

  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setTName('');
    setTSpecialization('هندسة وتحكم صناعي');
    setTTarget(18);
    setTEmail('');
    setTPhone('');
    setIsTeacherModalOpen(true);
  };

  const openEditTeacherModal = (t: Teacher) => {
    setEditingTeacher(t);
    setTName(t.name);
    setTSpecialization(t.specialization);
    setTTarget(t.targetWeeklyLessons);
    setTEmail(t.email || '');
    setTPhone(t.phoneNumber || '');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: tName,
        specialization: tSpecialization,
        targetWeeklyLessons: tTarget,
        email: tEmail,
        phoneNumber: tPhone,
      });
    } else {
      addTeacher({
        schoolId: activeSchool.id,
        name: tName,
        specialization: tSpecialization,
        targetWeeklyLessons: tTarget,
        email: tEmail,
        phoneNumber: tPhone,
        active: true,
      });
    }
    setIsTeacherModalOpen(false);
  };

  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSNameAr('');
    setSNameEn('');
    setSCode(`SUB-${subjects.length + 1}`);
    setSWeekly(4);
    setSGradeId(grades[0]?.id || '');
    setSCategory('technical');
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (s: Subject) => {
    setEditingSubject(s);
    setSNameAr(s.nameAr);
    setSNameEn(s.nameEn || '');
    setSCode(s.code);
    setSWeekly(s.weeklyLessonsTarget);
    setSGradeId(s.gradeId);
    setSCategory(s.category);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        nameAr: sNameAr,
        nameEn: sNameEn,
        code: sCode,
        weeklyLessonsTarget: sWeekly,
        gradeId: sGradeId,
        category: sCategory,
      });
    } else {
      addSubject({
        schoolId: activeSchool.id,
        nameAr: sNameAr,
        nameEn: sNameEn,
        code: sCode,
        weeklyLessonsTarget: sWeekly,
        gradeId: sGradeId,
        category: sCategory,
      });
    }
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              إدارة الكيانات والهيكل الأكاديمي (System Management)
            </h1>
            <Badge variant="primary" size="sm">
              Single Source of Truth
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة بيانات المعلمين، الأنصبة المستهدفة، المواد الدراسية، والفصول مع تطبيق سياسات الحذف الآمن
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'teachers' && (
            <button
              type="button"
              onClick={openAddTeacherModal}
              className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة معلم جديد
            </button>
          )}

          {activeTab === 'subjects' && (
            <button
              type="button"
              onClick={openAddSubjectModal}
              className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة مادة دراسية
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'teachers'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>هيئة التدريس والمعلمون ({teachers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'subjects'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>المواد الدراسية والمناهج ({subjects.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'classes'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>الفصول والصفوف الدراسية ({classes.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم، التخصص، أو الكود..."
          className="w-full text-xs font-medium bg-white border border-slate-200 rounded-2xl pr-9 pl-4 py-2.5 shadow-xs focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
        />
      </div>

      {/* Teachers Table View */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 border-l border-slate-800">المعلم</th>
                <th className="p-3.5 border-l border-slate-800">التخصص الأكاديمي</th>
                <th className="p-3.5 border-l border-slate-800 text-center">النصاب المستهدف (ساعة)</th>
                <th className="p-3.5 border-l border-slate-800">بيانات الاتصال</th>
                <th className="p-3.5 border-l border-slate-800 text-center">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers
                .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#1E807F] font-black text-xs flex items-center justify-center shrink-0">
                          {t.name.trim().slice(0, 2)}
                        </div>
                        <div className="font-extrabold text-slate-900">{t.name}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">{t.specialization}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                      {t.targetWeeklyLessons} ساعة أسبوعية (60 دقيقة)
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      <div>{t.email || '—'}</div>
                      <div>{t.phoneNumber || '—'}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge variant={t.active ? 'success' : 'neutral'} size="sm" dot>
                        {t.active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTeacherModal(t)}
                          className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeacherToDelete(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subjects View */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5 border-l border-slate-800">المادة الدراسية</th>
                <th className="p-3.5 border-l border-slate-800">الكود</th>
                <th className="p-3.5 border-l border-slate-800">الصف الدراسي</th>
                <th className="p-3.5 border-l border-slate-800 text-center">الحصص الأسبوعية المستهدفة</th>
                <th className="p-3.5 border-l border-slate-800 text-center">النوع</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects
                .filter((s) => s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{s.nameAr}</div>
                      {s.nameEn && <div className="text-[10px] text-slate-400 font-mono">{s.nameEn}</div>}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#25A09F]">{s.code}</td>
                    <td className="p-3.5 font-bold text-slate-700">{gradeMap.get(s.gradeId)?.nameAr}</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">
                      {s.weeklyLessonsTarget} حصص (60 دقيقة)
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge variant="primary" size="sm">
                        {s.category === 'technical' ? 'تخصصي / عملي' : s.category === 'core' ? 'أساسي' : 'تطبيقي'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditSubjectModal(s)}
                          className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubjectToDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Classes View */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#25A09F] bg-teal-50 px-2 py-1 rounded-lg">
                  {c.code}
                </span>
                <span className="text-xs font-bold text-slate-500">{gradeMap.get(c.gradeId)?.nameAr}</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{c.nameAr}</h3>
              <div className="text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>القاعة: <strong>{c.roomNumber}</strong></span>
                <span>الطلاب: <strong>{c.studentCount} طالب</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Modal */}
      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title={editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد إلى هيئة التدريس'}
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveTeacher}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20"
            >
              حفظ
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم</label>
            <input
              type="text"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الأكاديمي</label>
            <input
              type="text"
              value={tSpecialization}
              onChange={(e) => setTSpecialization(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              النصاب الأسبوعي المستهدف (ساعة / حصة 60 دقيقة)
            </label>
            <input
              type="number"
              value={tTarget}
              onChange={(e) => setTTarget(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={tEmail}
              onChange={(e) => setTEmail(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={tPhone}
              onChange={(e) => setTPhone(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Teacher Modal */}
      <ConfirmationModal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={() => {
          if (teacherToDelete) {
            deleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        title="تأكيد حذف المعلم (Soft Delete)"
        message={`هل أنت متأكد من رغبتك في حذف المعلم [${teacherToDelete?.name || ''}]؟ سيتم أرشفة بياناته مع الاحتفاظ بسجلات التدريس السابقة للتدقيق الأكاديمي.`}
      />
    </div>
  );
};
