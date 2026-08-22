import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Lock,
  UserCheck,
  UserX,
  History,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Calendar,
  Layers,
  Settings,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, PermissionKey, PermissionDefinition, Teacher } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { NTSSEmblem } from '../common/NTSSLogo';

export const UsersAndAccessView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    teachers,
    roles,
    permissions,
    activityLogs,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    resetParentPassword,
    changeUsername,
    updateRolePermissions,
    hasPermission,
  } = useApp();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'activity'>('users');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Selected role for permission matrix
  const [selectedRoleId, setSelectedRoleId] = useState<UserRole>('teacher');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Active user being modified
  const [activeSelectedUser, setActiveSelectedUser] = useState<User | null>(null);

  // Form states for adding/editing user
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('teacher');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'disabled'>('active');
  const [formError, setFormError] = useState<string>('');

  // Password reset state
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Change username state
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [usernameChangeError, setUsernameChangeError] = useState('');

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.includes(searchQuery));

      const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
      const matchStatus = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Statistics
  const totalUsers = allUsers.length;
  const activeCount = allUsers.filter((u) => u.status === 'active').length;
  const opsCount = allUsers.filter((u) => u.role === 'operations_manager').length;
  const teachersCount = allUsers.filter((u) => u.role === 'teacher').length;
  const parentsCount = allUsers.filter((u) => u.role === 'parent').length;

  // Map teachers by ID
  const teacherMap = useMemo(() => {
    return new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  }, [teachers]);

  // Handlers for Add User
  const handleOpenAddUser = () => {
    setFormName('');
    setFormUsername('');
    setFormRole('teacher');
    setFormEmail('');
    setFormPhone('');
    setFormTeacherId('');
    setFormStatus('active');
    setFormError('');
    setIsAddUserModalOpen(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = formUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setFormError('يرجى إدخال اسم المستخدم');
      return;
    }
    if (!formName.trim()) {
      setFormError('يرجى إدخال الاسم الكامل للمستخدم');
      return;
    }

    const usernameExists = allUsers.some((u) => u.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      setFormError('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم مستخدم آخر');
      return;
    }

    addUser({
      username: cleanUsername,
      name: formName.trim(),
      role: formRole,
      email: formEmail.trim() || undefined,
      phone: formPhone.trim() || undefined,
      teacherId: formRole === 'teacher' ? formTeacherId || undefined : undefined,
      status: formStatus,
    });

    setIsAddUserModalOpen(false);
  };

  // Handlers for Edit User
  const handleOpenEditUser = (u: User) => {
    setActiveSelectedUser(u);
    setFormName(u.name);
    setFormUsername(u.username);
    setFormRole(u.role);
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormTeacherId(u.teacherId || '');
    setFormStatus(u.status);
    setFormError('');
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedUser) return;
    setFormError('');

    if (!formName.trim()) {
      setFormError('يرجى إدخال الاسم الكامل للمستخدم');
      return;
    }

    updateUser(activeSelectedUser.id, {
      name: formName.trim(),
      role: formRole,
      email: formEmail.trim() || undefined,
      phone: formPhone.trim() || undefined,
      teacherId: formRole === 'teacher' ? formTeacherId || undefined : undefined,
      status: formStatus,
    });

    setIsEditUserModalOpen(false);
  };

  // Handlers for Password Reset
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');

  const handleOpenResetPassword = (u: User) => {
    setActiveSelectedUser(u);
    setCustomPasswordInput('');
    setResetError('');
    if (u.role === 'parent') {
      const res = resetParentPassword(u.id);
      if (res.success && res.newPassword) {
        setGeneratedPassword(res.newPassword);
      } else {
        setGeneratedPassword(resetUserPassword(u.id));
      }
    } else {
      const newPass = resetUserPassword(u.id);
      setGeneratedPassword(newPass);
    }
    setCopiedPassword(false);
    setIsResetPasswordModalOpen(true);
  };

  const handleApplyCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedUser) return;
    setResetError('');
    if (activeSelectedUser.role === 'parent') {
      const res = resetParentPassword(activeSelectedUser.id, customPasswordInput);
      if (!res.success) {
        setResetError(res.error || 'فشل تحديث كلمة المرور');
        return;
      }
      setGeneratedPassword(customPasswordInput);
      setCustomPasswordInput('');
    } else {
      updateUser(activeSelectedUser.id, {
        password: customPasswordInput,
        needsPasswordChange: true,
      });
      setGeneratedPassword(customPasswordInput);
      setCustomPasswordInput('');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyAllCredentials = () => {
    if (!activeSelectedUser) return;
    const credText = `بيانات الدخول إلى منصة مدرسة إبدأ - بدر:
اسم المستخدم: ${activeSelectedUser.username}
كلمة المرور: ${generatedPassword}
الدور: ${activeSelectedUser.role === 'parent' ? 'ولي أمر' : activeSelectedUser.role === 'teacher' ? 'معلم' : 'مدير عمليات'}`;
    navigator.clipboard.writeText(credText);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Handlers for Change Username
  const handleOpenChangeUsername = (u: User) => {
    setActiveSelectedUser(u);
    setNewUsernameInput(u.username);
    setUsernameChangeError('');
    setIsChangeUsernameModalOpen(true);
  };

  const handleSaveChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedUser) return;
    setUsernameChangeError('');

    const res = changeUsername(activeSelectedUser.id, newUsernameInput);
    if (!res.success) {
      setUsernameChangeError(res.message || 'فشل تحديث اسم المستخدم');
      return;
    }

    setIsChangeUsernameModalOpen(false);
  };

  // Handlers for User Details
  const handleOpenUserDetails = (u: User) => {
    setActiveSelectedUser(u);
    setIsUserDetailsModalOpen(true);
  };

  // Handlers for Role Permissions toggling
  const currentRoleDefinition = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  const handleTogglePermission = (key: PermissionKey) => {
    if (!currentRoleDefinition) return;
    const currentPerms = currentRoleDefinition.permissions;
    const exists = currentPerms.includes(key);
    const updated = exists
      ? currentPerms.filter((p) => p !== key)
      : [...currentPerms, key];

    updateRolePermissions(selectedRoleId, updated);
  };

  const handleGrantAllPermissions = () => {
    updateRolePermissions(
      selectedRoleId,
      permissions.map((p) => p.key)
    );
  };

  const handleRevokeAllPermissions = () => {
    updateRolePermissions(selectedRoleId, ['view_dashboard']);
  };

  // Export Users List
  const handleExportUsersCSV = () => {
    const headers = ['المعرف', 'الاسم الكامل', 'اسم المستخدم', 'الدور', 'البريد الإلكتروني', 'الهاتف', 'الملف المرتبط', 'الحالة', 'تاريخ الإنشاء', 'آخر تسجيل دخول'];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.username,
      u.role === 'operations_manager' ? 'مدير العمليات' : u.role === 'teacher' ? 'معلم' : 'ولي أمر',
      u.email || '-',
      u.phone || '-',
      u.teacherId ? teacherMap.get(u.teacherId)?.name || u.teacherId : '-',
      u.status === 'active' ? 'نشط' : 'معطل',
      u.createdAt,
      u.lastLogin || 'لم يسجل دخول',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EBDA_Badr_Users_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Permission Categories Mapping
  const permissionCategories = [
    { key: 'operations', labelAr: 'العمليات والهيكل المدرسي (Operations & Structure)' },
    { key: 'resources', labelAr: 'المعامل والورش الهندسية (Labs & Workshops)' },
    { key: 'academic', labelAr: 'العملية التعليمية والتوثيق (Academic & Teaching)' },
    { key: 'system', labelAr: 'إدارة النظام والمستخدمين (System & Security)' },
    { key: 'reporting', labelAr: 'التقارير وتصدير البيانات (Reports & Data)' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Internal Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              المستخدمون والصلاحيات
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#25A09F]/10 text-[#25A09F] border border-[#25A09F]/20">
              Users & Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            إدارة حسابات مستخدمي النظام، ربط الحسابات بهيئة التدريس، ومصفوفة الصلاحيات والأمان
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportUsersCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير كشف المستخدمين (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25A09F] hover:bg-[#1E807F] text-white text-xs font-bold transition shadow-md shadow-teal-700/10 active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400">إجمالي الحسابات المسجلة</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
            <p className="text-[10px] text-teal-600 font-bold mt-0.5">{activeCount} حساب نشط</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#25A09F] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400">إدارة العمليات (Admin)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{opsCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">تحكم كامل بالنظام</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400">حسابات المعلمين</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{teachersCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">مرتبطة بأكواد التدريس</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400">حساب أولياء الأمور</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{parentsCount}</p>
            <p className="text-[10px] text-indigo-600 font-bold mt-0.5">بوابة المتابعة الموحدة</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-[#25A09F] text-[#25A09F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>حسابات المستخدمين (All Users)</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 font-mono">
            {filteredUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'roles'
              ? 'border-[#25A09F] text-[#25A09F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>الأدوار ومصفوفة الصلاحيات (Roles & Permissions)</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 font-mono">
            {roles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition ${
            activeTab === 'activity'
              ? 'border-[#25A09F] text-[#25A09F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل نشاط المستخدمين (User Activity Log)</span>
        </button>
      </div>

      {/* TAB 1: ALL USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="البحث بالاسم، اسم المستخدم، البريد، أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F]/30 focus:border-[#25A09F]"
              />
            </div>

            {/* Role & Status Dropdown Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>تصفية حسب:</span>
              </div>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F]/30"
              >
                <option value="all">جميع الأدوار</option>
                <option value="operations_manager">مدير العمليات (Operations)</option>
                <option value="teacher">هيئة التدريس (Teacher)</option>
                <option value="parent">أولياء الأمور (Parents)</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#25A09F]/30"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">الحسابات النشطة (Active)</option>
                <option value="disabled">الحسابات المعطلة (Disabled)</option>
              </select>

              {(searchQuery || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRoleFilter('all');
                    setSelectedStatusFilter('all');
                  }}
                  className="text-xs text-[#F35024] hover:underline font-bold px-2 py-1"
                >
                  إعادة ضبط
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">المستخدم (User)</th>
                  <th className="py-3.5 px-4">الدور الوظيفي</th>
                  <th className="py-3.5 px-4">الملف المرتبط</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">آخر تسجيل دخول</th>
                  <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-sm">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
                      <p className="text-xs mt-1">جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const linkedTeacher = u.teacherId ? teacherMap.get(u.teacherId) : null;
                    const isSelf = u.id === currentUser.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                                u.role === 'operations_manager'
                                  ? 'bg-[#F35024] text-white border-[#F35024]/30'
                                  : u.role === 'teacher'
                                  ? 'bg-teal-50 text-[#1E807F] border-teal-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {u.name.trim().slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-xs">{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
                                    أنت
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>@{u.username}</span>
                                {u.email && <span>• {u.email}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          {u.role === 'operations_manager' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-50 text-[#1E807F] border border-teal-200">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              مدير العمليات
                            </span>
                          )}
                          {u.role === 'teacher' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              <GraduationCap className="w-3.5 h-3.5" />
                              معلم
                            </span>
                          )}
                          {u.role === 'parent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Users className="w-3.5 h-3.5" />
                              أولياء الأمور
                            </span>
                          )}
                        </td>

                        {/* Linked Profile */}
                        <td className="py-3.5 px-4">
                          {linkedTeacher ? (
                            <div>
                              <div className="font-bold text-slate-800 text-xs">
                                {linkedTeacher.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                كود: {linkedTeacher.code} • {linkedTeacher.specialization}
                              </div>
                            </div>
                          ) : u.role === 'parent' ? (
                            <span className="text-slate-500 font-medium text-[11px]">
                              الحساب التعليمي الموحد
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">
                              إدارة عامة للمنظومة
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              نشط (Active)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              معطل (Disabled)
                            </span>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {u.lastLogin ? (
                            <div>
                              <div>{u.lastLogin.slice(0, 10)}</div>
                              <div className="text-[10px] text-slate-400">{u.lastLogin.slice(11, 16)} GMT</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">لم يسجل دخول بعد</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {u.createdAt}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
                            {/* View Profile / Details */}
                            <button
                              type="button"
                              title="عرض تفاصيل الحساب"
                              onClick={() => handleOpenUserDetails(u)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit User */}
                            <button
                              type="button"
                              title="تعديل بيانات الحساب"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-slate-600 hover:text-[#25A09F] hover:bg-teal-50 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              type="button"
                              title="إعادة تعيين كلمة المرور"
                              onClick={() => handleOpenResetPassword(u)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Enable/Disable */}
                            <button
                              type="button"
                              title={u.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                              disabled={isSelf}
                              onClick={() => toggleUserStatus(u.id)}
                              className={`p-1.5 rounded-lg transition ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed'
                                  : u.status === 'active'
                                  ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.status === 'active' ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              title="حذف الحساب"
                              disabled={isSelf}
                              onClick={() => setUserToDelete(u)}
                              className={`p-1.5 rounded-lg transition ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const isSelected = selectedRoleId === r.id;
              const assignedUserCount = allUsers.filter((u) => u.role === r.id).length;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#25A09F] bg-teal-50/40 shadow-md ring-2 ring-[#25A09F]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#25A09F] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{r.nameAr}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{r.nameEn}</p>
                      </div>
                    </div>

                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                      {assignedUserCount} مستخدم
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">
                      الصلاحيات الممنوحة: {r.permissions.length} من {permissions.length}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-black text-[#25A09F] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        الدور المحدد
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions Matrix for Selected Role */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    مصفوفة صلاحيات: {currentRoleDefinition.nameAr}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-[#1E807F] font-bold">
                    {currentRoleDefinition.permissions.length} صلاحية مفعّلة
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  قم بتفعيل أو تعطيل الصلاحيات المخصصة لهذا الدور. مدير العمليات يمتلك وصولاً كاملاً غير مقيد.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGrantAllPermissions}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                >
                  منح كافة الصلاحيات
                </button>
                <button
                  type="button"
                  onClick={handleRevokeAllPermissions}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                >
                  تقييد الصلاحيات
                </button>
              </div>
            </div>

            {/* Categorized Permissions Grid */}
            <div className="space-y-6">
              {permissionCategories.map((cat) => {
                const catPermissions = permissions.filter((p) => p.category === cat.key);
                if (catPermissions.length === 0) return null;

                return (
                  <div key={cat.key} className="space-y-3">
                    <h3 className="text-xs font-black text-slate-800 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>{cat.labelAr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {catPermissions.filter((p) => currentRoleDefinition.permissions.includes(p.key)).length} / {catPermissions.length}
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {catPermissions.map((perm) => {
                        const isGranted = currentRoleDefinition.permissions.includes(perm.key);
                        const isOps = selectedRoleId === 'operations_manager';

                        return (
                          <div
                            key={perm.key}
                            onClick={() => !isOps && handleTogglePermission(perm.key)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                              isGranted
                                ? 'bg-teal-50/40 border-teal-200/80 shadow-2xs'
                                : 'bg-white border-slate-200/80 hover:border-slate-300'
                            } ${isOps ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isOps}
                              onChange={() => !isOps && handleTogglePermission(perm.key)}
                              className="w-4 h-4 mt-0.5 rounded text-[#25A09F] focus:ring-[#25A09F] border-slate-300"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">{perm.labelAr}</span>
                                <span className="text-[9px] text-slate-400 font-mono">{perm.key}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">سجل عمليات وتدقيق المستخدمين</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                تتبع كامل للإجراءات الإدارية وتعديلات الحسابات والأنصبة والجداول
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              إجمالي السجلات: {activityLogs.length}
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">لا يوجد سجلات نشاط مسجلة حتى الآن</p>
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{log.userName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        {log.actionType || 'UPDATE'}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{log.entityType}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{log.description}</p>
                    {log.newValue && (
                      <p className="text-[11px] text-teal-700 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                        القيمة: {log.newValue}
                      </p>
                    )}
                  </div>
                  <div className="text-left font-mono text-[11px] text-slate-400 shrink-0">
                    <div>{log.timestamp.slice(0, 10)}</div>
                    <div className="text-[10px]">{log.timestamp.slice(11, 19)} UTC</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="إنشاء حساب مستخدم جديد"
        subtitle="إضافة مستخدم جديد للنظام وتحديد دوره وصلاحياته"
      >
        <form onSubmit={handleSaveAddUser} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">الاسم الكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: م/ محمود السيد عبد الله"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#25A09F]/30 focus:border-[#25A09F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">اسم المستخدم (Username) *</label>
              <input
                type="text"
                required
                placeholder="mahmoud.elsayed"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#25A09F]/30 focus:border-[#25A09F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الدور الوظيفي (Role) *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#25A09F]/30"
              >
                <option value="teacher">معلم (Teacher)</option>
                <option value="operations_manager">مدير العمليات (Operations Manager)</option>
                <option value="parent">أولياء الأمور (Parents Portal)</option>
              </select>
            </div>
          </div>

          {/* Link to Teacher profile if role is teacher */}
          {formRole === 'teacher' && (
            <div className="space-y-1 p-3.5 bg-teal-50/50 rounded-2xl border border-teal-200">
              <label className="text-xs font-bold text-[#1E807F] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                ربط الحساب بملف المعلم في قاعدة البيانات
              </label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#25A09F]/30"
              >
                <option value="">-- اختر المعلم المرتبط أو اتركه فارغاً --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code} • {t.specialization})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                ربط الحساب يتيح للمعلم استعراض جدوله الأسبوعي الشخصي وتسجيل حصصه مباشرة.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="user@ebda-edu.eg"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#25A09F]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#25A09F]/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">حالة الحساب</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formStatus === 'active'}
                  onChange={() => setFormStatus('active')}
                  className="text-[#25A09F] focus:ring-[#25A09F]"
                />
                <span className="text-emerald-700">حساب نشط (Active)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="disabled"
                  checked={formStatus === 'disabled'}
                  onChange={() => setFormStatus('disabled')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="text-rose-700">حساب معطل (Disabled)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#25A09F] hover:bg-[#1E807F] text-white text-xs font-bold transition shadow-xs"
            >
              حفظ وإنشاء الحساب
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT USER */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title="تعديل بيانات المستخدم"
        subtitle={activeSelectedUser ? `تعديل ملف المستخدم @${activeSelectedUser.username}` : ''}
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4 text-right">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">الاسم الكامل *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#25A09F]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">اسم المستخدم (للتغيير استخدم زر التغيير)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value={formUsername}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    if (activeSelectedUser) handleOpenChangeUsername(activeSelectedUser);
                  }}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shrink-0"
                >
                  تغيير
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">الدور الوظيفي (Role) *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              >
                <option value="teacher">معلم (Teacher)</option>
                <option value="operations_manager">مدير العمليات (Operations Manager)</option>
                <option value="parent">أولياء الأمور (Parents Portal)</option>
              </select>
            </div>
          </div>

          {formRole === 'teacher' && (
            <div className="space-y-1 p-3.5 bg-teal-50/50 rounded-2xl border border-teal-200">
              <label className="text-xs font-bold text-[#1E807F]">ربط الحساب بملف المعلم</label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="">-- غير مرتبط بمعلم محدد --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code} • {t.specialization})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم الهاتف</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">حالة الحساب</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="editStatus"
                  value="active"
                  checked={formStatus === 'active'}
                  onChange={() => setFormStatus('active')}
                  className="text-[#25A09F] focus:ring-[#25A09F]"
                />
                <span className="text-emerald-700">حساب نشط (Active)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="editStatus"
                  value="disabled"
                  checked={formStatus === 'disabled'}
                  onChange={() => setFormStatus('disabled')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="text-rose-700">حساب معطل (Disabled)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditUserModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#25A09F] hover:bg-[#1E807F] text-white text-xs font-bold transition shadow-xs"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESET PASSWORD */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title={activeSelectedUser?.role === 'parent' ? 'إدارة وتعيين كلمة مرور حساب ولي الأمر' : 'إعادة تعيين كلمة المرور'}
        subtitle={activeSelectedUser ? `إدارة بيانات اعتماد الحساب @${activeSelectedUser.username} (${activeSelectedUser.name})` : ''}
      >
        <div className="space-y-4 text-right">
          {activeSelectedUser?.role === 'parent' && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#25A09F] shrink-0" />
              <span>سياسة الأمان: إدارة العمليات هي الجهة الوحيدة المخولة بإنشاء وتعيين كلمات مرور أولياء الأمور.</span>
            </div>
          )}

          {resetError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-900">
                كلمة المرور النشطة المعتمدة للحساب:
              </p>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                جاهزة للمشاركة
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-300 font-mono text-sm font-black text-slate-900 tracking-wider">
              <span>{generatedPassword}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرمز</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ بطاقة الدخول كاملة (اسم المستخدم + الرمز)</span>
              </button>

              <button
                type="button"
                onClick={() => activeSelectedUser && handleOpenResetPassword(activeSelectedUser)}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                🔄 توليد كلمة مرور عشوائية جديدة
              </button>
            </div>
          </div>

          {/* Optional: Set Explicit Custom Password */}
          <form onSubmit={handleApplyCustomPassword} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              أو تعيين كلمة مرور محددة مخصصة (Custom Password)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPasswordInput}
                onChange={(e) => setCustomPasswordInput(e.target.value)}
                placeholder="أدخل كلمة مرور (8 أحرف على الأقل، تشمل أرقام وحروف)"
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#25A09F] focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!customPasswordInput.trim()}
                className="px-4 py-2 bg-[#25A09F] hover:bg-[#1E807F] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                تطبيق
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              يجب أن تحتوي على 8 خانات على الأقل وتتضمن حروفاً وأرقاماً لتلبية معايير الأمان الوطنية.
            </p>
          </form>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CHANGE USERNAME */}
      <Modal
        isOpen={isChangeUsernameModalOpen}
        onClose={() => setIsChangeUsernameModalOpen(false)}
        title="تغيير اسم المستخدم (Change Username)"
        subtitle={activeSelectedUser ? `تغيير المعرف الخاص بـ ${activeSelectedUser.name}` : ''}
      >
        <form onSubmit={handleSaveChangeUsername} className="space-y-4 text-right">
          {usernameChangeError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{usernameChangeError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">اسم المستخدم الجديد *</label>
            <input
              type="text"
              required
              placeholder="new.username"
              value={newUsernameInput}
              onChange={(e) => setNewUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#25A09F]/30 focus:border-[#25A09F]"
            />
            <p className="text-[10px] text-slate-500">
              يجب أن يكون اسم المستخدم فريداً ولا يحتوي على مسافات.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsChangeUsernameModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#25A09F] hover:bg-[#1E807F] text-white text-xs font-bold transition shadow-xs"
            >
              تأكيد وحفظ الاسم الجديد
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: USER DETAILS DRAWER */}
      <Modal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        title="تفاصيل وبيانات حساب المستخدم"
        subtitle={activeSelectedUser ? `@${activeSelectedUser.username} • ${activeSelectedUser.name}` : ''}
      >
        {activeSelectedUser && (
          <div className="space-y-5 text-right text-xs">
            {/* Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25A09F] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                {activeSelectedUser.name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-sm text-slate-900">{activeSelectedUser.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">@{activeSelectedUser.username}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  activeSelectedUser.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {activeSelectedUser.status === 'active' ? 'نشط (Active)' : 'معطل (Disabled)'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">الدور الوظيفي</p>
                <p className="text-xs font-black text-slate-800 mt-1">
                  {activeSelectedUser.role === 'operations_manager'
                    ? 'مدير العمليات والتشغيل'
                    : activeSelectedUser.role === 'teacher'
                    ? 'معلم / عضو هيئة التدريس'
                    : 'بوابة أولياء الأمور'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">الملف المرتبط</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {activeSelectedUser.teacherId
                    ? teacherMap.get(activeSelectedUser.teacherId)?.name || activeSelectedUser.teacherId
                    : 'لا يوجد ربط مع كود معلم'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">البريد الإلكتروني</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                  {activeSelectedUser.email || 'غير مسجل'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">رقم الهاتف</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {activeSelectedUser.phone || 'غير مسجل'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">تاريخ إنشاء الحساب</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {activeSelectedUser.createdAt}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">آخر تسجيل دخول</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {activeSelectedUser.lastLogin || 'لم يسجل دخول بعد'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsUserDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION MODAL: DELETE USER (SOFT DELETE) */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        title="تأكيد حذف حساب المستخدم"
        message={
          userToDelete
            ? `هل أنت متأكد من رغبتك في حذف حساب المستخدم "${userToDelete.name}" (@${userToDelete.username})؟ سيتم إلغاء صلاحيات الدخول، مع الحفاظ على كافة السجلات التاريخية والحصص المرتبطة به.`
            : ''
        }
        confirmText="حذف الحساب"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};
