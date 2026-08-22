import React, { useState } from 'react';
import {
  Building2,
  Bell,
  Search,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';
import { NTSSEmblem, NTSSLogo } from './NTSSLogo';

interface HeaderNavbarProps {
  onOpenPrintModal?: () => void;
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onOpenPrintModal,
  onSelectTab,
}) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    logout,
    schools,
    activeSchool,
    setActiveSchoolId,
    conflicts,
    smartAlerts,
    currentAcademicYear,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSchoolMenu, setShowSchoolMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unresolvedAlerts = smartAlerts.filter((a) => !a.resolved);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs no-print-area">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Left Side: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <NTSSEmblem className="w-8 h-8" color="#00908E" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">NTSS</span>
                <span className="text-[11px] font-bold text-[#00908E]">المدارس الوطنية للعلوم التقنية</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {activeSchool.nameAr} • العام الدراسي {currentAcademicYear.name}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden lg:block" />

          {/* Multi-School Switcher Dropdown */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setShowSchoolMenu(!showSchoolMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-[#25A09F]" />
              <span>{activeSchool.nameAr}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSchoolMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  اختر المؤسسة التعليمية
                </div>
                {schools.map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      setActiveSchoolId(school.id);
                      setShowSchoolMenu(false);
                    }}
                    className={`w-full text-right px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      school.id === activeSchool.id
                        ? 'bg-[#25A09F]/10 text-[#1E807F] font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{school.nameAr}</div>
                      <div className="text-[10px] text-slate-400">{school.city} • {school.code}</div>
                    </div>
                    {school.id === activeSchool.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#25A09F] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-xs text-slate-500 w-64 border border-slate-200/60">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث سريع في النظام والجداول..."
            className="bg-transparent border-none text-xs w-full text-slate-700 focus:outline-hidden"
          />
        </div>

        {/* Right Side: Quick Role Switcher, Alerts, Print, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Action Button */}
          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('timetable')}
              className="bg-[#25A09F] hover:bg-[#1E807F] text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>الجدول المدرسي</span>
            </button>
          )}

          {/* Quick Print Trigger */}
          {onOpenPrintModal && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
            >
              <span>طباعة</span>
            </button>
          )}

          {/* Conflict Live Warning Badge */}
          {conflicts.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('timetable')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all animate-pulse"
              title="انقر لفحص التعارضات في الجدول"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{conflicts.length}</span>
            </button>
          )}

          {/* Smart Alerts Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="التنبيهات"
            >
              <Bell className="w-5 h-5" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F35024] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#25A09F]" />
                    <span>التنبيهات التشغيلية الذكية</span>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {unresolvedAlerts.length} معلق
                  </Badge>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 my-1">
                  {unresolvedAlerts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      لا توجد تنبيهات معلقة حالياً، جميع العمليات منضبطة.
                    </div>
                  ) : (
                    unresolvedAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 text-right hover:bg-slate-50 transition-colors rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[11px] font-bold ${
                              alert.severity === 'high'
                                ? 'text-rose-600'
                                : alert.severity === 'medium'
                                ? 'text-amber-700'
                                : 'text-sky-700'
                            }`}
                          >
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">الآن</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {onSelectTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      onSelectTab('dashboard');
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-[#25A09F] hover:bg-[#25A09F]/5 rounded-xl transition-colors border-t border-slate-100"
                  >
                    عرض كل التنبيهات وإدارتها في لوحة التحكم ←
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Quick User / Role Switcher Demo Helper */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100/80 transition-all border border-slate-200/80 bg-white"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                  currentUser.role === 'operations_manager'
                    ? 'bg-[#F35024] text-white border-[#F35024]/40'
                    : currentUser.role === 'teacher'
                    ? 'bg-teal-50 text-[#1E807F] border-teal-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentUser.name.trim().slice(0, 2)}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
                <div className="text-[10px] font-semibold text-[#25A09F] mt-0.5">
                  {currentUser.role === 'operations_manager'
                    ? 'مدير العمليات (Full Access)'
                    : currentUser.role === 'teacher'
                    ? 'بوابة المعلم'
                    : 'بوابة أولياء الأمور'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>التبديل بين المستخدمين (Demo Accounts)</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>

                <div className="divide-y divide-slate-100 my-1">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        switchUser(user.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        user.id === currentUser.id
                          ? 'bg-[#25A09F]/10 text-[#1E807F] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border ${
                            user.role === 'operations_manager'
                              ? 'bg-[#F35024] text-white border-[#F35024]/40'
                              : user.role === 'teacher'
                              ? 'bg-teal-50 text-[#1E807F] border-teal-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {user.name.trim().slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {user.role === 'operations_manager'
                              ? 'مدير العمليات'
                              : user.role === 'teacher'
                              ? 'معلم'
                              : 'حساب أولياء الأمور الموحد'}
                          </div>
                        </div>
                      </div>
                      {user.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#25A09F]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
