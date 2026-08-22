/**
 * EBDA EDU — Centralized Business Rules & Domain Calculation Engine
 * Single Source of Truth for core operational rules across the entire platform.
 */

import { TimetableSlot, TeachingRecord, PermissionKey, User, SchoolBreak, DayOfWeek } from '../types';

export const WEEKLY_TEACHING_LOAD = 25; // 25 Lessons = 25 Hours

export const SYSTEM_DEFAULTS = {
  LESSON_DURATION_MINUTES: 60, // STRICT STANDARD: 60 Minutes per lesson session
  TARGET_WEEKLY_LESSONS: 25,   // Standard: 25 Lessons = 25 Hours (1 lesson = 60 min = 1 hour)
  LESSONS_PER_DAY: 6,
  SCHOOL_START_TIME: '08:00',
  SCHOOL_END_TIME: '14:30',
  MAX_UPLOAD_SIZE_MB: 50,
};

/**
 * Calculates duration in minutes between two "HH:MM" timestamps.
 * Returns -1 if endTime is earlier than or equal to startTime or invalid.
 */
export function calculateBreakDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return -1;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return -1;
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (endMinutes <= startMinutes) return -1;
  return endMinutes - startMinutes;
}

/**
 * Validates a SchoolBreak definition.
 */
export function validateBreak(breakItem: Partial<SchoolBreak>): { isValid: boolean; error?: string } {
  if (!breakItem.name || !breakItem.name.trim()) {
    return { isValid: false, error: 'يرجى إدخال اسم الاستراحة / الفسحة (Please enter break name)' };
  }
  if (!breakItem.startTime || !breakItem.endTime) {
    return { isValid: false, error: 'يرجى تحديد وقت البدء ووقت الانتهاء (Please specify start and end times)' };
  }
  const duration = calculateBreakDuration(breakItem.startTime, breakItem.endTime);
  if (duration <= 0) {
    return {
      isValid: false,
      error: 'وقت انتهاء الاستراحة يجب أن يكون بعد وقت البدء (End time must be strictly after start time)',
    };
  }
  if (!breakItem.daysOfWeek || breakItem.daysOfWeek.length === 0) {
    return { isValid: false, error: 'يرجى اختيار يوم دراسي واحد على الأقل للاستراحة (Please select at least one day)' };
  }
  return { isValid: true };
}

/**
 * Checks if a given time slot overlaps with any active school break on that day.
 */
export function isSlotOverlappingBreak(
  slot: { dayOfWeek: DayOfWeek; startTime: string; endTime: string },
  breaks: SchoolBreak[]
): { hasConflict: boolean; conflictingBreak?: SchoolBreak } {
  const activeBreaks = breaks.filter(
    (b) => b.status === 'active' && b.daysOfWeek.includes(slot.dayOfWeek)
  );

  for (const b of activeBreaks) {
    // Time interval overlap: slot.startTime < b.endTime && slot.endTime > b.startTime
    if (slot.startTime < b.endTime && slot.endTime > b.startTime) {
      return { hasConflict: true, conflictingBreak: b };
    }
  }

  return { hasConflict: false };
}

/**
 * Calculates teacher workload statistics using standard 60-minute duration.
 * Number of Lessons × Lesson Duration = Total Teaching Hours.
 * Standard weekly load = 25 Lessons = 25 Hours.
 */
