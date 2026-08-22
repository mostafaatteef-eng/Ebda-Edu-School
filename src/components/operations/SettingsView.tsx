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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { SchoolBreaksManager } from './SchoolBreaksManager';

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
    resetToDefaultData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'breaks' | 'profile' | 'policies'>('breaks');

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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-right">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#25A09F]" />
            إعدادات التشغيل والجدول المدرسي (Operations Settings)
          </h1>
          <Badge variant="primary" size="sm">
            EBDA EDU Standards
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          تكوين فترات الاستراحة والفسحة المعتمدة لمدرسة {activeSchool.nameAr}، تعديل بيانات مدير العمليات، والمعايير التشغيلية
        </p>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
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
                ? 'bg-[#25A09F] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>السياسات والمعايير التشغيلية</span>
          </button>
        </div>
      </div>

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
                  placeholder="أ/ شريف علام"
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
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني المهني
                </label>
                <input
                  type="email"
                  value={opsEmail}
                  onChange={(e) => setOpsEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                  dir="ltr"
                  placeholder="operations.head@ebda-edu.eg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف / الجوال المباشر
                </label>
                <input
                  type="tel"
                  value={opsPhone}
                  onChange={(e) => setOpsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F] transition text-left"
                  dir="ltr"
                  placeholder="01000000001"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F35024] hover:bg-[#D8431C] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات مدير العمليات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Operational Policies */}
      {activeTab === 'policies' && (
        <>
          {savedFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              تم حفظ وتطبيق السياسات التشغيلية بنجاح.
            </div>
          )}

          <form onSubmit={handleSavePolicies} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            {/* Core Operational Standard (Strict 60-min rule) */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    1. قاعدة الجلسات التدريسية (60-Minute Session Rule)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تعتمد مدارس ابدأ التكنولوجية نظام الحصص ذات الـ 60 دقيقة كاملة لضمان التطبيق العملي
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  إلزامي
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  مدة الحصة القياسية في جميع الجداول:
                </div>
                <div className="font-extrabold text-sm text-[#25A09F] font-mono">
                  60 دقيقة (1.0 ساعة تدريسية)
                </div>
              </div>
            </div>

            {/* Real-time Conflict Engine */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                2. محرك كشف التعارضات التلقائي (Conflict Detection Engine)
              </h3>
              <p className="text-xs text-slate-500">
                فحص لحظي يمنع تكرار تكليف المعلم، حجز نفس الفصل أو المعمل في نفس التوقيت، أو التداخل مع فترات الاستراحة
              </p>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    تفعيل كاشف التعارضات التلقائي والتنبيه الفوري
                  </div>
                  <div className="text-[11px] text-slate-500">
                    إصدار تنبيه فوري واقتراح حلول تصحيحية لمدير العمليات
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

            {/* Parent Portal Policies */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                3. سياسات بوابة أولياء الأمور (Parent Portal Visibility)
              </h3>
              <p className="text-xs text-slate-500">
                تحديد الصلاحيات الافتراضية لإتاحة روابط المواد التعليمية لأولياء الأمور
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات التجريبية لقيم البداية؟')) {
                    resetToDefaultData();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة ضبط البيانات التجريبية</span>
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
        </>
      )}
    </div>
  );
};
