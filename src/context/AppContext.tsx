import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  School,
  AcademicYear,
  Teacher,
  Subject,
  Grade,
  SchoolClass,
  Lab,
  Workshop,
  TimeSlot,
  SchoolBreak,
  TimetableSlot,
  TeachingRecord,
  CurriculumUnit,
  ActivityLog,
  SystemSettings,
  TimetableConflict,
  SmartAlert,
  UserRole,
  PermissionKey,
  PermissionDefinition,
  RoleDefinition,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_TIME_SLOTS,
  INITIAL_BREAKS,
  INITIAL_GRADES,
  INITIAL_CLASSES,
  INITIAL_LABS,
  INITIAL_WORKSHOPS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_CURRICULUM_UNITS,
  INITIAL_TIMETABLE_SLOTS,
  INITIAL_TEACHING_RECORDS,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
  INITIAL_ROLES,
  SYSTEM_PERMISSIONS,
} from '../data/initialData';
import { detectTimetableConflicts } from '../utils/conflicts';
import {
  calculateTeacherWorkload,
  validateMaterialsUrl,
  validateBreak,
  isSlotOverlappingBreak,
  calculateBreakDuration,
} from '../utils/businessRules';
import { hashPassword, validatePassword, sanitizeUser, generateTemporaryPassword } from '../utils/security';

interface AppContextType {
  // Authentication & Role
  currentUser: User;
  allUsers: User[];
  isAuthenticated: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Roles & Permissions
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  hasPermission: (permission: PermissionKey) => boolean;
  updateRolePermissions: (roleId: UserRole, permissions: PermissionKey[]) => void;

  // Single Source of Truth Entities
  schools: School[];
  activeSchool: School;
  setActiveSchoolId: (id: string) => void;

  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear;

  timeSlots: TimeSlot[];
  breaks: SchoolBreak[];
  grades: Grade[];
  classes: SchoolClass[];
  teachers: Teacher[];
  subjects: Subject[];
  labs: Lab[];
  workshops: Workshop[];
  curriculumUnits: CurriculumUnit[];
  timetableSlots: TimetableSlot[];
  teachingRecords: TeachingRecord[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;

  // Analytics & Computed
  conflicts: TimetableConflict[];
  smartAlerts: SmartAlert[];
  getTeacherWorkload: (teacherId: string) => import('../types').TeacherWorkloadSummary;

  // CRUD Operations - Breaks (School Breaks Configuration)
  addBreak: (breakData: Omit<SchoolBreak, 'id'>) => { success: boolean; break?: SchoolBreak; error?: string };
  updateBreak: (id: string, updates: Partial<SchoolBreak>) => { success: boolean; break?: SchoolBreak; error?: string };
  deleteBreak: (id: string) => { success: boolean; error?: string };
  toggleBreakStatus: (id: string) => void;

  // CRUD Operations - Teachers
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // CRUD Operations - Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // CRUD Operations - Grades & Classes
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  // CRUD Operations - Labs & Workshops
  addLab: (lab: Omit<Lab, 'id'>) => void;
  updateLab: (id: string, updates: Partial<Lab>) => void;
  deleteLab: (id: string) => void;
  addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
  updateWorkshop: (id: string, updates: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;

  // CRUD Operations - Curriculum
  addCurriculumUnit: (unit: Omit<CurriculumUnit, 'id'>) => void;
  updateCurriculumUnit: (id: string, updates: Partial<CurriculumUnit>) => void;
  deleteCurriculumUnit: (id: string) => void;

  // Timetable Operations
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => { success: boolean; conflict?: TimetableConflict; error?: string };
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => { success: boolean; conflict?: TimetableConflict; error?: string };
  deleteTimetableSlot: (id: string) => void;
  batchImportSlots: (slots: Omit<TimetableSlot, 'id'>[]) => void;
  clearTimetable: () => void;

  // Teaching Records (What Was Taught) & Materials
  recordLesson: (record: Omit<TeachingRecord, 'id' | 'recordedAt'>) => { success: boolean; record?: TeachingRecord; error?: string };
  updateTeachingRecord: (id: string, updates: Partial<TeachingRecord>) => { success: boolean; error?: string };
  deleteTeachingRecord: (id: string) => void;
  toggleParentVisibility: (recordId: string, visible: boolean) => void;
  updateMaterialsUrl: (recordId: string, url: string) => { success: boolean; error?: string };

  // Users & Permissions Management
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { initialPassword?: string }) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string) => string;
  resetParentPassword: (id: string, newPassword: string) => { success: boolean; error?: string };
  changeUsername: (id: string, newUsername: string) => { success: boolean; message?: string };

