/**
 * Gestor de Sesión Médica Segura
 * 
 * Regla de negocio estricta (Seguridad y Confidencialidad Médica):
 * - Cada vez que se entra o se abre la app en cualquier dispositivo (teléfono o PC),
 *   se debe solicitar obligatoriamente Correo y Clave para acceder.
 * - La sesión activa se mantiene únicamente en sessionStorage durante el uso continuo.
 * - Al cerrar la app, cerrar la pestaña o abrir la aplicación nuevamente, la sesión
 *   inicia bloqueada para garantizar que nadie pueda ver información médica sin autenticarse.
 */

export const SESSION_STORAGE_KEY = 'digital_medic_active_doctor_session';

/**
 * Detecta si la aplicación se está ejecutando como APK de Android o PWA instalada
 */
export function isApkOrStandaloneEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isWebView = (/wv/i.test(ua) || /Version\/[\d.]+/i.test(ua)) && isAndroid;
  const isCapacitor = !!(window as any).Capacitor;
  const isCordova = !!(window as any).cordova;
  const isAndroidApkFlag = (window as any).isAndroidApk === true;
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true;

  let isUrlParamApk = false;
  try {
    const params = new URLSearchParams(window.location.search);
    isUrlParamApk = params.get('platform') === 'apk' || params.get('apk') === 'true';
  } catch (e) {}

  return isWebView || isCapacitor || isCordova || isAndroidApkFlag || (isAndroid && isStandalone) || isUrlParamApk;
}

/**
 * Obtiene el ID de la sesión médica activa:
 * Lee EXCLUSIVAMENTE de sessionStorage para que cada vez que se ingrese a la app
 * se deba solicitar correo y clave por seguridad médica.
 */
export function getStoredDoctorSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Limpieza de cualquier sesión persistente anterior en localStorage para forzar login
    if (localStorage.getItem(SESSION_STORAGE_KEY)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStored) return sessionStored;
  } catch (e) {}
  return null;
}

/**
 * Guarda la sesión del médico autenticado en sessionStorage durante la sesión activa actual.
 */
export function storeDoctorSessionId(doctorId: string): void {
  if (typeof window === 'undefined' || !doctorId) return;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, doctorId);
    // Eliminar de localStorage para que al cerrar el navegador o app en el teléfono, pida credenciales de nuevo
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Cierra la sesión activa borrándola de todos los almacenamientos cuando el usuario hace clic en 'Cerrar Sesión'.
 */
export function clearDoctorSessionId(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem('digital_medic_vip');
    sessionStorage.removeItem('digital_medic_unlocked_2534');
    sessionStorage.removeItem('digital_medic_master_admin');
  } catch (e) {}
}
