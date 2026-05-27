import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseApp } from 'firebase/app';

/**
 * Initializes Firebase App Check with ReCaptcha Enterprise.
 * Blocks unauthorized access from automated scripts or malicious clients
 * at the infrastructure level (Firestore/Functions).
 */
export function initAppCheck(app: FirebaseApp) {
  if (import.meta.env.MODE === 'development') {
    // Allows local emulators to bypass App Check
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Replace with actual ReCaptcha v3 Enterprise Site Key
  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'dummy_key';

  return initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}
