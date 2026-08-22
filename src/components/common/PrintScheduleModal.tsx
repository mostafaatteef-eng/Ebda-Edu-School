import React, { useState } from 'react';
import { Printer, Download, FileSpreadsheet, Eye, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { getArabicDayName } from '../../utils/conflicts';
import { exportTimetableToExcel } from '../../utils/excelHelper';
import { Teacher, Subject, SchoolClass, Grade, Lab, Workshop } from '../../types';
import { NTSSEmblem, NTSSLogo } from './NTSSLogo';

interface PrintScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'school' | 'grade' | 'class' | 'teacher' | 'lab' | 'workshop';
  defaultId?: string;
}

export const PrintScheduleModal: React.FC<PrintScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultView = 'school',
  defaultId = '',
}) => {
  const {
    activeSchool,
    currentAcademicYear,
    timetableSlots,
    teachers,
    subjects,
    grades,
    classes,
    labs,
    workshops,
    timeSlots,
  } = useApp();

  const [printType, setPrintType] = useState<'school' | 'grade' | 'class' | 'teacher' | 'lab' | 'workshop'>(defaultView);
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedLabId, setSelectedLabId] = useState<string>(labs[0]?.id || '');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(workshops[0]?.id || '');

  // Filter slots based on selected type
  const filteredSlots = timetableSlots.filter((slot) => {
    if (printType === 'school') return true;
    if (printType === 'grade') return slot.gradeId === selectedGradeId;
    if (printType === 'class') return slot.classId === selectedClassId;
    if (printType === 'teacher') return slot.teacherId === selectedTeacherId;
    if (printType === 'lab') return slot.locationType === 'lab' && slot.labId === selectedLabId;
    if (printType === 'workshop') return slot.locationType === 'workshop' && slot.workshopId === selectedWorkshopId;
    return true;
  });

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));
  const gradeMap = new Map<string, Grade>(grades.map((g) => [g.id, g]));
  const labMap = new Map<string, Lab>(labs.map((l) => [l.id, l]));
  const wsMap = new Map<string, Workshop>(workshops.map((w) => [w.id, w]));

  const getSubTitle = () => {
    if (printType === 'school') return 'جدول المدرسة العام المتكامل (جميع الفصول والمعامل)';
    if (printType === 'grade') return `جدول: ${gradeMap.get(selectedGradeId)?.nameAr || ''}`;
    if (printType === 'class') return `جدول فصل: ${classMap.get(selectedClassId)?.nameAr || classMap.get(selectedClassId)?.code || ''}`;
    if (printType === 'teacher') return `جدول المعلم: ${teacherMap.get(selectedTeacherId)?.name || ''} (${teacherMap.get(selectedTeacherId)?.specialization || ''})`;
    if (printType === 'lab') return `جدول تشغيل: ${labMap.get(selectedLabId)?.nameAr || ''}`;
    if (printType === 'workshop') return `جدول تشغيل: ${wsMap.get(selectedWorkshopId)?.nameAr || ''}`;
    return '';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    exportTimetableToExcel(filteredSlots, teachers, subjects, classes, activeSchool, getSubTitle());
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const;

  return (
    <>
      {/* Configuration & Preview Modal (Hidden in actual print) */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="طباعة وتصدير الجدول الدراسي الأسبوعي (Print Studio)"
        subtitle="نسخة رسمية معتمدة A4 Landscape مخصصة للتعليق والطباعة والمشاركة"
        maxWidth="6xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-[#25A09F]" />
              الطباعة مجهزة بتنسيق A4 Landscape فائق الوضوح ومصممة بهوية EBDA EDU.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExcelExport}
                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-2 text-sm font-bold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة الجدول الآن (Print A4)
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الجدول المطلوب طباعته
              </label>
              <select
                value={printType}
                onChange={(e) => setPrintType(e.target.value as any)}
                className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              >
                <option value="school">جدول المدرسة الكامل (School View)</option>
                <option value="grade">جدول صف دراسي (Grade View)</option>
                <option value="class">جدول فصل دراسي (Class View)</option>
                <option value="teacher">جدول معلم (Teacher View)</option>
                <option value="lab">جدول معمل (Lab View)</option>
                <option value="workshop">جدول ورشة تدريبية (Workshop View)</option>
              </select>
            </div>

            {printType === 'grade' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الصف</label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => setSelectedGradeId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {grades.length === 0 ? (
                    <option value="">لا توجد صفوف دراسية مسجلة</option>
                  ) : (
                    grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameAr}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {printType === 'class' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الفصل</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {classes.length === 0 ? (
                    <option value="">لا توجد فصول دراسية مسجلة</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} ({c.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {printType === 'teacher' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر المعلم</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {teachers.length === 0 ? (
                    <option value="">لا يوجد معلمون مسجلون حالياً</option>
                  ) : (
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.specialization} ({t.targetWeeklyLessons} حصة)
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {printType === 'lab' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر المعمل</label>
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {labs.length === 0 ? (
                    <option value="">لا توجد معامل مسجلة حالياً</option>
                  ) : (
                    labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nameAr} ({l.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {printType === 'workshop' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الورشة</label>
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2"
                >
                  {workshops.length === 0 ? (
                    <option value="">لا توجد ورش هندسية مسجلة حالياً</option>
                  ) : (
                    workshops.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr} ({w.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <div className="p-2.5 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-800 w-full">
                📊 عدد الحصص المطابقة: <strong>{filteredSlots.length} حصة (ساعة تدريسية)</strong>
              </div>
            </div>
          </div>

          {/* Live Preview Paper */}
          <div className="border border-slate-300 rounded-2xl bg-white p-6 shadow-sm overflow-x-auto text-slate-900">
            {/* Formal Header with NTSS Authentic Logo */}
            <div className="border-b-2 border-[#00908E] pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-slate-50 border border-slate-200 rounded-xl">
                  <NTSSEmblem className="w-11 h-11" color="#00908E" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900 tracking-tight">NTSS</span>
                    <span className="text-xs font-bold text-[#00908E]">المدارس الوطنية للعلوم التقنية</span>
                  </div>
                  <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                    {activeSchool.nameAr}
                  </h1>
                </div>
              </div>
              <div className="text-left space-y-0.5 text-xs text-slate-600">
                <div className="font-bold text-slate-900">
                  العام الدراسي: {currentAcademicYear.name} ({currentAcademicYear.term})
                </div>
                <div>نوع الجدول: <span className="font-semibold text-[#F35024]">{getSubTitle()}</span></div>
                <div>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</div>
              </div>
            </div>

            {/* Timetable Matrix */}
            <table className="w-full border-collapse text-right text-xs">
              <thead>
                <tr className="bg-slate-100 border border-slate-300 text-slate-800 font-bold">
                  <th className="p-2 border border-slate-300 w-20 text-center">اليوم</th>
                  {timeSlots.map((ts) => (
                    <th key={ts.slotIndex} className="p-2 border border-slate-300 text-center">
                      <div className="font-bold">{ts.nameAr}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {ts.startTime} - {ts.endTime} (60 دقيقة)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  return (
                    <tr key={day} className="border border-slate-300 hover:bg-slate-50/50">
                      <td className="p-2.5 border border-slate-300 font-bold text-center bg-slate-50 text-slate-900">
                        {getArabicDayName(day)}
                      </td>
                      {timeSlots.map((ts) => {
                        const cellSlots = filteredSlots.filter(
                          (s) => s.dayOfWeek === day && s.slotIndex === ts.slotIndex
                        );

                        if (cellSlots.length === 0) {
                          return (
                            <td
                              key={ts.slotIndex}
                              className="p-2 border border-slate-300 text-center text-slate-300 bg-slate-50/20"
                            >
                              —
                            </td>
                          );
                        }

                        return (
                          <td key={ts.slotIndex} className="p-2 border border-slate-300 align-top">
                            <div className="space-y-1.5">
                              {cellSlots.map((slot) => {
                                const sub = subjectMap.get(slot.subjectId);
                                const tch = teacherMap.get(slot.teacherId);
                                const cl = classMap.get(slot.classId);

                                return (
                                  <div
                                    key={slot.id}
                                    className="p-2 rounded-lg border text-right leading-tight bg-[#25A09F]/5 border-[#25A09F]/30"
                                  >
                                    <div className="font-bold text-slate-900 text-[11px]">
                                      {sub?.nameAr || 'مادة'}
                                    </div>
                                    <div className="text-[10px] text-[#1E807F] font-semibold mt-0.5">
                                      {tch?.name || 'معلم'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                                      <span>فصل: {cl?.code || ''}</span>
                                      <span className="font-medium text-slate-700">
                                        {slot.roomName || 'القاعة'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Formal Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <strong>إدارة التشغيل والمتابعة الأكاديمية</strong> | مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية
              </div>
              <div className="font-mono text-slate-400">
                Generated by EBDA EDU System on: {new Date().toISOString()}
              </div>
              <div className="flex gap-8">
                <span>توقيع مدير العمليات: ...................</span>
                <span>اعتماد مدير المدرسة: ...................</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Pure Print-Only View Rendered during window.print() */}
      <div className="print-only print-container p-6 bg-white text-slate-900" dir="rtl">
        <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NTSSEmblem className="w-12 h-12" color="#000000" />
            <div>
              <div className="font-black text-lg">NTSS - المدارس الوطنية للعلوم التقنية</div>
              <h1 className="text-base font-bold">{activeSchool.nameAr}</h1>
              <p className="text-xs font-semibold">{getSubTitle()}</p>
            </div>
          </div>
          <div className="text-left text-xs space-y-0.5">
            <div>العام الدراسي: {currentAcademicYear.name} ({currentAcademicYear.term})</div>
            <div>مدة الحصة: 60 دقيقة كاملة</div>
            <div>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        <table className="w-full border-collapse text-right text-xs">
          <thead>
            <tr className="bg-slate-200 border border-black text-black font-bold">
              <th className="p-2 border border-black w-20 text-center">اليوم</th>
              {timeSlots.map((ts) => (
                <th key={ts.slotIndex} className="p-2 border border-black text-center">
                  <div>{ts.nameAr}</div>
                  <div className="text-[10px] font-normal">{ts.startTime} - {ts.endTime}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border border-black">
                <td className="p-2 border border-black font-bold text-center bg-slate-100">
                  {getArabicDayName(day)}
                </td>
                {timeSlots.map((ts) => {
                  const cellSlots = filteredSlots.filter(
                    (s) => s.dayOfWeek === day && s.slotIndex === ts.slotIndex
                  );
                  if (cellSlots.length === 0) {
                    return <td key={ts.slotIndex} className="p-2 border border-black text-center">—</td>;
                  }
                  return (
                    <td key={ts.slotIndex} className="p-1.5 border border-black align-top">
                      {cellSlots.map((s) => (
                        <div key={s.id} className="border-b last:border-0 border-slate-300 pb-1 mb-1 text-[10px]">
                          <div className="font-bold">{subjectMap.get(s.subjectId)?.nameAr}</div>
                          <div>المعلم: {teacherMap.get(s.teacherId)?.name}</div>
                          <div className="text-slate-600">فصل: {classMap.get(s.classId)?.code} | {s.roomName}</div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-black flex items-center justify-between text-xs">
          <div>EBDA EDU School Management System | النسخة الرسمية المعتمدة</div>
          <div>توقيع مدير العمليات: __________________</div>
          <div>توقيع مدير المدرسة: __________________</div>
        </div>
      </div>
    </>
  );
};
