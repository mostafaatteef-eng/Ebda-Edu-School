import React, { useState } from 'react';
import {
  FlaskConical,
  Wrench,
  Plus,
  Edit2,
  Trash2,
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
import { ConfirmationModal } from '../common/ConfirmationModal';
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
    deleteLab,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'labs' | 'workshops'>('labs');
  const [searchQuery, setSearchQuery] = useState('');

  // Lab Modal State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [labNameAr, setLabNameAr] = useState('');
  const [labNameEn, setLabNameEn] = useState('');
  const [labCode, setLabCode] = useState('');
  const [labCapacity, setLabCapacity] = useState(30);
  const [labInCharge, setLabInCharge] = useState('');
  const [labLocation, setLabLocation] = useState('');

  // Workshop Modal State
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [wsNameAr, setWsNameAr] = useState('');
  const [wsNameEn, setWsNameEn] = useState('');
  const [wsCode, setWsCode] = useState('');
  const [wsCapacity, setWsCapacity] = useState(25);
  const [wsInCharge, setWsInCharge] = useState('');
  const [wsLocation, setWsLocation] = useState('');

  // Deletion modals state
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);

  // Inspect Modal
  const [inspectItem, setInspectItem] = useState<{
    type: 'lab' | 'workshop';
    data: Lab | Workshop;
  } | null>(null);

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  // Lab Modal Handlers
  const openAddLabModal = () => {
    setEditingLab(null);
    setLabNameAr('');
    setLabNameEn('');
    setLabCode(`LAB-0${labs.length + 1}`);
    setLabCapacity(30);
    setLabInCharge('م. أحمد شاكر');
    setLabLocation('المبنى التكنولوجي - الطابق الثاني');
    setIsLabModalOpen(true);
  };

  const openEditLabModal = (l: Lab) => {
    setEditingLab(l);
    setLabNameAr(l.nameAr);
    setLabNameEn(l.code || '');
    setLabCode(l.code);
    setLabCapacity(l.capacity || 30);
    setLabInCharge(l.inChargeEngineer || '');
    setLabLocation(l.location || '');
    setIsLabModalOpen(true);
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labNameAr.trim()) return;

    if (editingLab) {
      updateLab(editingLab.id, {
        nameAr: labNameAr.trim(),
        code: labCode.trim(),
        capacity: Number(labCapacity) || 30,
        inChargeEngineer: labInCharge.trim(),
        location: labLocation.trim(),
      });
    } else {
      addLab({
        schoolId: activeSchool.id,
        nameAr: labNameAr.trim(),
        code: labCode.trim() || `LAB-${Date.now().toString().slice(-3)}`,
        capacity: Number(labCapacity) || 30,
        inChargeEngineer: labInCharge.trim(),
        location: labLocation.trim(),
        type: 'computer',
      });
    }
    setIsLabModalOpen(false);
  };

  // Workshop Modal Handlers
  const openAddWorkshopModal = () => {
    setEditingWorkshop(null);
    setWsNameAr('');
    setWsNameEn('');
    setWsCode(`WS-0${workshops.length + 1}`);
    setWsCapacity(25);
    setWsInCharge('م. حسن الديب');
    setWsLocation('مبنى الورش المركزية - الطابق الأرضي');
    setIsWorkshopModalOpen(true);
  };

  const openEditWorkshopModal = (w: Workshop) => {
    setEditingWorkshop(w);
    setWsNameAr(w.nameAr);
    setWsNameEn(w.code || '');
    setWsCode(w.code);
    setWsCapacity(w.capacity || 25);
    setWsInCharge(w.inChargeEngineer || '');
    setWsLocation(w.location || '');
    setIsWorkshopModalOpen(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsNameAr.trim()) return;

    if (editingWorkshop) {
      updateWorkshop(editingWorkshop.id, {
        nameAr: wsNameAr.trim(),
        code: wsCode.trim(),
        capacity: Number(wsCapacity) || 25,
        inChargeEngineer: wsInCharge.trim(),
        location: wsLocation.trim(),
      });
    } else {
      addWorkshop({
        schoolId: activeSchool.id,
        nameAr: wsNameAr.trim(),
        code: wsCode.trim() || `WS-${Date.now().toString().slice(-3)}`,
        capacity: Number(wsCapacity) || 25,
        inChargeEngineer: wsInCharge.trim(),
        location: wsLocation.trim(),
        specialization: 'mechanical',
      });
    }
    setIsWorkshopModalOpen(false);
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
              التشغيل التكنولوجي المستقل
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            فصل كامل ومستقل لإدارة المعامل التكنولوجية والورش الصناعية مع منع التعارض وتتبع معدلات الإشغال الأسبوعي (60 دقيقة لكل جلسة)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'labs' ? (
            <button
              type="button"
              onClick={openAddLabModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة معمل ذكي
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddWorkshopModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة ورشة تدريبية
            </button>
          )}
        </div>
      </div>

      {/* Switcher Tab */}
      <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'workshops'
              ? 'bg-[#25A09F] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>الورش الصناعية والتدريبية ({workshops.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم، الكود، أو المهندس المسؤول..."
          className="w-full text-xs font-medium bg-white border border-slate-200 rounded-2xl pr-9 pl-4 py-2.5 shadow-xs focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'labs' ? labs : workshops)
          .filter(
            (item) =>
              item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.inChargeEngineer && item.inChargeEngineer.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((item) => {
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => (isLab ? openEditLabModal(item as Lab) : openEditWorkshopModal(item as Workshop))}
                        className="p-1.5 text-slate-400 hover:text-[#25A09F] rounded-lg transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => (isLab ? setLabToDelete(item as Lab) : setWorkshopToDelete(item as Workshop))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>السعة الاستيعابية:</span>
                      <strong className="text-slate-900">{item.capacity || (isLab ? 30 : 25)} طالب</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>المهندس المسؤول:</span>
                      <strong className="text-[#1E807F]">{item.inChargeEngineer || '—'}</strong>
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
                    className="w-full py-2 text-xs font-bold text-[#25A09F] bg-[#25A09F]/10 hover:bg-[#25A09F]/20 rounded-xl transition-colors text-center cursor-pointer"
                  >
                    عرض جدول التشغيل الأسبوعي ({scheduledSlots.length} حصة)
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Lab / Workshop Inspect & Schedule Modal */}
      <Modal
        isOpen={!!inspectItem}
        onClose={() => setInspectItem(null)}
        title={`جدول تشغيل: ${inspectItem?.data.nameAr || ''}`}
        maxWidth="2xl"
        footer={
          <button
            type="button"
            onClick={() => setInspectItem(null)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            إغلاق
          </button>
        }
      >
        {inspectItem && (
          <div className="space-y-4 text-right">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <span>كود المنشأة: <strong>{inspectItem.data.code}</strong></span>
              <span>المهندس المسؤول: <strong>{inspectItem.data.inChargeEngineer || '—'}</strong></span>
              <span>السعة: <strong>{inspectItem.data.capacity} طالب</strong></span>
            </div>
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
                        <td className="p-2.5 font-mono font-bold text-[#25A09F]">{slot.startTime} - {slot.endTime}</td>
                        <td className="p-2.5 font-bold text-slate-900">{subjectMap.get(slot.subjectId)?.nameAr}</td>
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

      {/* Add / Edit Lab Modal */}
      <Modal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        title={editingLab ? 'تعديل المعمل الذكي' : 'إضافة معمل ذكي جديد'}
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsLabModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveLab}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 cursor-pointer"
            >
              حفظ
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
              placeholder="مثال: معمل الإلكترونيات المتقدمة والروبوتات"
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
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
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
                min={1}
                max={60}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موقع المعمل / المبنى</label>
            <input
              type="text"
              value={labLocation}
              onChange={(e) => setLabLocation(e.target.value)}
              placeholder="المبنى التكنولوجي - الطابق الثاني"
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
        </form>
      </Modal>

      {/* Add / Edit Workshop Modal */}
      <Modal
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        title={editingWorkshop ? 'تعديل الورشة التدريبية' : 'إضافة ورشة تدريبية صناعية جديدة'}
        maxWidth="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setIsWorkshopModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveWorkshop}
              className="px-6 py-2 text-xs font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl shadow-md shadow-teal-500/20 cursor-pointer"
            >
              حفظ
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveWorkshop} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الورشة باللغة العربية</label>
            <input
              type="text"
              value={wsNameAr}
              onChange={(e) => setWsNameAr(e.target.value)}
              placeholder="مثال: ورشة التحكم والتشغيل الآلي CNC"
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الورشة</label>
              <input
                type="text"
                value={wsCode}
                onChange={(e) => setWsCode(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">السعة (طالب)</label>
              <input
                type="number"
                value={wsCapacity}
                onChange={(e) => setWsCapacity(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
                min={1}
                max={60}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المهندس المسؤول</label>
            <input
              type="text"
              value={wsInCharge}
              onChange={(e) => setWsInCharge(e.target.value)}
              placeholder="مثال: م. حسن الديب"
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موقع الورشة / المبنى</label>
            <input
              type="text"
              value={wsLocation}
              onChange={(e) => setWsLocation(e.target.value)}
              placeholder="مبنى الورش المركزية - الطابق الأرضي"
              className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Lab Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!labToDelete}
        onClose={() => setLabToDelete(null)}
        onConfirm={() => {
          if (labToDelete) {
            deleteLab(labToDelete.id);
            setLabToDelete(null);
          }
        }}
        title="تأكيد حذف المعمل الذكي"
        message={`هل أنت متأكد من رغبتك في حذف المعمل [${labToDelete?.nameAr || ''} (${labToDelete?.code || ''})]؟`}
      />

      {/* Delete Workshop Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!workshopToDelete}
        onClose={() => setWorkshopToDelete(null)}
        onConfirm={() => {
          if (workshopToDelete) {
            deleteWorkshop(workshopToDelete.id);
            setWorkshopToDelete(null);
          }
        }}
        title="تأكيد حذف الورشة التدريبية"
        message={`هل أنت متأكد من رغبتك في حذف الورشة التدريبية [${workshopToDelete?.nameAr || ''} (${workshopToDelete?.code || ''})]؟`}
      />
    </div>
  );
};
