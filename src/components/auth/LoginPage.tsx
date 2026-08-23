import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { NTSSLogo } from '../common/NTSSLogo';

export const LoginPage: React.FC = () => {
  const { login, schools, activeSchool, setActiveSchoolId } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = usernameOrEmail.trim();
    if (!cleanInput) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = login(cleanInput, password);
      setIsLoading(false);
      if (!success) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
      }
    }, 250);
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
          مدرسة ابدأ - للعلوم التقنية - بدر
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-teal-300/90">
          National Technical Science Schools • Academic Operations & Monitoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20 space-y-6">
          {/* School Badge */}
          <div className="p-3.5 bg-gradient-to-r from-teal-50/80 to-slate-50 border border-teal-200/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25A09F]/10 flex items-center justify-center text-[#25A09F] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">مدرسة ابدأ - للعلوم التقنية - بدر</div>
                <div className="text-[10px] text-teal-700 font-medium">National Technical Science Schools • Badr</div>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              معتمدة
            </Badge>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#25A09F]" />
              <span>تسجيل الدخول إلى النظام الموحد</span>
            </h2>
            <p className="text-xs text-slate-500">
              أدخل بيانات حسابك المعتمدة للوصول إلى لوحة المتابعة والتشغيل
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold leading-relaxed animate-fadeIn">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="mostafa@atef"
                  className="w-full text-xs font-bold bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pr-10 pl-3.5 py-3 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden transition"
                  dir="ltr"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-bold bg-slate-50 focus:bg-white border border-slate-300 rounded-xl pr-10 pl-10 py-3 focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden transition"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#25A09F] hover:bg-[#1E807F] disabled:opacity-70 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>جاري التحقق وتسجيل الدخول...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>تسجيل الدخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          {/* Secure Access Footnote */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed text-center">
            🔐 يتم التحقق من بيانات الدخول وتأكيد الصلاحيات المشفرة تلقائيًا. في حال نسيان كلمة المرور، يرجى مراجعة إدارة العمليات المدرسية.
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          EBDA EDU School Operations Management System • جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
