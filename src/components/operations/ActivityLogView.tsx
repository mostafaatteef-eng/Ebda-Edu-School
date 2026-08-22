import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const ActivityLogView: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              سجل العمليات والتدقيق الأكاديمي (Activity & Audit Log)
            </h1>
            <Badge variant="primary" size="sm">
              توثيق غير قابل للتعديل
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة جميع التعديلات، الإضافات، وحذف الحصص أو المحتوى التعليمي في المدرسة مع هوية المنفذ والوقت
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في سجل العمليات والمستخدمين..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
          >
            <option value="all">جميع الإجراءات</option>
            <option value="create">إنشاء وإضافة (Create)</option>
            <option value="update">تعديل (Update)</option>
            <option value="delete">حذف (Delete)</option>
            <option value="resolve_alert">معالجة تنبيه</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          إجمالي العمليات المسجلة: <strong>{filteredLogs.length} عملية</strong>
        </div>
      </div>

      {/* Logs Timeline / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full border-collapse text-right text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="p-3.5 border-l border-slate-800">التوقيت والتاريخ</th>
              <th className="p-3.5 border-l border-slate-800">المستخدم</th>
              <th className="p-3.5 border-l border-slate-800 text-center">نوع الإجراء</th>
              <th className="p-3.5 border-l border-slate-800">الكيان</th>
              <th className="p-3.5">تفاصيل الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  لا توجد عمليات مسجلة مطابقة.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString('ar-EG')}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#25A09F]" />
                      <span>{log.userName}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        log.action === 'create'
                          ? 'success'
                          : log.action === 'delete'
                          ? 'danger'
                          : log.action === 'update'
                          ? 'primary'
                          : 'info'
                      }
                      size="sm"
                    >
                      {log.action === 'create'
                        ? 'إضافة'
                        : log.action === 'delete'
                        ? 'حذف'
                        : log.action === 'update'
                        ? 'تعديل'
                        : 'معالجة'}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">
                    {log.entityType === 'timetable'
                      ? 'الجدول الأسبوعي'
                      : log.entityType === 'teaching_record'
                      ? 'سجل تدريس'
                      : log.entityType === 'teacher'
                      ? 'معلم'
                      : log.entityType === 'subject'
                      ? 'مادة'
                      : log.entityType}
                  </td>
                  <td className="p-3.5 text-slate-800 leading-relaxed font-medium">
                    {log.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