  // System Settings & Data Reset
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;
  resolveAlert: (alertId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ebda_badr_school_system_state_v2';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state or localStorage
  const loadSaved = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(`Failed to parse saved state for ${key}`, e);
    }
    return fallback;
  };

  const [schools, setSchools] = useState<School[]>(() => loadSaved('schools', INITIAL_SCHOOLS));
  const [activeSchoolId, setActiveSchoolIdState] = useState<string>(() => loadSaved('activeSchoolId', 'badr'));
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => loadSaved('academicYears', INITIAL_ACADEMIC_YEARS));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => loadSaved('timeSlots', INITIAL_TIME_SLOTS));
  const [breaks, setBreaks] = useState<SchoolBreak[]>(() => loadSaved('breaks', INITIAL_BREAKS));
  const [grades, setGrades] = useState<Grade[]>(() => loadSaved('grades', INITIAL_GRADES));
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadSaved('classes', INITIAL_CLASSES));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadSaved('teachers', INITIAL_TEACHERS));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSaved('subjects', INITIAL_SUBJECTS));
  const [labs, setLabs] = useState<Lab[]>(() => loadSaved('labs', INITIAL_LABS));
  const [workshops, setWorkshops] = useState<Workshop[]>(() => loadSaved('workshops', INITIAL_WORKSHOPS));
  const [curriculumUnits, setCurriculumUnits] = useState<CurriculumUnit[]>(() => loadSaved('curriculumUnits', INITIAL_CURRICULUM_UNITS));
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => loadSaved('timetableSlots', INITIAL_TIMETABLE_SLOTS));
  const [teachingRecords, setTeachingRecords] = useState<TeachingRecord[]>(() => loadSaved('teachingRecords', INITIAL_TEACHING_RECORDS));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadSaved('allUsers', INITIAL_USERS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadSaved('activityLogs', INITIAL_ACTIVITY_LOGS));
  const [settings, setSettings] = useState<SystemSettings>(() => loadSaved('settings', INITIAL_SETTINGS));
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>(() => loadSaved('resolvedAlertIds', []));
  const [roles, setRoles] = useState<RoleDefinition[]>(() => loadSaved('roles', INITIAL_ROLES));
  const [permissions] = useState<PermissionDefinition[]>(SYSTEM_PERMISSIONS);

  // Current logged in user (default: Operations Manager for instant rich experience)
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadSaved('currentUserId', 'u-ops'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadSaved('isAuthenticated', true));

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(schools));
    localStorage.setItem(`${STORAGE_KEY}_activeSchoolId`, JSON.stringify(activeSchoolId));
    localStorage.setItem(`${STORAGE_KEY}_academicYears`, JSON.stringify(academicYears));
    localStorage.setItem(`${STORAGE_KEY}_timeSlots`, JSON.stringify(timeSlots));
    localStorage.setItem(`${STORAGE_KEY}_breaks`, JSON.stringify(breaks));
    localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(grades));
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
    localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    localStorage.setItem(`${STORAGE_KEY}_labs`, JSON.stringify(labs));
    localStorage.setItem(`${STORAGE_KEY}_workshops`, JSON.stringify(workshops));
    localStorage.setItem(`${STORAGE_KEY}_curriculumUnits`, JSON.stringify(curriculumUnits));
    localStorage.setItem(`${STORAGE_KEY}_timetableSlots`, JSON.stringify(timetableSlots));
    localStorage.setItem(`${STORAGE_KEY}_teachingRecords`, JSON.stringify(teachingRecords));
    localStorage.setItem(`${STORAGE_KEY}_allUsers`, JSON.stringify(allUsers));
    localStorage.setItem(`${STORAGE_KEY}_activityLogs`, JSON.stringify(activityLogs));
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    localStorage.setItem(`${STORAGE_KEY}_currentUserId`, JSON.stringify(currentUserId));
    localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(isAuthenticated));
    localStorage.setItem(`${STORAGE_KEY}_resolvedAlertIds`, JSON.stringify(resolvedAlertIds));
    localStorage.setItem(`${STORAGE_KEY}_roles`, JSON.stringify(roles));
  }, [
    schools,
    activeSchoolId,
    academicYears,
    timeSlots,
    breaks,
    grades,
    classes,
    teachers,
    subjects,
    labs,
    workshops,
    curriculumUnits,
    timetableSlots,
    teachingRecords,
    allUsers,
    activityLogs,
    settings,
    currentUserId,
    isAuthenticated,
    resolvedAlertIds,
    roles,
  ]);

  const activeSchool = useMemo(() => {
    return schools.find((s) => s.id === activeSchoolId) || schools[0];
  }, [schools, activeSchoolId]);

  const currentAcademicYear = useMemo(() => {
    return academicYears.find((y) => y.isCurrent) || academicYears[0];
  }, [academicYears]);

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.id === currentUserId) || allUsers[0];
  }, [allUsers, currentUserId]);

  // Logging helper
  const logActivity = (
    actionType: ActivityLog['actionType'],
    entityType: ActivityLog['entityType'],
    entityId: string,
    description: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType,
      entityType,
      entityId,
      description,
      previousValue,
      newValue,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Dynamic Timetable Conflict Detection (Including Break Conflicts)
  const conflicts = useMemo(() => {
    return detectTimetableConflicts(timetableSlots, teachers, classes, labs, workshops, subjects, breaks);
  }, [timetableSlots, teachers, classes, labs, workshops, subjects, breaks]);

  // Smart Operational Alerts
  const smartAlerts = useMemo(() => {
    const alerts: SmartAlert[] = [];

    // 1. Conflict Alerts
    conflicts.forEach((c) => {
      alerts.push({
        id: `alert-conflict-${c.id}`,
        type: 'conflict',
        title: `تعارض في الجدول الأسبوعي (${c.type === 'teacher' ? 'معلم' : c.type === 'class' ? 'فصل' : c.type === 'lab' ? 'معمل' : 'ورشة'})`,
        message: c.description,
        severity: 'high',
        timestamp: new Date().toISOString(),
        resolved: resolvedAlertIds.includes(`alert-conflict-${c.id}`),
        slotId: c.slot1.id,
      });
    });

    // 2. Missing Teaching Records (Lessons scheduled that were not recorded)
    const recordedSlotIds = new Set(teachingRecords.map((r) => r.timetableSlotId).filter(Boolean));
    const pendingSlots = timetableSlots.filter((s) => !recordedSlotIds.has(s.id));
    if (pendingSlots.length > 0) {
      alerts.push({
        id: 'alert-missing-records-summary',
        type: 'missing_record',
        title: `حصص معلقة بحاجة لتوثيق (${pendingSlots.length} حصة)`,
        message: `يوجد ${pendingSlots.length} حصة دراسية مجدولة لم يقم المعلمون بعد بتسجيل وتوثيق ما تم تدريسه بها.`,
        severity: 'medium',
        timestamp: new Date().toISOString(),
        resolved: resolvedAlertIds.includes('alert-missing-records-summary'),
      });
    }

    // 3. Overloaded & Underloaded Teachers
    teachers.forEach((t) => {
      const scheduledCount = timetableSlots.filter((s) => s.teacherId === t.id).length;
      if (scheduledCount > t.targetWeeklyLessons + 2) {
        alerts.push({
          id: `alert-overload-${t.id}`,
          type: 'overload',
          title: `نصاب تدريسي مرتفع: ${t.name}`,
          message: `المعلم مجدول له ${scheduledCount} حصة (ساعة) أسبوعياً، متجاوزاً النصاب المستهدف (${t.targetWeeklyLessons} حصة) بفارق +${scheduledCount - t.targetWeeklyLessons} ساعات.`,
          severity: 'medium',
          timestamp: new Date().toISOString(),
          resolved: resolvedAlertIds.includes(`alert-overload-${t.id}`),
          teacherId: t.id,
        });
      } else if (scheduledCount < t.targetWeeklyLessons - 2) {
        alerts.push({
          id: `alert-underload-${t.id}`,
          type: 'underload',
          title: `نصاب تدريسي غير مكتمل: ${t.name}`,
          message: `المعلم مجدول له ${scheduledCount} حصة (ساعة) من أصل ${t.targetWeeklyLessons} حصة مستهدفة (عجز: ${t.targetWeeklyLessons - scheduledCount} ساعات).`,
          severity: 'low',
          timestamp: new Date().toISOString(),
          resolved: resolvedAlertIds.includes(`alert-underload-${t.id}`),
          teacherId: t.id,
        });
      }
    });

    // 4. Missing Materials Links
    const missingMaterialsRecords = teachingRecords.filter((r) => !r.materialsUrl || r.materialsUrl.trim() === '');
    if (settings.requireMaterialsLink && missingMaterialsRecords.length > 0) {
      alerts.push({
        id: 'alert-missing-materials-summary',
        type: 'materials_missing',
        title: `روابط المواد التعليمية غير مكتملة (${missingMaterialsRecords.length} حصة)`,
        message: `هناك ${missingMaterialsRecords.length} حصة موثقة تفتقر إلى رابط المحتوى التعليمي (Google Drive / OneDrive) المعتمد لمشاركتها مع الطلاب وأولياء الأمور.`,
        severity: 'medium',
        timestamp: new Date().toISOString(),
        resolved: resolvedAlertIds.includes('alert-missing-materials-summary'),
      });
    }

    return alerts;
  }, [conflicts, timetableSlots, teachingRecords, teachers, settings.requireMaterialsLink, resolvedAlertIds]);

  const resolveAlert = (alertId: string) => {
    setResolvedAlertIds((prev) => [...prev, alertId]);
  };

  // Teacher Workload Calculator (60-minute session basis)
  const getTeacherWorkload = (teacherId: string): import('../types').TeacherWorkloadSummary => {
    const teacher = teachers.find((t) => t.id === teacherId) || teachers[0];
    const teacherSlots = timetableSlots.filter((s) => s.teacherId === teacherId);
    const scheduledCount = teacherSlots.length;
    const target = teacher?.targetWeeklyLessons || 25;
    const myRecords = teachingRecords.filter((r) => r.teacherId === teacherId);
    const completedCount = myRecords.filter((r) => r.lessonStatus === 'completed').length;
    const recordsWithMaterials = myRecords.filter((r) => !!r.materialsUrl && r.materialsUrl.trim() !== '').length;
    const docRate = scheduledCount > 0 ? Math.round((myRecords.length / scheduledCount) * 100) : 0;
    const matRate = myRecords.length > 0 ? Math.round((recordsWithMaterials / myRecords.length) * 100) : 0;

    const diff = scheduledCount - target;
    const workloadStatus: 'balanced' | 'overloaded' | 'underloaded' =
      diff > 2 ? 'overloaded' : diff < -1 ? 'underloaded' : 'balanced';

    return {
      teacherId: teacher?.id || teacherId,
      teacherName: teacher?.name || 'معلم',
      specialization: teacher?.specialization || 'تخصص عام',
      targetWeeklyHours: target,
      actualScheduledHours: scheduledCount,
      completedLessonsCount: completedCount,
      documentationRate: docRate,
      materialsCoverageRate: matRate,
      workloadStatus,
    };
  };

  // Auth Functions
  const login = (username: string, _password?: string): boolean => {
    const user = allUsers.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() || (u.email && u.email.toLowerCase() === username.trim().toLowerCase()));
    if (user && user.status === 'active') {
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      logActivity('LOGIN', 'user', user.id, `تسجيل دخول ناجح للمستخدم ${user.name} (${user.role})`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('LOGIN', 'user', currentUser.id, `تسجيل خروج المستخدم ${currentUser.name}`);
    }
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setIsAuthenticated(true);
      logActivity('LOGIN', 'user', target.id, `التبديل إلى المستخدم ${target.name} (${target.role})`);
    }
  };

  const setActiveSchoolId = (id: string) => {
    setActiveSchoolIdState(id);
    const sch = schools.find((s) => s.id === id);
    logActivity('UPDATE', 'settings', id, `تغيير المدرسة النشطة إلى: ${sch?.nameAr || id}`);
  };

  // CRUD Teachers
  const addTeacher = (data: Omit<Teacher, 'id'>) => {
    const newId = `t-${Date.now()}`;
    const newTeacher: Teacher = { ...data, id: newId };
    setTeachers((prev) => [...prev, newTeacher]);

    // Automatically create a user account for the teacher
    const username = data.email ? data.email.split('@')[0] : `teacher.${data.code.toLowerCase()}`;
    const newUser: User = {
      id: `u-${newId}`,
      username,
      name: data.name,
      role: 'teacher',
      teacherId: newId,
      email: data.email,
      phone: data.phone,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAllUsers((prev) => [...prev, newUser]);

    logActivity('CREATE', 'teacher', newId, `إضافة معلم جديد: ${data.name} (${data.specialization}) بنصاب مستهدف ${data.targetWeeklyLessons} حصة/ساعة`, undefined, JSON.stringify(newTeacher));
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    const prev = teachers.find((t) => t.id === id);
    setTeachers((current) => current.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    // Update matching user if name/email changed
    if (updates.name || updates.email || updates.phone) {
      setAllUsers((current) =>
        current.map((u) =>
          u.teacherId === id
            ? {
                ...u,
                name: updates.name || u.name,
                email: updates.email !== undefined ? updates.email : u.email,
                phone: updates.phone !== undefined ? updates.phone : u.phone,
              }
            : u
        )
      );
    }

    logActivity(
      'UPDATE',
      'teacher',
      id,
      `تحديث بيانات المعلم: ${prev?.name || id}`,
      JSON.stringify(prev),
      JSON.stringify(updates)
    );
  };

  const deleteTeacher = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setAllUsers((prev) => prev.filter((u) => u.teacherId !== id));
    // Soft clean or notify slots
    logActivity('DELETE', 'teacher', id, `حذف المعلم: ${teacher?.name || id}`, JSON.stringify(teacher));
  };

  // CRUD Subjects
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const newId = `sub-${Date.now()}`;
    const newSubject: Subject = { ...data, id: newId };
    setSubjects((prev) => [...prev, newSubject]);
    logActivity('CREATE', 'subject', newId, `إضافة مادة دراسية جديدة: ${data.nameAr} (${data.code}) بنصاب ${data.weeklyLessonsRequired} حصص أسبوعياً`, undefined, JSON.stringify(newSubject));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const prev = subjects.find((s) => s.id === id);
    setSubjects((current) => current.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logActivity('UPDATE', 'subject', id, `تحديث المادة الدراسية: ${prev?.nameAr || id}`, JSON.stringify(prev), JSON.stringify(updates));
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    logActivity('DELETE', 'subject', id, `حذف المادة الدراسية: ${sub?.nameAr || id}`, JSON.stringify(sub));
  };

  // CRUD Grades & Classes
  const addGrade = (data: Omit<Grade, 'id'>) => {
    const newId = `grade-${Date.now()}`;
    const newGrade: Grade = { ...data, id: newId };
    setGrades((prev) => [...prev, newGrade]);
    logActivity('CREATE', 'grade', newId, `إضافة صف دراسي: ${data.nameAr}`, undefined, JSON.stringify(newGrade));
  };

  const updateGrade = (id: string, updates: Partial<Grade>) => {
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    logActivity('UPDATE', 'grade', id, `تحديث الصف الدراسي: ${id}`, undefined, JSON.stringify(updates));
  };

  const deleteGrade = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    logActivity('DELETE', 'grade', id, `حذف الصف الدراسي: ${id}`);
  };

  const addClass = (data: Omit<SchoolClass, 'id'>) => {
    const newId = `class-${Date.now()}`;
    const newCls: SchoolClass = { ...data, id: newId };
    setClasses((prev) => [...prev, newCls]);
    logActivity('CREATE', 'class', newId, `إضافة فصل دراسي: ${data.nameAr} (${data.code})`, undefined, JSON.stringify(newCls));
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logActivity('UPDATE', 'class', id, `تحديث الفصل الدراسي: ${id}`, undefined, JSON.stringify(updates));
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    logActivity('DELETE', 'class', id, `حذف الفصل الدراسي: ${id}`);
  };

  // CRUD Labs & Workshops
  const addLab = (data: Omit<Lab, 'id'>) => {
    const newId = `lab-${Date.now()}`;
    const newLab: Lab = { ...data, id: newId };
    setLabs((prev) => [...prev, newLab]);
    logActivity('CREATE', 'lab', newId, `إضافة معمل جديد: ${data.nameAr} (${data.code}) بسعة ${data.capacity} طالب`, undefined, JSON.stringify(newLab));
  };

  const updateLab = (id: string, updates: Partial<Lab>) => {
    setLabs((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    logActivity('UPDATE', 'lab', id, `تحديث بيانات المعمل: ${id}`, undefined, JSON.stringify(updates));
  };

  const deleteLab = (id: string) => {
    setLabs((prev) => prev.filter((l) => l.id !== id));
    logActivity('DELETE', 'lab', id, `حذف المعمل: ${id}`);
  };

  const addWorkshop = (data: Omit<Workshop, 'id'>) => {
    const newId = `ws-${Date.now()}`;
    const newWs: Workshop = { ...data, id: newId };
    setWorkshops((prev) => [...prev, newWs]);
    logActivity('CREATE', 'workshop', newId, `إضافة ورشة تدريبية جديدة: ${data.nameAr} (${data.code})`, undefined, JSON.stringify(newWs));
  };

  const updateWorkshop = (id: string, updates: Partial<Workshop>) => {
    setWorkshops((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    logActivity('UPDATE', 'workshop', id, `تحديث بيانات الورشة: ${id}`, undefined, JSON.stringify(updates));
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((w) => w.id !== id));
    logActivity('DELETE', 'workshop', id, `حذف الورشة: ${id}`);
  };

  // CRUD Curriculum
  const addCurriculumUnit = (data: Omit<CurriculumUnit, 'id'>) => {
    const newId = `cu-${Date.now()}`;
    const newUnit: CurriculumUnit = { ...data, id: newId };
    setCurriculumUnits((prev) => [...prev, newUnit]);
    logActivity('CREATE', 'curriculum', newId, `إضافة وحدة منهج: ${data.unitTitle}`, undefined, JSON.stringify(newUnit));
  };

  const updateCurriculumUnit = (id: string, updates: Partial<CurriculumUnit>) => {
    setCurriculumUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logActivity('UPDATE', 'curriculum', id, `تحديث وحدة المنهج: ${id}`, undefined, JSON.stringify(updates));
  };

  const deleteCurriculumUnit = (id: string) => {
    setCurriculumUnits((prev) => prev.filter((u) => u.id !== id));
    logActivity('DELETE', 'curriculum', id, `حذف وحدة المنهج: ${id}`);
  };

  // CRUD Operations - Breaks (School Breaks Configuration)
  const addBreak = (data: Omit<SchoolBreak, 'id'>): { success: boolean; break?: SchoolBreak; error?: string } => {
    const validation = validateBreak(data);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const duration = calculateBreakDuration(data.startTime, data.endTime);
    const newId = `brk-${Date.now()}`;
    const newBreak: SchoolBreak = {
      ...data,
      id: newId,
      durationMinutes: duration > 0 ? duration : (data.durationMinutes || 30),
      schoolId: data.schoolId || activeSchool.id,
      status: data.status || 'active',
    };

    setBreaks((prev) => [...prev, newBreak]);
    logActivity('CREATE', 'settings', newId, `إضافة فترة استراحة جديدة: ${data.name} (${data.startTime} - ${data.endTime})`, undefined, JSON.stringify(newBreak));
    return { success: true, break: newBreak };
  };

  const updateBreak = (id: string, updates: Partial<SchoolBreak>): { success: boolean; break?: SchoolBreak; error?: string } => {
    const existing = breaks.find((b) => b.id === id);
    if (!existing) {
      return { success: false, error: 'الاستراحة المحددة غير موجودة' };
    }

    const merged = { ...existing, ...updates };
    const validation = validateBreak(merged);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const duration = calculateBreakDuration(merged.startTime, merged.endTime);
    const updatedBreak: SchoolBreak = {
      ...merged,
      durationMinutes: duration > 0 ? duration : (merged.durationMinutes || 30),
    };

    setBreaks((prev) => prev.map((b) => (b.id === id ? updatedBreak : b)));
    logActivity('UPDATE', 'settings', id, `تعديل فترة الاستراحة: ${updatedBreak.name}`, JSON.stringify(existing), JSON.stringify(updatedBreak));
    return { success: true, break: updatedBreak };
  };

  const deleteBreak = (id: string): { success: boolean; error?: string } => {
    const existing = breaks.find((b) => b.id === id);
    if (!existing) {
      return { success: false, error: 'الاستراحة المحددة غير موجودة' };
    }
    setBreaks((prev) => prev.filter((b) => b.id !== id));
    logActivity('DELETE', 'settings', id, `حذف فترة الاستراحة: ${existing.name}`, JSON.stringify(existing));
    return { success: true };
  };

  const toggleBreakStatus = (id: string) => {
    const existing = breaks.find((b) => b.id === id);
    if (!existing) return;
    const newStatus = existing.status === 'active' ? 'disabled' : 'active';
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    logActivity('UPDATE', 'settings', id, `${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} فترة الاستراحة: ${existing.name}`);
  };

  // Timetable Operations
  const addTimetableSlot = (data: Omit<TimetableSlot, 'id'>): { success: boolean; conflict?: TimetableConflict; error?: string } => {
    // 1. Check if the slot overlaps with any active school break
    const breakOverlap = isSlotOverlappingBreak(data, breaks);
    if (breakOverlap.hasConflict && breakOverlap.conflictingBreak) {
      const brk = breakOverlap.conflictingBreak;
      const errorMsg = `لا يمكن جدولة حصة دراسية أثناء فترة استراحة / فسحة معتمدة: (${brk.name} من ${brk.startTime} إلى ${brk.endTime})`;
      return {
        success: false,
        error: errorMsg,
        conflict: {
          id: `conflict-break-prevented-${Date.now()}`,
          type: 'break',
          dayOfWeek: data.dayOfWeek,
          slotIndex: data.slotIndex,
          timeRange: `${data.startTime} - ${data.endTime}`,
          description: errorMsg,
          slot1: { ...data, id: 'temp-slot', durationMinutes: settings.lessonDurationMinutes || 60 },
          conflictingBreak: brk,
          suggestion: 'يرجى تغيير موعد الحصة لتفادي فترة الاستراحة المعتمدة.',
        },
      };
    }

    const newSlot: TimetableSlot = {
      ...data,
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      durationMinutes: settings.lessonDurationMinutes || 60,
    };

    const nextSlots = [...timetableSlots, newSlot];
    const newConflicts = detectTimetableConflicts(nextSlots, teachers, classes, labs, workshops, subjects, breaks);
    const slotConflict = newConflicts.find((c) => c.slot1.id === newSlot.id || c.slot2?.id === newSlot.id);

    setTimetableSlots(nextSlots);
    const teacher = teachers.find((t) => t.id === data.teacherId);
    const sub = subjects.find((s) => s.id === data.subjectId);
    const cl = classes.find((c) => c.id === data.classId);

    logActivity(
      'CREATE',
      'timetable',
      newSlot.id,
      `إضافة حصة مجدولة (60 دقيقة): مادة ${sub?.nameAr || ''} - فصل ${cl?.code || ''} - المعلم ${teacher?.name || ''} يوم ${data.dayOfWeek} ${data.startTime}-${data.endTime}`,
      undefined,
      JSON.stringify(newSlot)
    );

    return {
      success: true,
      conflict: slotConflict,
    };
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>): { success: boolean; conflict?: TimetableConflict; error?: string } => {
    const prev = timetableSlots.find((s) => s.id === id);
    if (!prev) return { success: false, error: 'الحصة الدراسية غير موجودة' };

    const merged = { ...prev, ...updates };

    // Check break conflict if timing or day is modified
    const breakOverlap = isSlotOverlappingBreak(merged, breaks);
    if (breakOverlap.hasConflict && breakOverlap.conflictingBreak) {
      const brk = breakOverlap.conflictingBreak;
      const errorMsg = `لا يمكن جدولة حصة دراسية أثناء فترة استراحة / فسحة معتمدة: (${brk.name} من ${brk.startTime} إلى ${brk.endTime})`;
      return {
        success: false,
        error: errorMsg,
        conflict: {
          id: `conflict-break-prevented-${Date.now()}`,
          type: 'break',
          dayOfWeek: merged.dayOfWeek,
          slotIndex: merged.slotIndex,
          timeRange: `${merged.startTime} - ${merged.endTime}`,
          description: errorMsg,
          slot1: merged,
          conflictingBreak: brk,
          suggestion: 'يرجى تغيير موعد الحصة لتفادي فترة الاستراحة المعتمدة.',
        },
      };
    }

    const nextSlots = timetableSlots.map((s) => (s.id === id ? merged : s));
    const newConflicts = detectTimetableConflicts(nextSlots, teachers, classes, labs, workshops, subjects, breaks);
    const slotConflict = newConflicts.find((c) => c.slot1.id === id || c.slot2?.id === id);

    setTimetableSlots(nextSlots);
    logActivity('UPDATE', 'timetable', id, `تعديل الحصة المجدولة ${id}`, JSON.stringify(prev), JSON.stringify(updates));

    return {
      success: true,
      conflict: slotConflict,
    };
  };

  const deleteTimetableSlot = (id: string) => {
    const slot = timetableSlots.find((s) => s.id === id);
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
    logActivity('DELETE', 'timetable', id, `حذف الحصة المجدولة من الجدول الأسبوعي: ${id}`, JSON.stringify(slot));
  };

  const batchImportSlots = (newSlots: Omit<TimetableSlot, 'id'>[]) => {
    const slotsWithIds: TimetableSlot[] = newSlots.map((s, index) => ({
      ...s,
      id: `slot-imp-${Date.now()}-${index}`,
      durationMinutes: settings.lessonDurationMinutes || 60,
    }));
    setTimetableSlots((prev) => [...prev, ...slotsWithIds]);
    logActivity('IMPORT', 'timetable', 'batch', `استيراد وإدراج ${slotsWithIds.length} حصة دراسية جديدة في الجدول الأسبوعي`);
  };

  const clearTimetable = () => {
    setTimetableSlots([]);
    logActivity('DELETE', 'timetable', 'all', `إعادة تعيين ومسح الجدول الأسبوعي بالكامل`);
  };

  // Teaching Records Operations & Materials Management
  const recordLesson = (data: Omit<TeachingRecord, 'id' | 'recordedAt'>): { success: boolean; record?: TeachingRecord; error?: string } => {
    // Validate materials URL if provided
    if (data.materialsUrl && data.materialsUrl.trim() !== '') {
      const urlValidation = validateMaterialsUrl(data.materialsUrl);
      if (!urlValidation.isValid) {
        return { success: false, error: urlValidation.error };
      }
    }

    const newId = `rec-${Date.now()}`;
    const newRecord: TeachingRecord = {
      ...data,
      id: newId,
      durationMinutes: settings.lessonDurationMinutes || 60,
      recordedAt: new Date().toISOString(),
    };

    setTeachingRecords((prev) => [newRecord, ...prev]);

    const teacher = teachers.find((t) => t.id === data.teacherId);
    const sub = subjects.find((s) => s.id === data.subjectId);
    const cl = classes.find((c) => c.id === data.classId);

    logActivity(
      'RECORD_LESSON',
      'teaching_record',
      newId,
      `توثيق ما تم تدريسه (حصة 60 دقيقة): [${sub?.nameAr || ''} - ${cl?.code || ''}] موضوع: "${data.lessonTopic}" | الحالة: ${data.lessonStatus} | المعلم: ${teacher?.name || ''}`,
      undefined,
      JSON.stringify(newRecord)
    );

    return { success: true, record: newRecord };
  };

  const updateTeachingRecord = (id: string, updates: Partial<TeachingRecord>): { success: boolean; error?: string } => {
    const prev = teachingRecords.find((r) => r.id === id);
    if (!prev) return { success: false, error: 'السجل التدريسي غير موجود' };

    if (updates.materialsUrl !== undefined && updates.materialsUrl.trim() !== '') {
      const urlValidation = validateMaterialsUrl(updates.materialsUrl);
      if (!urlValidation.isValid) {
        return { success: false, error: urlValidation.error };
      }
    }

    setTeachingRecords((current) =>
      current.map((r) => (r.id === id ? { ...r, ...updates, lastUpdatedAt: new Date().toISOString() } : r))
    );
    logActivity('UPDATE', 'teaching_record', id, `تعديل توثيق الحصة: ${id}`, JSON.stringify(prev), JSON.stringify(updates));
    return { success: true };
  };

  const deleteTeachingRecord = (id: string) => {
    const rec = teachingRecords.find((r) => r.id === id);
    setTeachingRecords((prev) => prev.filter((r) => r.id !== id));
    logActivity('DELETE', 'teaching_record', id, `حذف سجل توثيق الحصة: ${rec?.lessonTopic || id}`, JSON.stringify(rec));
  };

  const toggleParentVisibility = (recordId: string, visible: boolean) => {
    setTeachingRecords((current) =>
      current.map((r) => (r.id === recordId ? { ...r, parentVisibility: visible } : r))
    );
    logActivity(
      'UPDATE',
      'teaching_record',
      recordId,
      `تعديل إمكانية وصول أولياء الأمور إلى مواد الحصة: ${visible ? 'متاح لأولياء الأمور' : 'مخفي عن أولياء الأمور'}`
    );
  };

  const updateMaterialsUrl = (recordId: string, url: string): { success: boolean; error?: string } => {
    const trimmed = url.trim();
    if (trimmed !== '') {
      const validation = validateMaterialsUrl(trimmed);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }
    }

    setTeachingRecords((current) =>
      current.map((r) => (r.id === recordId ? { ...r, materialsUrl: trimmed, lastUpdatedAt: new Date().toISOString() } : r))
    );
    logActivity('UPDATE', 'teaching_record', recordId, trimmed ? `تحديث رابط المواد التعليمية: ${trimmed}` : 'إزالة رابط المواد التعليمية');
    return { success: true };
  };

  // Permission Check
  const hasPermission = (permissionKey: PermissionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'operations_manager') return true; // Full access for operations manager
    const roleDef = roles.find((r) => r.id === currentUser.role);
    return roleDef ? roleDef.permissions.includes(permissionKey) : false;
  };

  const updateRolePermissions = (roleId: UserRole, newPermissions: PermissionKey[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: newPermissions } : r))
    );
    logActivity('UPDATE', 'user', roleId, `تحديث مصفوفة صلاحيات الدور: ${roleId}`);
  };

  // User & Password Management (Strict Operations Manager Control)
  const addUser = (data: Omit<User, 'id' | 'createdAt'> & { initialPassword?: string }): { success: boolean; error?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, error: 'اسم المستخدم مطلوب' };
    }
    const exists = allUsers.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: 'اسم المستخدم مسجل بالفعل' };
    }

    let passwordHash = data.passwordHash;
    if (data.initialPassword) {
      const passVal = validatePassword(data.initialPassword);
      if (!passVal.isValid) {
        return { success: false, error: passVal.error };
      }
      passwordHash = hashPassword(data.initialPassword);
    } else if (!passwordHash) {
      // Cryptographically generated initial password hashed
      const tempPass = generateTemporaryPassword('Ebda');
      passwordHash = hashPassword(tempPass);
    }

    const newId = `u-${Date.now()}`;
    const newUser: User = {
      username: cleanUsername,
      name: data.name.trim(),
      role: data.role,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      status: data.status || 'active',
      teacherId: data.teacherId,
      passwordHash,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setAllUsers((prev) => [...prev, newUser]);
    logActivity('CREATE', 'user', newId, `إنشاء حساب مستخدم جديد: ${newUser.username} (دور: ${newUser.role})`);
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    // If password update is included, ensure it's hashed
    let safeUpdates = { ...updates };
    if (updates.passwordHash === undefined && (updates as { password?: string }).password) {
      safeUpdates.passwordHash = hashPassword((updates as { password?: string }).password!);
      delete (safeUpdates as { password?: string }).password;
    }

    const prev = allUsers.find((u) => u.id === id);
    setAllUsers((current) => current.map((u) => (u.id === id ? { ...u, ...safeUpdates } : u)));
    logActivity('UPDATE', 'user', id, `تعديل بيانات المستخدم: ${prev?.username || id}`);
  };

  const deleteUser = (id: string) => {
    const u = allUsers.find((user) => user.id === id);
    setAllUsers((prev) => prev.filter((user) => user.id !== id));
    logActivity('DELETE', 'user', id, `حذف المستخدم: ${u?.username || id}`);
  };

  const toggleUserStatus = (id: string) => {
    const u = allUsers.find((user) => user.id === id);
    if (!u) return;
    const newStatus = u.status === 'active' ? 'disabled' : 'active';
    updateUser(id, { status: newStatus });
    logActivity(
      'UPDATE',
      'user',
      id,
      `${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} حساب المستخدم: ${u.username}`
    );
  };

  const resetUserPassword = (id: string): string => {
    const newPass = generateTemporaryPassword('Ebda');
    const hashed = hashPassword(newPass);
    updateUser(id, { passwordHash: hashed });
    const u = allUsers.find((user) => user.id === id);
    logActivity('UPDATE', 'user', id, `إعادة تعيين كلمة مرور المستخدم ${u?.username || id}`);
    return newPass;
  };

  // Specific Parent Password Reset (Operations Manager only)
  const resetParentPassword = (id: string, newPassword: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'operations_manager') {
      return { success: false, error: 'غير مصرح لك بإعادة تعيين كلمة المرور، يرجى التواصل مع إدارة المدرسة' };
    }

    const targetUser = allUsers.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'حساب ولي الأمر غير موجود' };
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const hashed = hashPassword(newPassword);
    setAllUsers((current) => current.map((u) => (u.id === id ? { ...u, passwordHash: hashed } : u)));

    // Password reset audit log (Never log the password itself!)
    const auditLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'PARENT_PASSWORD_RESET',
      actionType: 'UPDATE',
      entityType: 'user',
      entityId: id,
      description: `إعادة تعيين كلمة مرور حساب ولي الأمر (${targetUser.name} - ${targetUser.username}) بواسطة مدير العمليات`,
    };
    setActivityLogs((prev) => [auditLog, ...prev.slice(0, 199)]);

    return { success: true };
  };

  const changeUsername = (id: string, newUsername: string): { success: boolean; message?: string } => {
    const trimmed = newUsername.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, message: 'اسم المستخدم لا يمكن أن يكون فارغاً' };
    }
    const exists = allUsers.some((u) => u.id !== id && u.username.toLowerCase() === trimmed);
    if (exists) {
      return { success: false, message: 'اسم المستخدم مستخدم بالفعل في حساب آخر' };
    }
    updateUser(id, { username: trimmed });
    return { success: true };
  };

  // Operations Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const prev = { ...settings };
    setSettings((current) => ({ ...current, ...newSettings }));
    logActivity('UPDATE', 'settings', 'global', `تحديث إعدادات النظام والتشغيل`, JSON.stringify(prev), JSON.stringify(newSettings));
  };

  // Reset to seed data
  const resetToDefaultData = () => {
    setSchools(INITIAL_SCHOOLS);
    setActiveSchoolIdState('badr');
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setTimeSlots(INITIAL_TIME_SLOTS);
    setBreaks(INITIAL_BREAKS);
    setGrades(INITIAL_GRADES);
    setClasses(INITIAL_CLASSES);
    setTeachers(INITIAL_TEACHERS);
    setSubjects(INITIAL_SUBJECTS);
    setLabs(INITIAL_LABS);
    setWorkshops(INITIAL_WORKSHOPS);
    setCurriculumUnits(INITIAL_CURRICULUM_UNITS);
    setTimetableSlots(INITIAL_TIMETABLE_SLOTS);
    setTeachingRecords(INITIAL_TEACHING_RECORDS);
    setAllUsers(INITIAL_USERS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(INITIAL_SETTINGS);
    setResolvedAlertIds([]);
    setRoles(INITIAL_ROLES);
    setCurrentUserId('u-ops');
    setIsAuthenticated(true);
    localStorage.clear();
    logActivity('UPDATE', 'settings', 'system', `إعادة تهيئة النظام لقيم البدء الأصلية (Seed Reset)`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        login,
        logout,
        switchUser,
        roles,
        permissions,
        hasPermission,
        updateRolePermissions,
        schools,
        activeSchool,
        setActiveSchoolId,
        academicYears,
        currentAcademicYear,
        timeSlots,
        breaks,
        grades,
        classes,
        teachers,
        subjects,
        labs,
        workshops,
        curriculumUnits,
        timetableSlots,
        teachingRecords,
        activityLogs,
        settings,
        conflicts,
        smartAlerts,
        getTeacherWorkload,
        addBreak,
        updateBreak,
        deleteBreak,
        toggleBreakStatus,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubject,
        updateSubject,
        deleteSubject,
        addGrade,
        updateGrade,
        deleteGrade,
        addClass,
        updateClass,
        deleteClass,
        addLab,
        updateLab,
        deleteLab,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        addCurriculumUnit,
        updateCurriculumUnit,
        deleteCurriculumUnit,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        batchImportSlots,
        clearTimetable,
        recordLesson,
        updateTeachingRecord,
        deleteTeachingRecord,
        toggleParentVisibility,
        updateMaterialsUrl,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        resetParentPassword,
        changeUsername,
        updateSettings,
        resetToDefaultData,
        resolveAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
