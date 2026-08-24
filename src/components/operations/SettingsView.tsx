import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserCog,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Coffee,
  Cloud,
  Globe,
  Database,
  ExternalLink,
  Loader2,
  CalendarDays,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { SchoolBreaksManager } from './SchoolBreaksManager';
import { DailyPeriodsManager } from './DailyPeriodsManager';
import { apiClient } from '../../services/apiClient';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    updateUser,
    activeSchool,
    currentAcademicYear,
    schools,
    teachers,
    breaks,
    timeSlots,
    subjects,
    timetableSlots,
    teachingRecords,
    resetToDefaultData,
    syncStatus,
    lastSyncTime,
    syncErrorMessage,
    googleSheetUrl,
    setGoogleSheetUrl,
    appsScriptUrl,
    setAppsScriptUrl,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncWithSheet,
    pushAllToSheet,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'periods' | 'breaks' | 'profile' | 'policies' | 'cloud'>('periods');

  // Cloud Sync / Apps Script states
  const [cloudApiUrl, setCloudApiUrl] = useState(appsScriptUrl);
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetUrl);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [pushingData, setPushingData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = cloudApiUrl.trim();
    const cleanSheet = sheetUrlInput.trim();
    setAppsScriptUrl(cleanUrl);
    setGoogleSheetUrl(cleanSheet);
    setConnectionStatus({
      tested: true,
      success: true,
      message: 'تم حفظ وتطبيق روابط Google Apps Script وشيت Google Sheets بنجاح.',
    });
  };

  const handleTestConnection = async () => {
    const cleanUrl = cloudApiUrl.trim();
    if (!cleanUrl) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'يرجى إدخال رابط Google Apps Script Web App أولاً.',
      });
      return;
    }
    setAppsScriptUrl(cleanUrl);
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const res = await apiClient.healthCheck();
      if (res.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'الاتصال ناجح ومستقر! النظام متصل ومربوط مباشرة مع Google Apps Script وشيت Google Sheets.',
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: res.error?.message || res.message || 'فشل الاتصال بالرابط، يرجى التأكد من نشر الـ Web App بصلاحية "Anyone".',
        });
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'حدث خطأ أثناء اختبار الاتصال بالسيرفر.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handlePullFromSheet = async () => {
    setSyncingData(true);
    try {
      const res = await syncWithSheet(false);
      setConnectionStatus({
        tested: true,
        success: res.success,
        message: res.message || (res.success ? 'تم جلب وتحديث كافة البيانات من Google Sheets بنجاح!' : 'فشل سحب البيانات من الشيت.'),
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'تعذر سحب البيانات من الشيت.',
      });
    } finally {
      setSyncingData(false);
    }
  };

  const handlePushToSheet = async () => {
    setPushingData(true);
    try {
      const res = await pushAllToSheet();
      setConnectionStatus({
        tested: true,
        success: res.success,
        message: res.message || (res.success ? 'تم تصدير وحفظ كافة بيانات النظام في Google Sheets بنجاح!' : 'فشل تصدير البيانات إلى الشيت.'),
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'تعذر إرسال البيانات إلى الشيت.',
      });
    } finally {
      setPushingData(false);
    }
  };

  // Find operations manager user (either current user or 'u-ops')
  const opsUser = allUsers.find((u) => u.role === 'operations_manager') || currentUser;

  // Profile Form States
  const [opsName, setOpsName] = useState(opsUser.name);
  const [opsUsername, setOpsUsername] = useState(opsUser.username);
  const [opsEmail, setOpsEmail] = useState(opsUser.email || '');
  const [opsPhone, setOpsPhone] = useState(opsUser.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Operations policies states
  const [lessonDuration, setLessonDuration] = useState(60);
  const [autoConflictDetection, setAutoConflictDetection] = useState(true);
  const [defaultParentVisibility, setDefaultParentVisibility] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveOpsProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    const cleanName = opsName.trim();
    const cleanUsername = opsUsername.trim().toLowerCase();

    if (!cleanName) {
      setProfileError('يرجى إدخال اسم مدير العمليات');
      return;
    }
    if (!cleanUsername) {
      setProfileError('يرجى إدخال اسم المستخدم لتسجيل الدخول');
      return;
    }

    const exists = allUsers.some((u) => u.id !== opsUser.id && u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setProfileError('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم مستخدم آخر');
      return;
    }

    updateUser(opsUser.id, {
      name: cleanName,
      username: cleanUsername,
      email: opsEmail.trim() || undefined,
      phone: opsPhone.trim() || undefined,
    });

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-right font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#25A09F]" />
            إعدادات التشغيل وتخصيص الحصص والمواعيد (Operations Settings)
          </h1>
          <Badge variant="primary" size="sm">
            EBDA EDU Standards
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          تعديل وتخصيص عدد الحصص اليومية، فترات الاستراحة والفسحة لمدرسة {activeSchool.nameAr}، بيانات الحساب، والربط السحابي مع Google Sheets.
        </p>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('periods')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'periods'
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>تخصيص الحصص والمواعيد اليومية ({timeSlots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('breaks')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'breaks'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>فترات الاستراحة والفسحة ({breaks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#F35024] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>حساب وبيانات مدير العمليات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'policies'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>السياسات والمعايير التشغيلية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'cloud'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>الربط السحابي (Google Apps Script API)</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Daily Periods & Time Slots */}
      {activeTab === 'periods' && <DailyPeriodsManager />}

      {/* Tab Content: Breaks Management */}
      {activeTab === 'breaks' && <SchoolBreaksManager />}

      {/* Tab Content: Operations Manager Profile Card */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F35024] text-white flex items-center justify-center font-black text-xs shadow-xs">
                {opsName.trim().slice(0, 2) || 'عم'}
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-[#F35024]" />
                  بيانات وحساب مدير العمليات والتشغيل (Operations Head)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعديل الاسم الرسمي، اسم الدخول، والبريد الإلكتروني وأرقام الاتصال
                </p>
              </div>
            </div>
            <Badge variant="alert" size="sm">
              Full Administrator
            </Badge>
          </div>

          {profileSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              تم تحديث بيانات مدير العمليات والتشغيل بنجاح، وتم تعميم التعديلات عبر النظام.
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveOpsProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم الكامل لمدير العمليات <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={opsName}
                  onChange={(e) => setOpsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition"
                  placeholder="أ/ مصطفى عاطف"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المستخدم للدخول (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={opsUsername}
                  onChange={(e) => setOpsUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                  dir="ltr"
                  placeholder="mostafa@atef"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المعتمد</label>
                <input
                  type="email"
                  value={opsEmail}
                  onChange={(e) => setOpsEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                  dir="ltr"
                  placeholder="mostafa@atef"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف / واتساب للتواصل</label>
                <input
                  type="tel"
                  value={opsPhone}
                  onChange={(e) => setOpsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                  dir="ltr"
                  placeholder="+20 100 000 0000"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                الحساب يحمل صلاحيات كاملة لإدارة الجداول، الأنصبة، والسياسات.
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F35024] hover:bg-[#d9441c] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات الحساب</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Operational Policies */}
      {activeTab === 'policies' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#25A09F]" />
                السياسات والمعايير التشغيلية المعتمدة
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                قواعد الحصص، محرك كشف التعارضات، وصلاحيات بوابة أولياء الأمور
              </p>
            </div>
          </div>

          {savedFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              تم حفظ السياسات والمعايير التشغيلية بنجاح.
            </div>
          )}

          <form onSubmit={handleSavePolicies} className="space-y-6">
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                1. معيار مدة الحصة الدراسية (Session Standard)
              </h3>
              <p className="text-xs text-slate-500">
                النظام يعتمد مدة 60 دقيقة لكل حصة دراسية وجلسة تدريب بالمعامل والورش.
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    مدة الحصة القياسية (Standard Duration)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    تُحسب جميع الأنصبة وسجلات الحضور بناءً على هذه القيمة
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-sm bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800">
                  <Clock className="w-4 h-4 text-[#25A09F]" />
                  <span>60 دقيقة</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                2. محرك كشف ومنع التعارضات (Conflict Engine)
              </h3>
              <p className="text-xs text-slate-500">
                فحص فوري لتضارب المواعيد بين المعلمين، الفصول، المعامل، والورش
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    تفعيل كشف التعارضات التلقائي ومنع الجدولة المزدوجة
                  </div>
                  <div className="text-[11px] text-slate-500">
                    يمنع حجز المعلم أو المعمل أو الفصل في أكثر من حصة بنفس التوقيت
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoConflictDetection}
                  onChange={(e) => setAutoConflictDetection(e.target.checked)}
                  className="w-4 h-4 accent-[#25A09F] rounded"
                />
              </div>
            </div>

            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                3. سياسات بوابة أولياء الأمور (Parent Portal Visibility)
              </h3>
              <p className="text-xs text-slate-500">
                إتاحة روابط المواد التعليمية والدروس لأولياء الأمور
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    إتاحة روابط المواد للأهالي تلقائيًا عند توثيق المعلم للحصة
                  </div>
                  <div className="text-[11px] text-slate-500">
                    يمكن لمدير العمليات إخفاء أو إظهار أي رابط يدويًا في أي وقت
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={defaultParentVisibility}
                  onChange={(e) => setDefaultParentVisibility(e.target.checked)}
                  className="w-4 h-4 accent-[#25A09F] rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية؟')) {
                    resetToDefaultData();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استعادة القيم الافتراضية</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وتطبيق الإعدادات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Cloud Google Apps Script & Google Sheets Two-Way Sync */}
      {activeTab === 'cloud' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  الربط والمزامنة اللحظية ثنائية الاتجاه (Google Sheets & Apps Script)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  أي تعديل في شيت الإكسيل يسمع فوراً في السيستم، وأي تعديل في السيستم يسمع فوراً داخل الشيت
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={syncStatus === 'synced' ? 'success' : syncStatus === 'syncing' ? 'info' : syncStatus === 'error' ? 'danger' : 'neutral'}
                size="sm"
                dot
              >
                {syncStatus === 'syncing'
                  ? 'جاري المزامنة...'
                  : syncStatus === 'synced'
                  ? 'متصل ومتزامن لحظياً'
                  : syncStatus === 'error'
                  ? 'خطأ في المزامنة'
                  : 'الوضع المحلي'}
              </Badge>
              {lastSyncTime && (
                <span className="text-[11px] font-bold text-slate-400">
                  آخر مزامنة: {lastSyncTime.toLocaleTimeString('ar-EG')}
                </span>
              )}
            </div>
          </div>

          {/* Connection Status Feedback */}
          {connectionStatus && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                connectionStatus.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {connectionStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{connectionStatus.message}</span>
            </div>
          )}

          {/* Real-Time Live Sync Status & Switch */}
          <div className="p-4 sm:p-5 bg-linear-to-r from-teal-50/70 to-indigo-50/70 border border-teal-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                <span className="relative flex h-2.5 w-2.5">
                  {autoSyncEnabled && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoSyncEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
                </span>
                <span>المزامنة التلقائية اللحظية (Real-Time Background Sync)</span>
              </div>
              <p className="text-[11px] text-slate-600 max-w-xl">
                عند تفعيل هذا الخيار، يقوم النظام بفحص شيت Google Sheets تلقائياً وبشكل دوري وتحديث الشاشات لحظياً عند وجود أي تعديل من طرف الشيت أو مستخدمين آخرين.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  autoSyncEnabled
                    ? 'bg-teal-600 text-white shadow-xs shadow-teal-500/30'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {autoSyncEnabled ? 'المزامنة التلقائية: مفعّلة' : 'المزامنة التلقائية: معطّلة'}
              </button>
            </div>
          </div>

          {/* Quick Action Sync Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePullFromSheet}
              disabled={syncingData}
              className="p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl flex items-center justify-between text-right transition group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  {syncingData ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpDown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-black text-teal-950">سحب التحديثات من الشيت الآن (Pull from Sheet)</div>
                  <div className="text-[11px] text-teal-700">جلب أحدث التعديلات والبيانات المضافة في Google Sheets</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePushToSheet}
              disabled={pushingData}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl flex items-center justify-between text-right transition group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  {pushingData ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-black text-indigo-950">تصدير وحفظ الكل في الشيت (Push All to Sheet)</div>
                  <div className="text-[11px] text-indigo-700">كتابة وتحديث جميع جداول النظام داخل شيت الإكسيل دفعة واحدة</div>
                </div>
              </div>
            </button>
          </div>

          {/* Cloud Database Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="text-[10px] text-slate-400 font-bold">الحصص اليومية النشطة</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{timeSlots.length} حصة</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="text-[10px] text-slate-400 font-bold">هيئة التدريس</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{teachers.length} معلم</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="text-[10px] text-slate-400 font-bold">الحصص المجدولة</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{timetableSlots.length} حصة</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div className="text-[10px] text-slate-400 font-bold">سجلات ما تم تدريسه</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{teachingRecords.length} سجل</div>
            </div>
          </div>

          <form onSubmit={handleSaveApiUrl} className="space-y-4">
            {/* Google Spreadsheet URL Input with Open link */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط شيت الإكسيل المربوط به (Google Sheet URL)
                </label>
                {sheetUrlInput && (
                  <a
                    href={sheetUrlInput}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                  >
                    <span>فتح الشيت في نافذة جديدة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-3.5 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                رابط الشيت المعتمد لقاعدة بيانات النظام المدرسي.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رابط تطبيق الويب (Google Apps Script Web App Exec URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={cloudApiUrl}
                  onChange={(e) => setCloudApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                يتم إرسال وقراءة البيانات إلى Google Sheets عبر الـ Web App المنشور بصلاحية: <strong>Execute as Me</strong> و <strong>Who has access: Anyone</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testingConnection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  <span>{testingConnection ? 'جاري الفحص...' : 'فحص الاتصال (Ping)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات الربط بالشيت</span>
                </button>
              </div>
            </div>
          </form>

          {/* Backend Info Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>أوراق العمل المربوطة لحظياً (Realtime Sheets):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Teachers', 'Subjects', 'Classes', 'SchoolBreaks', 'Labs', 'Workshops', 'TimetableSlots', 'TeachingRecords', 'SystemSettings'].map((sheet) => (
                <span key={sheet} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-mono font-bold">
                  {sheet}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              يحتوي نظام المزامنة على محرك ثنائي الاتجاه: يتم حفظ أي تغيير فوري في النظام داخل الشيت، ويتم سحب أي تعديل مباشر في الشيت وتطبيقه في واجهة المستخدم تلقائياً.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
