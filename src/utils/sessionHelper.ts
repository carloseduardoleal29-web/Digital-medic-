/**
 * Gestor de Sesión Médica Persistente
 * 
 * Permite que el médico mantenga su sesión activa en su dispositivo (teléfono o PC)
 * sin que se le cierren o borren sus datos cada vez que entra a la aplicación.
 * Solo se cerrará la sesión cuando el usuario presione explícitamente "Cerrar Sesión".
 */

export const SESSION_STORAGE_KEY = 'digital_medic_active_doctor_session';
export const DEFAULT_MASTER_SESSION_ID = 'carloseduardoleal29@gmail.com';

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
 * Lee de localStorage (o sessionStorage como respaldo) para mantener la sesión
 * activa entre reaperturas de la app o recargas del navegador.
 * Si es la primera apertura en una PC o teléfono, auto-conecta con la cuenta del Dr. Carlos E. Leal
 * para que el cintillo, sello y récipes estén siempre 100% sincronizados.
 */
export function getStoredDoctorSessionId(): string | null {
  if (typeof window === 'undefined') return DEFAULT_MASTER_SESSION_ID;

  try {
    const localStored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (localStored && localStored !== 'guest') return localStored;

    const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStored && sessionStored !== 'guest') {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionStored);
      return sessionStored;
    }
  } catch (e) {}

  // Auto-conectar con la sesión médica por defecto para que los módulos abran inmediatamente en cualquier dispositivo
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, DEFAULT_MASTER_SESSION_ID);
  } catch (e) {}
  return DEFAULT_MASTER_SESSION_ID;
}

/**
 * Guarda la sesión del médico autenticado de manera persistente en localStorage y sessionStorage.
 */
export function storeDoctorSessionId(doctorId: string): void {
  if (typeof window === 'undefined' || !doctorId) return;

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, doctorId);
    sessionStorage.setItem(SESSION_STORAGE_KEY, doctorId);
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
    localStorage.removeItem('digital_medic_vip');
    localStorage.removeItem('digital_medic_unlocked_2534');
  } catch (e) {}
}
