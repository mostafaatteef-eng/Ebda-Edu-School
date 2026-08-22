/**
 * Safe Development Reset Script: EBDA EDU
 * Resets development test data back to clean production baseline.
 * Contains safety guardrails against accidental execution in production.
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 [DEV RESET] Resetting local development fixtures...');

if (process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production') {
  console.error('⛔ FATAL: Cannot execute development reset in a production environment!');
  process.exit(1);
}

const seedFile = path.join(process.cwd(), 'scripts', 'db', 'dev-seed-output.json');
if (fs.existsSync(seedFile)) {
  fs.unlinkSync(seedFile);
  console.log('🗑️ Removed temporary development seed file.');
}

console.log('✅ [DEV RESET] Development workspace safely reset to clean production baseline.');
