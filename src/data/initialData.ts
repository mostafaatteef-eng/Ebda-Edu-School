import {
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
  User,
  ActivityLog,
  SystemSettings,
  PermissionDefinition,
  RoleDefinition,
} from '../types';
import { hashPassword } from '../utils/security';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'badr',
    nameAr: 'مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية',
    nameEn: 'EBDA School – Badr',
    code: 'EBDA-BDR-01',
    city: 'مدينة بدر، القاهرة',
    address: 'المنطقة الصناعية الثالثة، مدينة بدر، مصر',
    phone: '+20 2 2860 4100',
    email: 'badr.school@ebda-edu.eg',
    logoText: 'EBDA EDU - BADR',
    isActive: true,
  },
  {
    id: 'damietta',
    nameAr: 'مدرسة ابدأ – دمياط للعلوم والتكنولوجيا التطبيقية',
    nameEn: 'EBDA School – Damietta',
    code: 'EBDA-DMT-02',
    city: 'دمياط الجديدة',
    address: 'المنطقة التعليمية، دمياط الجديدة، مصر',
    phone: '+20 57 2400 900',
    email: 'damietta.school@ebda-edu.eg',
    logoText: 'EBDA EDU - DAMIETTA',
    isActive: true,
  },
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2025-2026',
    name: '2025 / 2026',
    term: 'الفصل الدراسي الثاني',
    startDate: '2026-02-08',
    endDate: '2026-06-15',
    isCurrent: true,
  },
  {
    id: 'ay-2024-2025',
    name: '2024 / 2025',
    term: 'العام الكامل (مؤرشف)',
    startDate: '2024-09-20',
    endDate: '2025-06-10',
    isCurrent: false,
  },
];

export const INITIAL_TIME_SLOTS: TimeSlot[] = [
  {
    slotIndex: 1,
    nameAr: 'الحصة الأولى',
    startTime: '08:00',
    endTime: '09:00',
    durationMinutes: 60,
  },
  {
    slotIndex: 2,
    nameAr: 'الحصة الثانية',
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
  },
  {
    slotIndex: 3,
    nameAr: 'الحصة الثالثة',
    startTime: '10:30',
    endTime: '11:30',
    durationMinutes: 60,
  },
  {
    slotIndex: 4,
    nameAr: 'الحصة الرابعة',
    startTime: '11:30',
    endTime: '12:30',
    durationMinutes: 60,
  },
  {
    slotIndex: 5,
    nameAr: 'الحصة الخامسة',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
  },
  {
    slotIndex: 6,
    nameAr: 'الحصة السادسة',
    startTime: '13:30',
    endTime: '14:30',
    durationMinutes: 60,
  },
];

export const INITIAL_GRADES: Grade[] = [
  {
    id: 'grade-1',
    code: 'G1',
    nameAr: 'الصف الأول الثانوي التطبيقي',
    level: 1,
    schoolId: 'badr',
  },
  {
    id: 'grade-2',
    code: 'G2',
    nameAr: 'الصف الثاني الثانوي التطبيقي',
    level: 2,
    schoolId: 'badr',
  },
  {
    id: 'grade-3',
    code: 'G3',
    nameAr: 'الصف الثالث الثانوي التطبيقي',
    level: 3,
    schoolId: 'badr',
  },
];

