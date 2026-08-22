/**
 * Schema & Relational Integrity Validator: EBDA EDU
 * Verifies that initial types, permissions, roles, and schools conform to relational constraints.
 */

import {
  INITIAL_SCHOOLS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_GRADES,
  INITIAL_USERS,
  INITIAL_ROLES,
  SYSTEM_PERMISSIONS,
  INITIAL_SETTINGS,
} from '../../src/data/initialData';

console.log('🔍 [SCHEMA VALIDATION] Checking relational integrity...');

let errors: string[] = [];

// 1. Validate Schools
if (INITIAL_SCHOOLS.length === 0) {
  errors.push('At least one active school branch must exist.');
}

// 2. Validate Academic Years
const activeYear = INITIAL_ACADEMIC_YEARS.find((y) => y.isCurrent);
if (!activeYear) {
  errors.push('No current active academic year specified.');
}

// 3. Validate Settings
if (INITIAL_SETTINGS.lessonDurationMinutes !== 60) {
  errors.push('Standard lesson duration must be set to 60 minutes.');
}

// 4. Validate Role Permissions
const allPermissionKeys = new Set(SYSTEM_PERMISSIONS.map((p) => p.key));
for (const role of INITIAL_ROLES) {
  for (const perm of role.permissions) {
    if (!allPermissionKeys.has(perm)) {
      errors.push(`Role ${role.id} references undefined permission key: ${perm}`);
    }
  }
}

// 5. Validate Zero Operational Records Baseline
if (INITIAL_USERS.length < 1) {
  errors.push('Administrative account must exist.');
}

if (errors.length > 0) {
  console.error('❌ Schema Validation Failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('✅ [SCHEMA VALIDATION] All relational integrity rules and constraints verified successfully.');
  process.exit(0);
}
