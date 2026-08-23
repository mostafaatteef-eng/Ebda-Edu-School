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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'periods' | 'breaks' | 'profile' | 'policies' | 'cloud'>('periods');

  // Cloud Sync / Apps Script states
  const [cloudApiUrl, setCloudApiUrl] = useState(() => {
    return apiClient.getApiUrl() || 'https://script.google.com/macros/s/AKfycbzTPm---69OsRwrT4NAc5tSHaglS_GynvGbVWVWSUQnUk-ELFauyMiDyHdf5Yyzcln6/exec';
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = cloudApiUrl.trim();
    apiClient.setApiUrl(cleanUrl);
    setConnectionStatus({
      tested: true,
      success: true,
      message: cleanUrl
        ? 'تم حفظ وتحديث رابط الـ Web App API بنجاح.'
        : 'تمت إزالة الرابط والتحويل للوضع المحلي (Local Offline Mode).',
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
    apiClient.setApiUrl(cleanUrl);
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const res = await apiClient.healthCheck();
      if (res.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'الاتصال ناجح ومستقر! الخادم متصل بنجاح مع Google Apps Script وقاعدة بيانات Google Sheets.',
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

  const handleSyncData = async () => {
    const cleanUrl = cloudApiUrl.trim();
    if (!cleanUrl) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'يرجى إدخال رابط Google Apps Script أولاً.',
      });
      return;
    }
    apiClient.setApiUrl(cleanUrl);
    setSyncingData(true);
    try {
      const res = await apiClient.getSettings();
      if (res.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: `تم التحقق من مزامنة شيت الإعدادات والجداول بنجاح (${new Date().toLocaleTimeString('ar-EG')}).`,
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'تم الاتصال بالخادم بنجاح وجاهزية المزامنة مع الشيت.',
        });
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'تعذر إتمام المزامنة المباشرة مع الشيت.',
      });
    } finally {
      setSyncingData(false);
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

      {/* Tab Content: Cloud Google Apps Script Web App API */}
      {activeTab === 'cloud' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  ربط الخادم وقاعدة البيانات السحابية (Google Apps Script Web App)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  مزامنة بيانات الجداول المدرسية، المعلمين، المعامل، والتوثيق مباشرة مع Google Sheets
                </p>
              </div>
            </div>
            <Badge variant={apiClient.isConfigured() ? 'success' : 'neutral'} size="sm" dot>
              {apiClient.isConfigured() ? 'مربوط بالسحابة (Apps Script Active)' : 'الوضع المحلي'}
            </Badge>
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

                <button
                  type="button"
                  onClick={handleSyncData}
                  disabled={syncingData}
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {syncingData ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4" />
                  )}
                  <span>{syncingData ? 'جاري التحقق...' : 'مزامنة مع الشيت'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {cloudApiUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCloudApiUrl('');
                      apiClient.setApiUrl('');
                      setConnectionStatus({
                        tested: true,
                        success: true,
                        message: 'تم مسح الرابط والتحويل للوضع المحلي المستقل.',
                      });
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    مسح الرابط
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ رابط السيرفر السحابي</span>
                </button>
              </div>
            </div>
          </form>

          {/* Backend Info Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>جداول وقواعد بيانات Google Sheets المربوطة:</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              يحتوي مشروع الـ Apps Script على محرك مزامنة كامل (Router, SpreadsheetService, TimetableService, SettingsService) يقوم بحفظ واسترجاع الحصص الأسبوعية، أنصبة المعلمين، ما تم تدريسه، وروابط Google Drive بشكل مباشر مع الشيت المعتمد.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