// Clean Operational Starting Data (Zero Seed Records)
export const INITIAL_CLASSES: SchoolClass[] = [];
export const INITIAL_LABS: Lab[] = [];
export const INITIAL_WORKSHOPS: Workshop[] = [];
export const INITIAL_TEACHERS: Teacher[] = [];
export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [];
export const INITIAL_TEACHING_RECORDS: TeachingRecord[] = [];
export const INITIAL_CURRICULUM_UNITS: CurriculumUnit[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const INITIAL_BREAKS: SchoolBreak[] = [
  {
    id: 'brk-morning',
    name: 'فسحة الصباح (Morning Break)',
    type: 'break',
    startTime: '10:00',
    endTime: '10:30',
    durationMinutes: 30,
    daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    status: 'active',
    schoolId: 'badr',
    notes: 'استراحة وتناول وجبة الإفطار للطلاب وأعضاء هيئة التدريس',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-ops',
    username: 'ops@ebda.edu.eg',
    name: 'مدير العمليات والتشغيل',
    role: 'operations_manager',
    email: 'ops@ebda.edu.eg',
    phone: '01000000001',
    status: 'active',
    passwordHash: hashPassword('admin123'),
    lastLogin: '2026-01-01T08:00:00Z',
    createdAt: '2026-01-01',
  },
  {
    id: 'u-parents',
    username: 'parents@ebda.edu.eg',
    name: 'أولياء أمور مدرسة ابدأ – بدر',
    role: 'parent',
    email: 'parents@ebda.edu.eg',
    phone: '01055555555',
    status: 'active',
    passwordHash: hashPassword('parents123'),
    lastLogin: '2026-01-01T08:00:00Z',
    createdAt: '2026-01-01',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  lessonDurationMinutes: 60, // STRICT REQUIREMENT: 60 Minutes per lesson
  schoolStartTime: '08:00',
  requireMaterialsLink: true,
  defaultParentVisibility: true,
  currentAcademicYear: '2025 / 2026',
  currentTerm: 'الفصل الدراسي الثاني',
  allowExtraLessons: true,
  maxUploadSizeMB: 50,
  activeSchoolId: 'badr',
};

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // Operations & Structure
  {
    key: 'view_dashboard',
    category: 'operations',
    labelAr: 'عرض لوحة العمليات والتحكم',
    labelEn: 'View Operations Dashboard',
    description: 'الاطلاع على المؤشرات التشغيلية وحصص اليوم وحالة المدرسة',
  },
  {
    key: 'manage_teachers',
    category: 'operations',
    labelAr: 'إدارة المعلمين وتحديد الأنصبة',
    labelEn: 'Manage Teachers & Workloads',
    description: 'إضافة وتعديل بيانات المعلمين والأنصبة الأسبوعية والربط بالمقررات',
  },
  {
    key: 'manage_subjects',
    category: 'operations',
    labelAr: 'إدارة المواد والمناهج',
    labelEn: 'Manage Subjects & Curriculum',
    description: 'إنشاء المقررات وتحديد ساعاتها الأسبوعية ومتطلباتها المعملية',
  },
  {
    key: 'manage_grades',
    category: 'operations',
    labelAr: 'إدارة المراحل والصفوف الدراسية',
    labelEn: 'Manage Grades',
    description: 'إدارة المستويات الدراسية الثلاثة للتعليم التكنولوجي',
  },
  {
    key: 'manage_classes',
    category: 'operations',
    labelAr: 'إدارة الفصول والشعب',
    labelEn: 'Manage School Classes',
    description: 'تهيئة الشعب المدرسية وتوزيع الطلاب على القاعات الدراسية',
  },
  {
    key: 'manage_timetable',
    category: 'operations',
    labelAr: 'بناء وتعديل الجدول الدراسي الأسبوعي',
    labelEn: 'Manage Weekly Timetable',
    description: 'توزيع الحصص الأسبوعية (جلسات 60 دقيقة) وكشف التعارضات اللحظية',
  },
  {
    key: 'manage_labs',
    category: 'resources',
    labelAr: 'إدارة وحجز المعامل المتخصصة',
    labelEn: 'Manage Labs & Bookings',
    description: 'إدارة معامل الحاسب والإلكترونيات والميكاترونكس وتخصيصها في الجدول',
  },
  {
    key: 'manage_workshops',
    category: 'resources',
    labelAr: 'إدارة وحجز الورش الهندسية',
    labelEn: 'Manage Workshops & Bookings',
    description: 'إدارة ورش التحكم والميكانيكا والتشغيل وتخصيصها في الجدول',
  },

  // Academic & Teaching
  {
    key: 'record_lesson',
    category: 'academic',
    labelAr: 'تسجيل وتوثيق ما تم تدريسه',
    labelEn: 'Record Delivered Lessons',
    description: 'توثيق الحصص المنفذة ورفع روابط المواد التعليمية والملاحظات',
  },
  {
    key: 'edit_teaching_record',
    category: 'academic',
    labelAr: 'تعديل وتحديث السجلات التدريسية',
    labelEn: 'Edit Teaching Records',
    description: 'تحديث بيانات الحصة المنفذة أو تصحيح روابط المرفقات والملازم',
  },
  {
    key: 'view_teaching_load',
    category: 'academic',
    labelAr: 'الاطلاع على النصاب التدريسي والمقارنة',
    labelEn: 'View Teaching Load Analytics',
    description: 'متابعة النصاب المستهدف والفعلي بالساعات ومعدل الإنجاز %',
  },
  {
    key: 'view_lesson_materials',
    category: 'academic',
    labelAr: 'الاطلاع على روابط المواد التعليمية والملازم',
    labelEn: 'View Lesson Materials',
    description: 'تصفح روابط Google Drive والملازم المعتمدة لكل حصة',
  },

  // System & Users
  {
    key: 'manage_users',
    category: 'system',
    labelAr: 'إدارة حسابات المستخدمين والوصول',
    labelEn: 'Manage Users & Access',
    description: 'إنشاء وتعديل وتعطيل الحسابات وإعادة تعيين كلمات المرور',
  },
  {
    key: 'manage_roles',
    category: 'system',
    labelAr: 'إدارة الأدوار ومصفوفة الصلاحيات',
    labelEn: 'Manage Roles & Permissions',
    description: 'تخصيص أذونات الوصول ومستويات الصلاحيات للأدوار المختلفة',
  },
  {
    key: 'manage_settings',
    category: 'system',
    labelAr: 'إدارة إعدادات التشغيل والسياسات',
    labelEn: 'Manage Operational Settings',
    description: 'ضبط معيار الـ 60 دقيقة، زمن اليوم المدرسي، والحدود القصوى',
  },
  {
    key: 'manage_academic_years',
    category: 'system',
    labelAr: 'إدارة الأعوام الدراسية والفصول',
    labelEn: 'Manage Academic Years',
    description: 'تفعيل وأرشفة السنوات الدراسية وإدارة الفصول الحالية',
  },

  // Data & Reporting
  {
    key: 'import_excel',
    category: 'reporting',
    labelAr: 'استيراد البيانات الذكي من Excel',
    labelEn: 'Import Excel Data',
    description: 'مطابقة الأعمدة وفحص الأخطاء واستيراد الجداول والمعلمين',
  },
  {
    key: 'export_data',
    category: 'reporting',
    labelAr: 'تصدير البيانات (Excel / CSV / JSON)',
    labelEn: 'Export System Data',
    description: 'تنزيل كشوفات الحصص والأنصبة والتقارير بصيغ متعددة',
  },
  {
    key: 'view_reports',
    category: 'reporting',
    labelAr: 'عرض وطباعة التقارير الإدارية المعتمدة',
    labelEn: 'View Official Reports & PDF Print',
    description: 'استخراج تقارير الأداء الأكاديمي والتوثيق والطباعة بتنسيق A4',
  },
  {
    key: 'view_analytics',
    category: 'reporting',
    labelAr: 'عرض لوحة التحليلات ومؤشرات الأداء',
    labelEn: 'View Analytics & Performance Intelligence',
    description: 'متابعة مؤشرات التوثيق الأكاديمي وتغطية المواد والأنصبة',
  },
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'operations_manager',
    nameAr: 'مدير العمليات والتشغيل',
    nameEn: 'Operations Manager',
    description: 'صلاحيات كاملة وغير مقيدة لإدارة كافة العمليات والجداول والمستخدمين والتقارير والسياسات.',
    permissions: SYSTEM_PERMISSIONS.map((p) => p.key),
    isSystem: true,
  },
  {
    id: 'teacher',
    nameAr: 'معلم / عضو هيئة التدريس',
    nameEn: 'Teacher',
    description: 'صلاحيات محددة لبوابة التدريس: عرض الجدول الأسبوعي، توثيق الحصص، تسجيل الملازم، ومتابعة النصاب الشخصي.',
    permissions: [
      'view_dashboard',
      'record_lesson',
      'edit_teaching_record',
      'view_teaching_load',
      'view_lesson_materials',
      'export_data',
    ],
    isSystem: true,
  },
  {
    id: 'parent',
    nameAr: 'أولياء الأمور (الحساب الموحد)',
    nameEn: 'Parents Portal',
    description: 'صلاحيات استعراض تعليمية فقط: متابعة ما تم تدريسه أسبوعياً، جدول الأبناء، والاطلاع على روابط الملازم المصرح بها.',
    permissions: [
      'view_dashboard',
      'view_lesson_materials',
    ],
    isSystem: true,
  },
];
