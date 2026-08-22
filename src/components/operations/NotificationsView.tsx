import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  CalendarDays,
  CheckSquare,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Filter,
  Check,
  Sparkles,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SmartAlert, TimetableConflict } from '../../types';
import { Badge } from '../common/Badge';

interface NotificationsViewProps {
  onSelectTab: (tabId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectTab }) => {
  const { smartAlerts, conflicts, resolveAlert, teachers, timetableSlots } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'unresolved' | 'critical' | 'warning' | 'info'>('all');

  const unresolvedAlerts = smartAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = smartAlerts.filter((a) => a.resolved);

  const filteredAlerts = smartAlerts.filter((a) => {
    if (filterType === 'unresolved') return !a.resolved;
    if (filterType === 'critical') return a.severity === 'critical';
    if (filterType === 'warning') return a.severity === 'warning';
    if (filterType === 'info') return a.severity === 'info';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              مركز الإشعارات والتنبيهات التشغيلية
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F35024]/10 text-[#F35024] border border-[#F35024]/20">
              Operational Alerts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            متابعة فورية للتعارضات في الجداول، الحصص غير الموثقة، ونواقص الروابط والمواد التعليمية
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({smartAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('unresolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'unresolved'
                  ? 'bg-[#F35024] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تتطلب إجراء ({unresolvedAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'critical'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حرجة
            </button>
          </div>
        </div>
      </div>

      {/* Conflicts Highlight Banner if any exist */}
      {conflicts.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950">
                تنبيه حرج: تم رصد {conflicts.length} تعارض في الجدول الدراسي الأسبوعي
              </h3>
              <p className="text-xs text-rose-700 font-medium mt-0.5">
                يوجد تضارب في مواعيد المعلمين أو حجز القاعات والمعامل، يرجى مراجعة الجدول لضبط التوزيع.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('timetable')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs shrink-0 active:scale-98"
          >
            <span>فتح الجدول وحل التعارضات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alerts Stream List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-800">قائمة الإشعارات النشطة والسابقة</h2>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {filteredAlerts.length} تنبيه
          </span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="font-extrabold text-sm text-slate-800">كل شيء منتظم ومكتمل!</p>
            <p className="text-xs text-slate-400 mt-1">لا توجد تنبيهات أو معلقات تتطلب التدخل حالياً.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    alert.resolved
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : isCritical
                      ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                      : isWarning
                      ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                      : 'bg-teal-50/30 border-teal-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.resolved
                          ? 'bg-slate-200 text-slate-600'
                          : isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {alert.type === 'conflict' ? (
                        <AlertOctagon className="w-4 h-4" />
                      ) : alert.type === 'missing_record' ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : alert.type === 'missing_materials' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900">{alert.title}</h4>
                        {alert.resolved ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-200 text-slate-700">
                            تمت المعالجة
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800 font-black'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isCritical ? 'عاجل وحرج' : isWarning ? 'تحذير' : 'تنبيه'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp.slice(0, 10)} • {alert.timestamp.slice(11, 16)} GMT
                        </span>
                        <span>• الكيان: {alert.entityType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {alert.actionRoute && !alert.resolved && (
                      <button
                        type="button"
                        onClick={() => onSelectTab(alert.actionRoute!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-2xs"
                      >
                        <span>{alert.actionLabel || 'انتقال للمعالجة'}</span>
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}

                    {!alert.resolved ? (
                      <button
                        type="button"
                        onClick={() => resolveAlert(alert.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25A09F] hover:bg-[#1E807F] text-white text-xs font-bold transition shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تم الحل</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مكتمل
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
