import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  FlaskConical,
  FileText,
  FileSpreadsheet,
  Users,
  Settings,
  History,
  GraduationCap,
  BookOpen,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Printer,
  Sparkles,
  Building2,
  Menu,
  X,
  UserPlus,
  Edit2,
  UserCog,
  Save,
  CheckCircle2,
  AlertCircle,
  Link,
  Cloud,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NTSSEmblem } from './NTSSLogo';
import { UserRole } from '../../types';
import { Modal } from './Modal';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenPrintModal?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  labelEn?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'primary' | 'alert' | 'danger' | 'neutral';
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenPrintModal,
  mobileOpen,
  onCloseMobile,
}) => {
  const {
    currentUser,
    allUsers,
    updateUser,
    logout,
    activeSchool,
    conflicts,
    smartAlerts,
    settings,
    syncStatus,
    lastSyncTime,
    googleSheetUrl,
    syncWithSheet,
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSyncingFromSidebar, setIsSyncingFromSidebar] = useState(false);

  // Profile Edit Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(currentUser.name);
    setEditUsername(currentUser.username);
    setEditEmail(currentUser.email || '');
    setEditPhone(currentUser.phone || '');
    setEditError('');
    setEditSuccess(false);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    const cleanName = editName.trim();
    const cleanUsername = editUsername.trim().toLowerCase();

    if (!cleanName) {
      setEditError('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!cleanUsername) {
      setEditError('يرجى إدخال اسم المستخدم');
      return;
    }

    // Check if username is taken by another user
    const usernameTaken = allUsers.some((u) => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername);
    if (usernameTaken) {
      setEditError('اسم المستخدم مستخدم بالفعل في حساب آخر، يرجى اختيار اسم مستخدم مختلف');
      return;
    }

    updateUser(currentUser.id, {
      name: cleanName,
      username: cleanUsername,
      email: editEmail.trim() || undefined,
      phone: editPhone.trim() || undefined,
    });

    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setIsEditProfileOpen(false);
    }, 1200);
  };

  const unresolvedAlertsCount = smartAlerts.filter((a) => !a.resolved).length;

  // Operations Manager Menu Items
  const opsMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة العمليات والتحكم',
      labelEn: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'school_structure',
      label: 'الهيكل المدرسي والفصول',
      labelEn: 'School Structure',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'teachers',
      label: 'المعلمون والأنصبة',
      labelEn: 'Teachers',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'subjects',
      label: 'المواد والمناهج الدراسية',
      labelEn: 'Subjects',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'timetable',
      label: 'الجدول الدراسي الأسبوعي',
      labelEn: 'Timetable',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: conflicts.length > 0 ? `${conflicts.length} تعارض` : undefined,
      badgeVariant: 'danger',
    },
    {
      id: 'teaching_progress',
      label: 'متابعة ما تم تدريسه',
      labelEn: 'Teaching Progress',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'labs_workshops',
      label: 'المعامل والورش الهندسية',
      labelEn: 'Labs & Workshops',
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: 'users_access',
      label: 'المستخدمون والصلاحيات',
      labelEn: 'Users & Access',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'التقارير المعتمدة والطباعة',
      labelEn: 'Reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'لوحة التحليلات الذكية',
      labelEn: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'الإشعارات والتنبيهات',
      labelEn: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : undefined,
      badgeVariant: 'alert',
    },
    {
      id: 'excel_studio',
      label: 'استيراد وتصدير Excel',
      labelEn: 'Excel Studio',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'إعدادات التشغيل والسياسات',
      labelEn: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Teacher Portal Menu Items
  const teacherMenuItems: MenuItem[] = [
    {
      id: 'teacher_dashboard',
      label: 'الرئيسية وحصص اليوم',
      labelEn: 'Teacher Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'teacher_schedule',
      label: 'جدولي الأسبوعي (Calendar)',
      labelEn: 'My Schedule',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'teacher_workload',
      label: 'نصابي التدريسي (60 دقيقة)',
      labelEn: 'My Load',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'teacher_record',
      label: 'تسجيل ما تم تدريسه والملازم',
      labelEn: 'Record Lesson',
      icon: <CheckSquare className="w-4 h-4" />,
      highlight: true,
    },
    {
      id: 'teacher_materials',
      label: 'سجل المواد والمرفقات',
      labelEn: 'Lesson Materials',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'الإشعارات والتعارضات',
      labelEn: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  // Parent Portal Menu Items
  const parentMenuItems: MenuItem[] = [
    {
      id: 'parent_dashboard',
      label: 'لوحة متابعة أولياء الأمور',
      labelEn: 'Parent Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'parent_schedule',
      label: 'الجدول الدراسي للأبناء',
      labelEn: 'Weekly Schedule',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'parent_taught',
      label: 'ما تم تدريسه وروابط الملازم',
      labelEn: 'Delivered Lessons',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'parent_materials',
      label: 'سجل الملازم وروابط المحتوى',
      labelEn: 'Lesson Materials',
      icon: <Link className="w-4 h-4" />,
    },
    {
      id: 'parent_summary',
      label: 'ملخص التعلم الأسبوعي',
      labelEn: 'Weekly Learning',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  const currentItems =
    currentUser.role === 'operations_manager'
      ? opsMenuItems
      : currentUser.role === 'teacher'
      ? teacherMenuItems
      : parentMenuItems;

  const handleSelect = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 lg:static w-72 shrink-0 bg-[#25A09F] text-white flex flex-col justify-between border-l border-white/10 no-print-area shadow-2xl transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header with Authentic NTSS Logo */}
          <div className="p-4 border-b border-white/10 bg-black/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 p-1">
                <NTSSEmblem className="w-8 h-8" color="#00908E" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-white leading-none">
                    EBDA EDU
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 font-black text-white tracking-widest uppercase">
                    Badr
                  </span>
                </div>
                <div className="text-[10px] text-white/95 font-black mt-1 truncate">
                  مدرسة ابدأ – بدر للعلوم والتكنولوجيا
                </div>
                <div className="text-[9px] text-teal-100 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>نظام العمليات والتشغيل المعتمد</span>
                </div>
              </div>
            </div>

            {/* Close Button on Mobile */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 pt-1 pb-2 flex items-center justify-between text-[10px] font-black text-white/70 tracking-wider uppercase">
              <span>
                {currentUser.role === 'operations_manager'
                  ? 'لوحة تحكم العمليات (Operations)'
                  : currentUser.role === 'teacher'
                  ? 'بوابة المعلم (Teacher Portal)'
                  : 'بوابة المتابعة (Parents Portal)'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white">
                60 Min/Lesson
              </span>
            </div>

            {currentItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#1E807F] shadow-md font-black ring-2 ring-white/30'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  } ${item.highlight ? 'border border-amber-300/40 bg-amber-400/20' : ''}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`${isActive ? 'text-[#25A09F]' : 'text-white/80'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs ${
                        item.badgeVariant === 'alert'
                          ? 'bg-[#F35024] text-white'
                          : item.badgeVariant === 'danger'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Profile at Bottom of Sidebar */}
        <div className="p-3 border-t border-white/10 bg-black/15 space-y-2">
          {/* Live Google Sheet Realtime Sync Card */}
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-right overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-white truncate">Google Sheets</span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <div className="text-[9px] text-teal-200 truncate">
                  {syncStatus === 'syncing' ? 'جاري المزامنة...' : 'مزامنة لحظية ثنائية'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  setIsSyncingFromSidebar(true);
                  await syncWithSheet(false);
                  setIsSyncingFromSidebar(false);
                }}
                disabled={isSyncingFromSidebar || syncStatus === 'syncing'}
                title="مزامنة وسحب التحديثات من الشيت الآن"
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-white transition cursor-pointer disabled:opacity-50"
              >
                {isSyncingFromSidebar || syncStatus === 'syncing' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </button>

              {googleSheetUrl && (
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="فتح شيت الإكسيل في Google Sheets"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-white transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* User Profile Summary Card */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                  currentUser.role === 'operations_manager'
                    ? 'bg-[#F35024] text-white border-[#F35024]/30'
                    : currentUser.role === 'teacher'
                    ? 'bg-teal-700 text-white border-teal-500/40'
                    : 'bg-blue-700 text-white border-blue-500/40'
                }`}
              >
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="overflow-hidden text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate">{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-white/80 font-bold truncate">
                  {currentUser.role === 'operations_manager'
                    ? 'مدير العمليات والتشغيل'
                    : currentUser.role === 'teacher'
                    ? 'عضو هيئة التدريس'
                    : 'بوابة أولياء الأمور'}
                </div>
                <div className="text-[9px] text-teal-200 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>● Online متصل</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={handleOpenEditProfile}
                title="تعديل بيانات الحساب"
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1 px-1">
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="تعديل بيانات مدير العمليات"
            >
              <UserCog className="w-3.5 h-3.5 text-teal-200" />
              <span>تعديل بياناتي</span>
            </button>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="طباعة الجدول A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                logout();
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="تعديل بيانات الحساب (User Profile)"
        subtitle={`تعديل المعلومات الشخصية وبيانات الاتصال الخاصة بالحساب الحالي (${currentUser.role === 'operations_manager' ? 'مدير العمليات والتشغيل' : currentUser.role})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-right">
          {editSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم تحديث وحفظ بيانات الحساب بنجاح!</span>
            </div>
          )}

          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                currentUser.role === 'operations_manager' ? 'bg-[#F35024]' : 'bg-[#25A09F]'
              }`}
            >
              {editName.trim().slice(0, 2) || currentUser.name.slice(0, 2)}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-xs">
                {currentUser.role === 'operations_manager' ? 'حساب مدير العمليات والتشغيل' : currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {currentUser.id}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الاسم الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#25A09F]"
              placeholder="مثال: أ/ شريف علام"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المستخدم (Username) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] text-left"
              dir="ltr"
              placeholder="admin"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">يُستخدم لتسجيل الدخول إلى النظام</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المهني</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] text-left"
              dir="ltr"
              placeholder="operations.head@ebda-edu.eg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف / الجوال</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] text-left"
              dir="ltr"
              placeholder="01000000001"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-[#25A09F] hover:bg-[#1E807F] rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
