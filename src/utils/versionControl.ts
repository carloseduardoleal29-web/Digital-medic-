/**
 * Sistema de Control de Versiones y Limpieza de Caché
 * Garantiza que la aplicación nunca se quede congelada con datos o scripts obsoletos
 * al desplegar nuevas versiones o al abrir desde APK / PWA.
 */

export const CURRENT_APP_VERSION = '2.6.0';
export const APP_BUILD_DATE = '2026-10-01';
const VERSION_STORAGE_KEY = 'digital_medic_app_version';

export interface VersionCheckResult {
  isNewVersion: boolean;
  previousVersion: string | null;
  currentVersion: string;
}

/**
 * Comprueba la versión actual contra la versión guardada en el dispositivo.
 * Si detecta una nueva versión, invalida cachés de navegador antiguos
 * y limpia cualquier dato privado residual de pruebas anteriores.
 */
export function checkAndApplyVersionUpdate(): VersionCheckResult {
  try {
    // Limpieza de datos privados residuales en el almacenamiento local del navegador
    localStorage.removeItem('digital_medic_payment_config');
    localStorage.removeItem('digital_medic_payment_accounts_v1');

    // Limpieza de perfiles residuales que contengan correos o datos personales
    const savedColleagues = localStorage.getItem('digital_medic_colleagues_v2');
    if (savedColleagues) {
      try {
        const parsed = JSON.parse(savedColleagues);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter((d: any) => 
            !d.email?.includes('carloseduardoleal29') && 
            !d.doctorName?.includes('Carlos E. Leal')
          );
          localStorage.setItem('digital_medic_colleagues_v2', JSON.stringify(sanitized));
        }
      } catch (_) {}
    }

    const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    
    if (!savedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
      return {
        isNewVersion: false,
        previousVersion: null,
        currentVersion: CURRENT_APP_VERSION
      };
    }

    if (savedVersion !== CURRENT_APP_VERSION) {
      console.log(`[VersionControl] Actualización detectada: v${savedVersion} -> v${CURRENT_APP_VERSION}`);
      
      // Limpiar cachés de ServiceWorker / Cache Storage si están disponibles
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((name) => {
            caches.delete(name);
          });
        }).catch(() => {});
      }

      // Actualizar la versión guardada
      localStorage.setItem(VERSION_STORAGE_KEY, CURRENT_APP_VERSION);

      return {
        isNewVersion: true,
        previousVersion: savedVersion,
        currentVersion: CURRENT_APP_VERSION
      };
    }
  } catch (e) {
    console.warn('[VersionControl] Error verificando versiones:', e);
  }

  return {
    isNewVersion: false,
    previousVersion: CURRENT_APP_VERSION,
    currentVersion: CURRENT_APP_VERSION
  };
}

/**
 * Fuerza una recarga limpia asegurando que el navegador no use recursos en memoria
 */
export function forceFreshReload() {
  if (typeof window === 'undefined') return;
  const win = window;
  if ('caches' in win && win.caches) {
    win.caches.keys().then((names) => {
      Promise.all(names.map((name) => win.caches.delete(name))).finally(() => {
        win.location.reload();
      });
    }).catch(() => {
      win.location.reload();
    });
  } else {
    win.location.reload();
  }
}