export function calculateTeacherWorkload(
  teacherId: string,
  targetWeeklyLessons: number = SYSTEM_DEFAULTS.TARGET_WEEKLY_LESSONS,
  timetableSlots: TimetableSlot[],
  teachingRecords: TeachingRecord[],
  lessonDurationMinutes: number = SYSTEM_DEFAULTS.LESSON_DURATION_MINUTES
) {
  const teacherSlots = timetableSlots.filter((s) => s.teacherId === teacherId);
  const scheduledLessons = teacherSlots.length;
  
  // Delivered lessons with completed or partial records
  const teacherRecords = teachingRecords.filter((r) => r.teacherId === teacherId);
  const deliveredLessons = teacherRecords.filter((r) => r.lessonStatus === 'completed').length;
  const partiallyDelivered = teacherRecords.filter((r) => r.lessonStatus === 'partially_completed').length;
  const notCompleted = teacherRecords.filter((r) => r.lessonStatus === 'not_completed').length;
  const totalRecorded = teacherRecords.length;

  const targetLessons = targetWeeklyLessons > 0 ? targetWeeklyLessons : SYSTEM_DEFAULTS.TARGET_WEEKLY_LESSONS;
  const targetHours = (targetLessons * lessonDurationMinutes) / 60;
  const scheduledHours = (scheduledLessons * lessonDurationMinutes) / 60;
  const deliveredHours = (deliveredLessons * lessonDurationMinutes) / 60;

  const varianceLessons = scheduledLessons - targetLessons;
  const varianceHours = scheduledHours - targetHours;
  const achievementPercentage = targetLessons > 0 
    ? Math.round((scheduledLessons / targetLessons) * 1000) / 10 
    : 0;

  const documentationPercentage = scheduledLessons > 0
    ? Math.round((totalRecorded / scheduledLessons) * 1000) / 10
    : 0;

  const recordsWithMaterials = teacherRecords.filter((r) => !!r.materialsUrl && r.materialsUrl.trim() !== '').length;
  const materialsCoverageRate = totalRecorded > 0
    ? Math.round((recordsWithMaterials / totalRecorded) * 100)
    : 0;

  return {
    teacherId,
    targetLessons,
    targetHours,
    scheduledLessons,
    scheduledHours,
    deliveredLessons,
    deliveredHours,
    partiallyDelivered,
    notCompleted,
    totalRecorded,
    varianceLessons,
    varianceHours,
    achievementPercentage,
    documentationPercentage,
    materialsCoverageRate,
    isOverloaded: scheduledLessons > targetLessons + 2,
    isUnderloaded: scheduledLessons < targetLessons - 1,
    isOptimal: scheduledLessons >= targetLessons - 1 && scheduledLessons <= targetLessons + 2,
  };
}

/**
 * Validates lesson materials link.
 * Supports Google Drive, Google Docs, OneDrive, SharePoint, Dropbox, Google Classroom, LMS, or any valid HTTP/HTTPS URL.
 */
export function validateMaterialsUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'يرجى إدخال رابط المواد التعليمية (Please enter a valid lesson materials URL)' };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, error: 'رابط المواد التعليمية لا يمكن أن يكون فارغاً (Materials URL cannot be empty)' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'صيغة الرابط غير صحيحة. يجب أن يبدأ الرابط بـ https:// أو http:// (URL must start with https:// or http://)' 
      };
    }
    // Hostname must be valid
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { 
        isValid: false, 
        error: 'يرجى إدخال رابط صالح للمواد التعليمية مثل Google Drive أو OneDrive (Please enter a valid lesson materials URL)' 
      };
    }
    return { isValid: true };
  } catch {
    return { 
      isValid: false, 
      error: 'يرجى إدخال رابط صالح للمواد التعليمية مثل Google Drive أو OneDrive (Please enter a valid lesson materials URL)' 
    };
  }
}

/**
 * Filters teaching records for parent visibility.
 * Strictly enforces that parents only view records where parentVisibility is true and not incomplete.
 */
export function getParentVisibleRecords(
  records: TeachingRecord[],
  userRole: string
): TeachingRecord[] {
  if (userRole === 'parent') {
    return records.filter((r) => r.parentVisibility === true && r.lessonStatus !== 'not_completed');
  }
  return records;
}

/**
 * Checks if a user has a specific permission based on role and custom permissions.
 */
export function hasPermission(
  user: User | null | undefined,
  requiredPermission: PermissionKey,
  rolePermissionsMap: Record<string, PermissionKey[]>
): boolean {
  if (!user || user.status === 'disabled') {
    return false;
  }

  // Operations Manager has full operational permissions
  if (user.role === 'operations_manager') {
    return true;
  }

  const grantedPermissions = rolePermissionsMap[user.role] || [];
  return grantedPermissions.includes(requiredPermission);
}
