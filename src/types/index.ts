export type UserRole = 'operations_manager' | 'teacher' | 'parent';

export type PermissionKey =
  | 'view_dashboard'
  | 'manage_teachers'
  | 'manage_subjects'
  | 'manage_grades'
  | 'manage_classes'
  | 'manage_timetable'
  | 'manage_labs'
  | 'manage_workshops'
  | 'record_lesson'
  | 'edit_teaching_record'
  | 'view_teaching_load'
  | 'view_lesson_materials'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_settings'
  | 'import_excel'
  | 'export_data'
  | 'view_reports'
  | 'view_analytics'
  | 'manage_academic_years';

export interface PermissionDefinition {
  key: PermissionKey;
  category: 'operations' | 'academic' | 'resources' | 'system' | 'reporting';
  labelAr: string;
  labelEn: string;
  description: string;
}

export interface RoleDefinition {
  id: UserRole;
  nameAr: string;
  nameEn: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  teacherId?: string;
  status: 'active' | 'disabled';
  passwordHash?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface School {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  logoText: string;
  isActive: boolean;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2025/2026"
  term: string; // e.g. "الفصل الدراسي الثاني"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Teacher {
  id: string;
  code: string;
  name: string;
  specialization: string; // e.g. "رياضيات تطبيقية", "ميكاترونكس"
  department?: string; // "العلوم الهندسية", "العلوم الأساسية", "اللغات", "التكنولوجيا التطبيقية"
  email?: string;
  phone?: string;
  phoneNumber?: string;
  targetWeeklyLessons: number; // e.g. 20 (equals 20 hours at 60 min/lesson)
  active: boolean;
  avatar?: string;
  joinDate?: string;
  schoolId: string;
}

export interface Subject {
  id: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  gradeId: string;
  weeklyLessonsRequired?: number; // required lessons per week per class
  weeklyLessonsTarget?: number;
  department?: string;
  category?: 'core' | 'technical' | 'language' | 'applied';
  color?: string; // hex or tailwind identifier
  isPractical?: boolean; // requires lab or workshop
  preferredLocationType?: 'classroom' | 'lab' | 'workshop';
  schoolId: string;
}

export interface Grade {
  id: string;
  code: string;
  nameAr: string; // "الصف الأول الثانوي التطبيقي", "الصف الثاني", "الصف الثالث"
  level: number; // 1, 2, 3
  schoolId: string;
}

export interface SchoolClass {
  id: string;
  code: string; // "1/1", "1/2", "2/1", etc.
  nameAr: string;
  gradeId: string;
  studentCount: number;
  roomNumber: string;
  schoolId: string;
}

export interface Lab {
  id: string;
  code: string;
  nameAr: string;
  type?: 'computer' | 'electronics' | 'science' | 'mechatronics' | 'robotics';
  capacity?: number;
  location?: string;
  inChargeEngineer?: string;
  equipmentSummary?: string;
  schoolId: string;
}

export interface Workshop {
  id: string;
  code: string;
  nameAr: string;
  specialization?: 'mechanical' | 'electrical' | 'logistics' | 'renewable_energy' | 'cnc';
  capacity?: number;
  location?: string;
  inChargeEngineer?: string;
  equipmentSummary?: string;
  schoolId: string;
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';

export type BreakType = 'break' | 'lunch' | 'activity' | 'assembly' | 'non_teaching';

export interface SchoolBreak {
  id: string;
  name: string; // e.g. "فسحة الصباح (Morning Break)", "استراحة الغداء (Lunch)"
  type: BreakType;
  startTime: string; // "10:00"
  endTime: string; // "10:20"
  durationMinutes: number; // calculated: End Time - Start Time
  daysOfWeek: DayOfWeek[]; // ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  status: 'active' | 'disabled';
  schoolId: string;
  notes?: string;
}

export interface TimeSlot {
  slotIndex: number; // 1 to 6
  nameAr: string; // "الحصة الأولى"
  startTime: string; // "08:00"
  endTime: string; // "09:00"
  durationMinutes: number; // 60
  isBreak?: boolean;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  academicYearId: string;
  dayOfWeek: DayOfWeek;
  slotIndex: number; // 1 to 6
  startTime: string;
  endTime: string;
  durationMinutes: number; // 60
  gradeId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  locationType: 'classroom' | 'lab' | 'workshop';
  labId?: string;
  workshopId?: string;
  roomName?: string;
}

export type LessonStatus = 'completed' | 'partially_completed' | 'not_completed';

export interface LessonAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface TeachingRecord {
  id: string;
  timetableSlotId?: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  slotIndex: number;
  startTime: string;
  endTime: string;
  durationMinutes: number; // 60
  teacherId: string;
  subjectId: string;
  gradeId: string;
  classId: string;
  locationType: 'classroom' | 'lab' | 'workshop';
  labId?: string;
  workshopId?: string;
  roomName?: string;
  lessonTopic: string;
  unitModule?: string;
  lessonStatus: LessonStatus;
  notCompletedReason?: string;
  materialsUrl?: string; // Google Drive, OneDrive, Docs, LMS
  attachments?: LessonAttachment[];
  teacherNotes?: string;
  parentVisibility: boolean; // default true
  recordedAt: string;
  lastUpdatedAt?: string;
  isUnscheduledExtra?: boolean;
  extraLessonReason?: string;
}

export interface TeacherWorkloadSummary {
  teacherId: string;
  teacherName: string;
  specialization: string;
  targetWeeklyHours: number;
  actualScheduledHours: number;
  completedLessonsCount: number;
  documentationRate: number;
  materialsCoverageRate: number;
  workloadStatus: 'balanced' | 'overloaded' | 'underloaded';
}

export interface CurriculumUnit {
  id: string;
  subjectId: string;
  gradeId: string;
  unitNumber: number;
  unitTitle: string;
  plannedLessonsCount: number;
  description: string;
  topics: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action?: 'create' | 'update' | 'delete' | 'resolve_alert' | string;
  actionType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'APPROVE' | 'EXPORT' | 'IMPORT' | 'LOGIN' | 'RECORD_LESSON';
  entityType: 'teacher' | 'subject' | 'timetable' | 'teaching_record' | 'user' | 'lab' | 'workshop' | 'class' | 'grade' | 'settings' | 'curriculum' | string;
  entityId?: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  lessonDurationMinutes: number; // 60
  schoolStartTime: string; // "08:00"
  requireMaterialsLink: boolean;
  defaultParentVisibility: boolean;
  currentAcademicYear: string;
  currentTerm: string;
  allowExtraLessons: boolean;
  maxUploadSizeMB: number;
  activeSchoolId: string;
}

export interface TimetableConflict {
  id: string;
  type: 'teacher' | 'class' | 'lab' | 'workshop' | 'break';
  dayOfWeek: DayOfWeek;
  slotIndex: number;
  timeRange: string;
  description: string;
  slot1: TimetableSlot;
  slot2?: TimetableSlot;
  conflictingBreak?: SchoolBreak;
  suggestion: string;
}

export interface SmartAlert {
  id: string;
  type: 'conflict' | 'missing_record' | 'materials_missing' | 'overload' | 'underload' | 'curriculum_delay' | 'operational';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  targetRole?: UserRole;
  teacherId?: string;
  slotId?: string;
}
