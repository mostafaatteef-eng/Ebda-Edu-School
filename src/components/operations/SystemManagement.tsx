import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  DoorClosed,
  UserCheck,
  Clock,
  Layers,
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
    addClass,
    updateClass,
    deleteClass,
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
  const [tTarget, setTTarget] = useState(25);
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
  const [sPreferredLocation, setSPreferredLocation] = useState<'classroom' | 'lab' | 'workshop'>('classroom');

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [cNameAr, setCNameAr] = useState('');
  const [cCode, setCCode] = useState('');
  const [cGradeId, setCGradeId] = useState(grades[0]?.id || '');
  const [cStudentCount, setCStudentCount] = useState(25);
  const [cRoomNumber, setCRoomNumber] = useState('');

  // Deletion modals state
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));

  // Teacher Modal Handlers
  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setTName('');
    setTSpecialization('هندسة وتحكم صناعي');
    setTTarget(25);
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
    if (!tName.trim()) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: tName.trim(),
        specialization: tSpecialization.trim(),
        targetWeeklyLessons: Number(tTarget) || 25,
        email: tEmail.trim(),
        phoneNumber: tPhone.trim(),
      });
    } else {
      addTeacher({
        schoolId: activeSchool.id,
        name: tName.trim(),
        specialization: tSpecialization.trim(),
        targetWeeklyLessons: Number(tTarget) || 25,
        email: tEmail.trim(),
        phoneNumber: tPhone.trim(),
        active: true,
      });
    }
    setIsTeacherModalOpen(false);
  };

  // Subject Modal Handlers
  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSNameAr('');
    setSNameEn('');
    setSCode(`SUB-${subjects.length + 1}`);
    setSWeekly(4);
    setSGradeId(grades[0]?.id || '');
    setSCategory('technical');
    setSPreferredLocation('classroom');
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (s: Subject) => {
    setEditingSubject(s);
    setSNameAr(s.nameAr);
    setSNameEn(s.nameEn || '');
    setSCode(s.code);
    setSWeekly(s.weeklyLessonsTarget || s.weeklyLessonsRequired || 4);
    setSGradeId(s.gradeId);
    setSCategory(s.category || 'technical');
    setSPreferredLocation(s.preferredLocationType || 'classroom');
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNameAr.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        nameAr: sNameAr.trim(),
        nameEn: sNameEn.trim(),
        code: sCode.trim(),
        weeklyLessonsTarget: Number(sWeekly) || 4,
        weeklyLessonsRequired: Number(sWeekly) || 4,
        gradeId: sGradeId,
        category: sCategory,
        preferredLocationType: sPreferredLocation,
      });
    } else {
      addSubject({
        schoolId: activeSchool.id,
        nameAr: sNameAr.trim(),
        nameEn: sNameEn.trim(),
        code: sCode.trim() || `SUB-${Date.now().toString().slice(-4)}`,
        weeklyLessonsTarget: Number(sWeekly) || 4,
        weeklyLessonsRequired: Number(sWeekly) || 4,
        gradeId: sGradeId,
        category: sCategory,
        preferredLocationType: sPreferredLocation,
      });
    }
    setIsSubjectModalOpen(false);
  };

  // Class Modal Handlers
  const openAddClassModal = () => {
    setEditingClass(null);
    setCNameAr('');
    setCCode(`${grades[0]?.level || 1}/${classes.length + 1}`);
    setCGradeId(grades[0]?.id || '');
    setCStudentCount(25);
    setCRoomNumber(`قاعة ${101 + classes.length}`);
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (c: SchoolClass) => {
    setEditingClass(c);
    setCNameAr(c.nameAr);
    setCCode(c.code);
    setCGradeId(c.gradeId);
    setCStudentCount(c.studentCount);
    setCRoomNumber(c.roomNumber);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cNameAr.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, {
        nameAr: cNameAr.trim(),
        code: cCode.trim(),
        gradeId: cGradeId,
        studentCount: Number(cStudentCount) || 25,
        roomNumber: cRoomNumber.trim(),
      });
    } else {
      addClass({
        schoolId: activeSchool.id,
        nameAr: cNameAr.trim(),
        code: cCode.trim() || `${classes.length + 1}`,
        gradeId: cGradeId,
        studentCount: Number(cStudentCount) || 25,
        roomNumber: cRoomNumber.trim(),
      });
    }
    setIsClassModalOpen(false);
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
            إدارة بيانات المعلمين، الأنصبة المستهدفة (60 دقيقة لكل جلسة)، المواد الدراسية، والفصول مع تطبيق سياسات الحفظ والتعديل الفوري
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'teachers' && (
            <button
              type="button"
              onClick={openAddTeacherModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة معلم جديد
            </button>
          )}

          {activeTab === 'subjects' && (
            <button
              type="button"
              onClick={openAddSubjectModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مادة دراسية
            </button>
          )}

          {activeTab === 'classes' && (
            <button
              type="button"
              onClick={openAddClassModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة فصل دراسي
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const current = t.targetWeeklyLessons || 25;
                            if (current > 1) {
                              updateTeacher(t.id, { targetWeeklyLessons: current - 1 });
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                          title="إنقاص حصة / ساعة"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-slate-900 px-1.5 min-w-[2.5rem] text-center">
                          {t.targetWeeklyLessons}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = t.targetWeeklyLessons || 25;
                            if (current < 45) {
                              updateTeacher(t.id, { targetWeeklyLessons: current + 1 });
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-[#25A09F] hover:text-white text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                          title="زيادة حصة / ساعة"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-slate-500 font-medium mr-1">حصة/ساعة</span>
                      </div>
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
                          className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors cursor-pointer"
                          title="تعديل المعلم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeacherToDelete(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="حذف المعلم"
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
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const current = s.weeklyLessonsRequired || s.weeklyLessonsTarget || 4;
                            if (current > 1) {
                              updateSubject(s.id, { weeklyLessonsRequired: current - 1, weeklyLessonsTarget: current - 1 });
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                          title="إنقاص حصة أسبوعية"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-slate-900 px-1.5 min-w-[2.5rem] text-center">
                          {s.weeklyLessonsRequired || s.weeklyLessonsTarget || 4}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = s.weeklyLessonsRequired || s.weeklyLessonsTarget || 4;
                            if (current < 20) {
                              updateSubject(s.id, { weeklyLessonsRequired: current + 1, weeklyLessonsTarget: current + 1 });
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-[#25A09F] hover:text-white text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                          title="زيادة حصة أسبوعية"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-slate-500 font-medium mr-1">حصص</span>
                      </div>
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
                          className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors cursor-pointer"
                          title="تعديل المادة"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubjectToDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="حذف المادة"
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
          {classes
            .filter((c) => c.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((c) => (
              <div key={c.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
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

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditClassModal(c)}
                    className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors cursor-pointer"
                    title="تعديل الفصل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassToDelete(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="حذف الفصل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveTeacher}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 cursor-pointer"
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

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'تعديل المادة الدراسية' : 'إضافة مادة دراسية جديدة'}
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveSubject}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 cursor-pointer"
            >
              حفظ
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveSubject} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة (بالعربية)</label>
            <input
              type="text"
              value={sNameAr}
              onChange={(e) => setSNameAr(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              placeholder="مثال: هندسة التحكم والأنظمة الذكية"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة (بالإنجليزية - اختياري)</label>
            <input
              type="text"
              value={sNameEn}
              onChange={(e) => setSNameEn(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
              placeholder="e.g. Smart Control Systems"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود المادة</label>
              <input
                type="text"
                value={sCode}
                onChange={(e) => setSCode(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة / الصف</label>
              <select
                value={sGradeId}
                onChange={(e) => setSGradeId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحصص الأسبوعية (60 دقيقة)</label>
              <input
                type="number"
                value={sWeekly}
                onChange={(e) => setSWeekly(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                min={1}
                max={20}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف المادة</label>
              <select
                value={sCategory}
                onChange={(e) => setSCategory(e.target.value as any)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                <option value="technical">تخصصي / تكنولوجي</option>
                <option value="core">أساسي / أكاديمي</option>
                <option value="applied">تطبيقي وعملي</option>
                <option value="language">لغات وتواصل</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الموقع المفضل للتدريس</label>
            <select
              value={sPreferredLocation}
              onChange={(e) => setSPreferredLocation(e.target.value as any)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
            >
              <option value="classroom">قاعة دراسية عادية</option>
              <option value="lab">معمل ذكي (Smart Lab)</option>
              <option value="workshop">ورشة تدريبية صناعية (Industrial Workshop)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? 'تعديل الفصل الدراسي' : 'إضافة فصل دراسي جديد'}
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveClass}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 cursor-pointer"
            >
              حفظ
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفصل (بالعربية)</label>
            <input
              type="text"
              value={cNameAr}
              onChange={(e) => setCNameAr(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              placeholder="مثال: أول / 1 تكنولوجيا تطبيقية"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الفصل</label>
              <input
                type="text"
                value={cCode}
                onChange={(e) => setCCode(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                placeholder="1/1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة / الصف</label>
              <select
                value={cGradeId}
                onChange={(e) => setCGradeId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عدد الطلاب</label>
              <input
                type="number"
                value={cStudentCount}
                onChange={(e) => setCStudentCount(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                min={1}
                max={50}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم / موقع القاعة</label>
              <input
                type="text"
                value={cRoomNumber}
                onChange={(e) => setCRoomNumber(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                placeholder="قاعة 101"
                required
              />
            </div>
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

      {/* Delete Subject Modal */}
      <ConfirmationModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        title="تأكيد حذف المادة الدراسية"
        message={`هل أنت متأكد من رغبتك في حذف المادة الدراسية [${subjectToDelete?.nameAr || ''}]؟`}
      />

      {/* Delete Class Modal */}
      <ConfirmationModal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={() => {
          if (classToDelete) {
            deleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        title="تأكيد حذف الفصل الدراسي"
        message={`هل أنت متأكد من رغبتك في حذف الفصل الدراسي [${classToDelete?.nameAr || ''} (${classToDelete?.code || ''})]؟`}
      />
    </div>
  );
};
