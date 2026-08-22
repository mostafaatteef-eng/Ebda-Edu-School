import { TimetableSlot, TimetableConflict, Teacher, SchoolClass, Lab, Workshop, Subject, SchoolBreak } from '../types';

export function detectTimetableConflicts(
  slots: TimetableSlot[],
  teachers: Teacher[],
  classes: SchoolClass[],
  labs: Lab[],
  workshops: Workshop[],
  subjects: Subject[],
  breaks: SchoolBreak[] = []
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const labMap = new Map(labs.map((l) => [l.id, l]));
  const wsMap = new Map(workshops.map((w) => [w.id, w]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // 1. Check conflicts between teaching slots and school breaks
  const activeBreaks = breaks.filter((b) => b.status === 'active');
  for (const slot of slots) {
    for (const brk of activeBreaks) {
      if (brk.daysOfWeek.includes(slot.dayOfWeek)) {
        // Overlap: slot.startTime < brk.endTime && slot.endTime > brk.startTime
        if (slot.startTime < brk.endTime && slot.endTime > brk.startTime) {
          const dayAr = getArabicDayName(slot.dayOfWeek);
          const cl = classMap.get(slot.classId);
          const sub = subjectMap.get(slot.subjectId);
          const timeRange = `${slot.startTime} - ${slot.endTime}`;

          conflicts.push({
            id: `conflict-break-${slot.id}-${brk.id}`,
            type: 'break',
            dayOfWeek: slot.dayOfWeek,
            slotIndex: slot.slotIndex,
            timeRange,
            description: `تعارض مع فترة استراحة معتمدة: الحصة الدراسية (${sub?.nameAr || 'المادة'} - فصل ${cl?.code || slot.classId}) المقررة الساعة ${timeRange} تتداخل مع فترة (${brk.name}) من ${brk.startTime} إلى ${brk.endTime} يوم ${dayAr}. لا يمكن جدولة حصص أثناء الاستراحة.`,
            slot1: slot,
            conflictingBreak: brk,
            suggestion: `يرجى تعديل توقيت الحصة الدراسية لتبدأ بعد انتهاء الاستراحة في ${brk.endTime} أو تنتهي قبل ${brk.startTime}.`,
          });
        }
      }
    }
  }

  // 2. Check conflicts between slots
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const s1 = slots[i];
      const s2 = slots[j];

      // Must be same day and slot index (or overlapping time)
      if (s1.dayOfWeek !== s2.dayOfWeek || s1.slotIndex !== s2.slotIndex) {
        continue;
      }

      const timeRange = `${s1.startTime} - ${s1.endTime}`;
      const dayAr = getArabicDayName(s1.dayOfWeek);

      // 1. Teacher Conflict
      if (s1.teacherId === s2.teacherId && s1.teacherId) {
        const teacher = teacherMap.get(s1.teacherId);
        const c1 = classMap.get(s1.classId);
        const c2 = classMap.get(s2.classId);
        const sub1 = subjectMap.get(s1.subjectId);
        const sub2 = subjectMap.get(s2.subjectId);

        conflicts.push({
          id: `conflict-teacher-${s1.id}-${s2.id}`,
          type: 'teacher',
          dayOfWeek: s1.dayOfWeek,
          slotIndex: s1.slotIndex,
          timeRange,
          description: `تعارض في جدول المعلم: المعلم (${teacher?.name || 'غير معروف'}) لديه حصتان متزامنتان في يوم ${dayAr} الساعة ${timeRange} مع فصل (${c1?.code || s1.classId} - مادة ${sub1?.nameAr || ''}) ومع فصل (${c2?.code || s2.classId} - مادة ${sub2?.nameAr || ''}).`,
          slot1: s1,
          slot2: s2,
          suggestion: `قم بنقل إحدى الحصتين إلى فترة زمنية أخرى أو تعيين معلم بديل لمادة ${sub2?.nameAr || ''}.`,
        });
      }

      // 2. Class Conflict
      if (s1.classId === s2.classId && s1.classId) {
        const cl = classMap.get(s1.classId);
        const sub1 = subjectMap.get(s1.subjectId);
        const sub2 = subjectMap.get(s2.subjectId);

        conflicts.push({
          id: `conflict-class-${s1.id}-${s2.id}`,
          type: 'class',
          dayOfWeek: s1.dayOfWeek,
          slotIndex: s1.slotIndex,
          timeRange,
          description: `تعارض في جدول الفصل: الفصل (${cl?.nameAr || cl?.code || s1.classId}) مخصص له مادتان في نفس التوقيت (${sub1?.nameAr || ''} و ${sub2?.nameAr || ''}) يوم ${dayAr} الساعة ${timeRange}.`,
          slot1: s1,
          slot2: s2,
          suggestion: `إلغاء أو إعادة جدولة إحدى الحصتين لتجنب تكرار حجز الطلاب في فترتين في آن واحد.`,
        });
      }

      // 3. Lab Conflict
      if (
        s1.locationType === 'lab' &&
        s2.locationType === 'lab' &&
        s1.labId &&
        s2.labId &&
        s1.labId === s2.labId
      ) {
        const lab = labMap.get(s1.labId);
        const c1 = classMap.get(s1.classId);
        const c2 = classMap.get(s2.classId);

        conflicts.push({
          id: `conflict-lab-${s1.id}-${s2.id}`,
          type: 'lab',
          dayOfWeek: s1.dayOfWeek,
          slotIndex: s1.slotIndex,
          timeRange,
          description: `تعارض في حجز المعمل: (${lab?.nameAr || s1.labId}) محجوز لفصلين مختلفين (${c1?.code} و ${c2?.code}) في نفس الموعد يوم ${dayAr} الساعة ${timeRange}.`,
          slot1: s1,
          slot2: s2,
          suggestion: `تحويل إحدى المجموعات إلى معمل بديل أو تبديل الحصة بحصة نظرية في الفصل.`,
        });
      }

      // 4. Workshop Conflict
      if (
        s1.locationType === 'workshop' &&
        s2.locationType === 'workshop' &&
        s1.workshopId &&
        s2.workshopId &&
        s1.workshopId === s2.workshopId
      ) {
        const ws = wsMap.get(s1.workshopId);
        const c1 = classMap.get(s1.classId);
        const c2 = classMap.get(s2.classId);

        conflicts.push({
          id: `conflict-workshop-${s1.id}-${s2.id}`,
          type: 'workshop',
          dayOfWeek: s1.dayOfWeek,
          slotIndex: s1.slotIndex,
          timeRange,
          description: `تعارض في حجز الورشة: (${ws?.nameAr || s1.workshopId}) مستخدمة في نفس الوقت من فصلين (${c1?.code} و ${c2?.code}) يوم ${dayAr} الساعة ${timeRange}.`,
          slot1: s1,
          slot2: s2,
          suggestion: `إعادة تنسيق مواعيد التدريب العملي في الورش الصناعية.`,
        });
      }
    }
  }

  return conflicts;
}

export function getArabicDayName(day: string): string {
  const map: Record<string, string> = {
    Sunday: 'الأحد',
    Monday: 'الإثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
  };
  return map[day] || day;
}
