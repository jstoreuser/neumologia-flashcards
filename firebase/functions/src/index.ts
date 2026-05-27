/**
 * Cloud Functions — index.ts
 *
 * Central export point. All functions are exported from here.
 * Only add a function here when it is ready for deployment.
 */

export { createUserProfile } from './auth/on-create';
export { setAdminRole } from './admin/set-admin';
