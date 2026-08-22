import React, { useState } from 'react';
import {
  FlaskConical,
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lab, Workshop, Teacher, Subject, SchoolClass } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { getArabicDayName } from '../../utils/conflicts';

export const LabsWorkshopsManager: React.FC = () => {
  const {
    activeSchool,
    labs,
    workshops,
    timetableSlots,
    teachers,
    subjects,
    classes,
    addLab,
    updateLab,
    addWorkshop,
    updateWorkshop,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'labs' | 'workshops'>('labs');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [labNameAr, setLabNameAr] = useState('');
  const [labNameEn, setLabNameEn] = useState('');
  const [labCode, setLabCode] = useState('');
  const [labCapacity, setLabCapacity] = useState(30);
  const [labInCharge, setLabInCharge] = useState('');

  // Inspect Modal
  const [inspectItem, setInspectItem] = useState<{
    type: 'lab' | 'workshop';
    data: Lab | Workshop;
  } | null>(null);

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  const openAddLabModal = () => {
    setEditingLab(null);
    setLabNameAr('');
    setLabNameEn('');
    setLabCode(`LAB-0${labs.length + 1}`);
    setLabCapacity(30);
    setLabInCharge('م. أحمد شاكر');
    setIsLabModalOpen(true);
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLab) {
      updateLab(editingLab.id, {
        nameAr: labNameAr,
        nameEn: labNameEn,
        code: labCode,
        capacity: labCapacity,
        inChargeEngineer: labInCharge,
      });
    } else {
      addLab({
        schoolId: activeSchool.id,
        nameAr: labNameAr,
        nameEn: labNameEn,
        code: labCode,
        capacity: labCapacity,
        inChargeEngineer: labInCharge,
        status: 'active',
      });
    }
    setIsLabModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              إدارة المعامل الذكية والورش التدريبية التطبيقية
            </h1>
            <Badge variant="primary" size="sm">
              التشغيل التكنولوجي
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة معدلات الإشغال الأسبوعي، جداول التدريب العملي (60 دقيقة)، وسعة القاعات التكنولوجية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openAddLabModal}
            className="px-5 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة معمل / ورشة
          </button>
        </div>
      </div>

      {/* Switcher Tab */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'labs'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>المعامل الذكية والتكنولوجية ({labs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workshops')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'workshops'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>الورش الصناعية والتدريبية ({workshops.length})</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'labs' ? labs : workshops).map((item) => {
          const isLab = activeTab === 'labs';
          const scheduledSlots = timetableSlots.filter((s) =>
            isLab ? s.locationType === 'lab' && s.labId === item.id : s.locationType === 'workshop' && s.workshopId === item.id
          );
          const weeklyOperatingHours = scheduledSlots.length; // Each slot is 60 min
          const maxOperatingCapacity = 30; // 30 hours per week (5 days * 6 slots)
          const occupancyRate = Math.round((weeklyOperatingHours / maxOperatingCapacity) * 100);

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#25A09F]/10 text-[#25A09F]">
                      {isLab ? <FlaskConical className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{item.nameAr}</h3>
                      <div className="text-[11px] text-slate-400 font-mono">{item.code}</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    جاهز للتشغيل
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>السعة الاستيعابية:</span>
                    <strong className="text-slate-900">{item.capacity} طالب</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>المهندس المسؤول:</span>
                    <strong className="text-[#1E807F]">{item.inChargeEngineer}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>التشغيل الأسبوعي:</span>
                    <strong className="text-slate-900">{weeklyOperatingHours} ساعة (60 دقيقة)</strong>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">معدل الإشغال الأسبوعي</span>
                    <span className="text-[#25A09F] font-mono">{occupancyRate}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#25A09F] rounded-full transition-all"
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectItem({ type: isLab ? 'lab' : 'workshop', data: item })}
                  className="w-full py-2 text-xs font-bold text-[#25A09F] bg-[#25A09F]/10 hover:bg-[#25A09F]/20 rounded-xl transition-colors text-center"
                >
                  عرض جدول التشغيل الأسبوعي ({scheduledSlots.length} حصة)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lab Inspect & Schedule Modal */}
      <Modal
        isOpen={!!inspectItem}
        onClose={() => setInspectItem(null)}
        title={`جدول تشغيل: ${inspectItem?.data.nameAr || ''}`}
        subtitle={`كود: ${inspectItem?.data.code || ''} • المهندس المسؤول: ${inspectItem?.data.inChargeEngineer || ''}`}
        maxWidth="2xl"
        footer={
          <button
            type="button"
            onClick={() => setInspectItem(null)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            إغلاق
          </button>
        }
      >
        {inspectItem && (
          <div className="space-y-4 text-right">
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">اليوم</th>
                    <th className="p-2.5">التوقيت (60 دقيقة)</th>
                    <th className="p-2.5">المادة</th>
                    <th className="p-2.5">المعلم</th>
                    <th className="p-2.5">الفصل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timetableSlots
                    .filter((s) =>
                      inspectItem.type === 'lab'
                        ? s.locationType === 'lab' && s.labId === inspectItem.data.id
                        : s.locationType === 'workshop' && s.workshopId === inspectItem.data.id
                    )
                    .map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{getArabicDayName(slot.dayOfWeek)}</td>
                        <td className="p-2.5 font-mono">{slot.startTime} - {slot.endTime}</td>
                        <td className="p-2.5 font-bold text-[#25A09F]">{subjectMap.get(slot.subjectId)?.nameAr}</td>
                        <td className="p-2.5">{teacherMap.get(slot.teacherId)?.name}</td>
                        <td className="p-2.5">فصل: {classMap.get(slot.classId)?.code}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Lab Modal */}
      <Modal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        title="إضافة معمل ذكي جديد"
        subtitle="تسجيل معمل تكنولوجي جديد في البنية التحتية للمدرسة"
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsLabModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveLab}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20"
            >
              حفظ المعمل
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveLab} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعمل باللغة العربية</label>
            <input
              type="text"
              value={labNameAr}
              onChange={(e) => setLabNameAr(e.target.value)}
              placeholder="مثال: معمل الإلكترونيات المتقدمة"
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود المعمل</label>
              <input
                type="text"
                value={labCode}
                onChange={(e) => setLabCode(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">السعة (طالب)</label>
              <input
                type="number"
                value={labCapacity}
                onChange={(e) => setLabCapacity(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المهندس المسؤول</label>
            <input
              type="text"
              value={labInCharge}
              onChange={(e) => setLabInCharge(e.target.value)}
              placeholder="مثال: م. أحمد شاكر"
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
