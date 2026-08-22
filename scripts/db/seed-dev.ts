/**
 * Development Seed Script: EBDA EDU
 * Populates sample development data ONLY for local developer testing.
 * NEVER RUN THIS IN PRODUCTION.
 */

import fs from 'fs';
import path from 'path';

console.log('🌱 [DEV SEED] Generating local development seed fixtures...');

if (process.env.NODE_ENV === 'production') {
  console.error('⛔ SAFETY TRIGGER: Cannot run dev seed in production environment!');
  process.exit(1);
}

const devSeedData = {
  version: '1.0.0-dev',
  timestamp: new Date().toISOString(),
  environment: 'development',
  sampleSchool: {
    id: 'badr',
    nameAr: 'مدرسة ابدأ – بدر للعلوم والتكنولوجيا التطبيقية',
    code: 'EBDA-BDR-01',
  },
  sampleTeachers: [
    { id: 'dev-t1', name: 'م. أحمد خالد', code: 'TCH-001', specialization: 'تكنولوجيا المعلومات', targetWeeklyLessons: 25 },
    { id: 'dev-t2', name: 'م. سارة محمود', code: 'TCH-002', specialization: 'التحكم الآلي', targetWeeklyLessons: 20 },
  ],
  sampleSubjects: [
    { id: 'dev-sub1', code: 'NET-101', nameAr: 'شبكات الحاسب المتقدمة', weeklyLessons: 4 },
    { id: 'dev-sub2', code: 'AUT-101', nameAr: 'المتحكمات الدقيقة PLC', weeklyLessons: 4 },
  ],
};

const outputPath = path.join(process.cwd(), 'scripts', 'db', 'dev-seed-output.json');
fs.writeFileSync(outputPath, JSON.stringify(devSeedData, null, 2), 'utf-8');

console.log(`✅ [DEV SEED] Sample development data generated at: ${outputPath}`);
console.log('📌 Reminder: Production builds will always start with 0 operational records.');
