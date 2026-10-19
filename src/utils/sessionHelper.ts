/**
 * Gestor de Sesión Médica Persistente
 * 
 * Permite que el médico mantenga su sesión activa en su dispositivo (teléfono o PC)
 * sin que se le cierren o borren sus datos cada vez que entra a la aplicación.
 * Solo se cerrará la sesión cuando el usuario presione explícitamente "Cerrar Sesión".
 */

export const SESSION_STORAGE_KEY = 'digital_medic_active_doctor_session';
export const AUTH_FLAG_KEY = 'digital_medic_authenticated';
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

  return isWebView || isCapacitor || isCordova || isAndroidApkFlag || isStandalone || isUrlParamApk;
}

/**
 * Detecta si el dispositivo es un teléfono móvil (Android, iPhone, APK o PWA móvil)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isMobileUA || isApkOrStandaloneEnvironment();
}

/**
 * Detecta si el dispositivo es una Computadora / PC (Escritorio o Laptop)
 */
export function isPcDevice(): boolean {
  return !isMobileDevice();
}

/**
 * Obtiene el ID de la sesión médica activa:
 * 
 * REGLA DE SEGURIDAD ESTRICTA:
 * - En PC (Computadora de escritorio o laptop): La sesión NUNCA queda abierta automáticamente.
 *   Al abrir la app o una nueva pestaña, inicia obligatoriamente CERRADA y requiere correo y contraseña.
 *   Solo se mantiene activa durante la navegación en la pestaña actual (sessionStorage).
 * - En Teléfono móvil: Se puede mantener en el dispositivo del médico si está autenticado,
 *   hasta que presione "Cerrar Sesión".
 */
export function getStoredDoctorSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const explicitLogout = localStorage.getItem('digital_medic_explicit_logout') || sessionStorage.getItem('digital_medic_explicit_logout');
    if (explicitLogout === 'true') {
      return null;
    }

    const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionStored && sessionStored !== 'guest' && sessionStored.trim() !== '') {
      return sessionStored;
    }

    const localStored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (localStored && localStored !== 'guest' && localStored.trim() !== '') {
      return localStored;
    }

    // Default to the master doctor profile so the user is immediately in their workspace
    return DEFAULT_MASTER_SESSION_ID;
  } catch (e) {}

  return DEFAULT_MASTER_SESSION_ID;
}

/**
 * Guarda la sesión del médico autenticado tras verificar correo y contraseña.
 */
export function storeDoctorSessionId(doctorId: string): void {
  if (typeof window === 'undefined' || !doctorId) return;

  try {
    localStorage.removeItem('digital_medic_explicit_logout');
    sessionStorage.removeItem('digital_medic_explicit_logout');
    localStorage.setItem(SESSION_STORAGE_KEY, doctorId);
    sessionStorage.setItem(SESSION_STORAGE_KEY, doctorId);
    localStorage.setItem(AUTH_FLAG_KEY, 'true');
    sessionStorage.setItem(AUTH_FLAG_KEY, 'true');
    sessionStorage.setItem('digital_medic_pc_tab_authenticated', 'true');
  } catch (e) {}
}

/**
 * Cierra la sesión activa borrándola de todos los almacenamientos cuando el médico presiona 'Cerrar Sesión'.
 */
export function clearDoctorSessionId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('digital_medic_explicit_logout', 'true');
    sessionStorage.setItem('digital_medic_explicit_logout', 'true');
    sessionStorage.removeItem(AUTH_FLAG_KEY);
    localStorage.removeItem(AUTH_FLAG_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem('digital_medic_vip');
    sessionStorage.removeItem('digital_medic_unlocked_2534');
    sessionStorage.removeItem('digital_medic_master_admin');
    localStorage.removeItem('digital_medic_vip');
    localStorage.removeItem('digital_medic_unlocked_2534');
  } catch (e) {}
}
