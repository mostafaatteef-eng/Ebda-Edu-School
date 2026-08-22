import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { NTSSLogo } from '../common/NTSSLogo';

export const LoginPage: React.FC = () => {
  const { login, allUsers, schools, activeSchool, setActiveSchoolId } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (!success) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setError(null);
    login(userEmail, userPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-right" dir="rtl">
      {/* Background glowing orbs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#25A09F]/15 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#F35024]/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        {/* Authentic NTSS Official Logo Card */}
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white shadow-2xl shadow-teal-900/30 mb-4 border border-white/40">
          <NTSSLogo variant="teal" size="md" layout="horizontal" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-teal-300/90">
          National Technical Science Schools • Academic Operations & Monitoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20 space-y-6">
          {/* Institution Selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#25A09F]" />
              <span className="text-xs font-bold text-slate-700">المؤسسة التعليمية:</span>
            </div>
            <select
              value={activeSchool.id}
              onChange={(e) => setActiveSchoolId(e.target.value)}
              className="text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Access Roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>تسجيل الدخول السريع (Direct Role Access)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Operations Manager Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('ops@ebda.edu.eg', 'admin123')}
                className="p-3.5 text-right bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-md flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25A09F] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs">مدير العمليات والتشغيل (Operations Manager)</div>
                    <div className="text-[11px] text-slate-300">صلاحيات كاملة • إدارة الجداول والأنصبة والتقارير</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* Teacher Quick Button (Dynamic if teacher accounts exist) */}
              {allUsers.filter((u) => u.role === 'teacher').length > 0 ? (
                allUsers
                  .filter((u) => u.role === 'teacher')
                  .slice(0, 2)
                  .map((tUser) => (
                    <button
                      key={tUser.id}
                      type="button"
                      onClick={() => handleQuickLogin(tUser.email || tUser.username, 'teacher123')}
                      className="p-3.5 text-right bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200 text-slate-900 rounded-2xl transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#25A09F]/20 text-[#1E807F] flex items-center justify-center font-bold">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900">بوابة المعلم ({tUser.name})</div>
                          <div className="text-[11px] text-slate-600">حصص اليوم • توثيق ما تم تدريسه • رفع الروابط</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#25A09F] group-hover:translate-x-[-2px] transition-transform" />
                    </button>
                  ))
              ) : null}

              {/* Parent Quick Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('parents@ebda.edu.eg', 'parents123')}
                className="p-3.5 text-right bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200 text-slate-900 rounded-2xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F35024]/20 text-[#F35024] flex items-center justify-center font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">بوابة أولياء الأمور الموحدة (Parents Portal)</div>
                    <div className="text-[11px] text-slate-600">متابعة ما تم تدريسه • روابط الملازم • الجداول الأسبوعية</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#F35024] group-hover:translate-x-[-2px] transition-transform" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-semibold">أو تسجيل الدخول المعتاد</span>
            </div>
          </div>

          {/* Custom Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ebda.edu.eg"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#25A09F] hover:bg-[#1E807F] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          EBDA EDU School Operations Management System • جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
