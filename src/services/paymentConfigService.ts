/**
 * Servicio Centralizado de Métodos de Cobro y Tasa Binance del Día (Venezuela)
 * 
 * Regla de negocio estricta:
 * - Los ÚNICOS 3 métodos de cobro son:
 *   1. Pago en Bolívares (Pago Móvil / Transferencia) a Tasa Binance P2P del día en Venezuela.
 *   2. Binance Pay / USDT.
 *   3. Zinli.
 * - NO Zelle ni ningún otro método.
 * - Permite al administrador editar todas sus cuentas y fijar o consultar la tasa Binance en vivo.
 */

export interface PaymentConfig {
  pagoMovil: {
    banco: string;
    telefono: string;
    cedula: string;
    titular: string;
  };
  binance: {
    payId: string;
    email: string;
    nickname: string;
    usdtAddress: string;
    network: string;
  };
  zinli: {
    email: string;
    titular: string;
  };
  adminWhatsapp: string;
  tasaBinanceUsd: number;
  tasaFuente?: string;
  tasaUltimaActualizacion?: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  pagoMovil: {
    banco: '',
    telefono: '',
    cedula: '',
    titular: '',
  },
  binance: {
    payId: '',
    email: '',
    nickname: '',
    usdtAddress: '',
    network: 'USDT (TRC-20)',
  },
  zinli: {
    email: '',
    titular: '',
  },
  adminWhatsapp: '',
  tasaBinanceUsd: 0,
  tasaFuente: 'Binance P2P Venezuela',
  tasaUltimaActualizacion: '',
};

export function isPaymentConfigured(config?: PaymentConfig | null): boolean {
  if (!config) return false;
  const hasPm = Boolean(config.pagoMovil?.telefono?.trim() || config.pagoMovil?.banco?.trim());
  const hasBinance = Boolean(config.binance?.payId?.trim() || config.binance?.email?.trim());
  const hasZinli = Boolean(config.zinli?.email?.trim());
  return hasPm || hasBinance || hasZinli;
}

import { 
  savePaymentConfigDirectToFirestore, 
  fetchPaymentConfigDirectFromFirestore, 
  saveDirectToFirestore,
  fetchDirectFromFirestore 
} from './firebaseClient';

const LOCAL_STORAGE_KEY = 'digital_medic_payment_config_v4';

export function resolveActiveUserIdentifier(): string {
  try {
    const session = sessionStorage.getItem('digital_medic_active_doctor_session') ||
                    localStorage.getItem('digital_medic_active_doctor_session');
    if (session && session !== 'guest' && session.trim() !== '') {
      if (session.includes('@') || session.includes('.')) return session.toLowerCase().trim();
    }

    const storedActive = localStorage.getItem('digital_medic_active_colleague');
    const storedDocs = localStorage.getItem('digital_medic_colleagues_v2');
    if (storedDocs) {
      const list = JSON.parse(storedDocs);
      const doc = list.find((d: any) => d.id === storedActive) || list[0];
      if (doc?.email) return doc.email.toLowerCase().trim();
      if (doc?.ci) return doc.ci.trim();
    }
  } catch (_) {}
  return 'carloseduardoleal29@gmail.com';
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  let localConfig: PaymentConfig | null = null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        localConfig = parsed;
      }
    }
  } catch (_) {}

  // 1. Consultar PRIMERO directamente a la nube de Google Firebase Firestore (settings/payment_config)
  try {
    const fireConfig = await fetchPaymentConfigDirectFromFirestore();
    if (fireConfig && isPaymentConfigured(fireConfig)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fireConfig));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: fireConfig }));
      }
      return fireConfig;
    }
  } catch (err) {
    console.warn('[PaymentConfig] Error consultando Firestore directo:', err);
  }

  // 2. Consultar el ecosistema de la sesión activa del usuario en Firestore (ej. carloseduardoleal29@gmail.com)
  try {
    const activeUser = resolveActiveUserIdentifier();
    const userEco = await fetchDirectFromFirestore(activeUser);
    if (userEco?.paymentConfig && isPaymentConfigured(userEco.paymentConfig)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userEco.paymentConfig));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: userEco.paymentConfig }));
      }
      return userEco.paymentConfig;
    }
  } catch (err) {
    console.warn('[PaymentConfig] Error consultando ecosistema del usuario en Firestore:', err);
  }

  // 3. Consultar la API del servidor en la nube (/api/payment-config)
  try {
    const res = await fetch('/api/payment-config');
    if (res.ok) {
      const data = await res.json();
      if (data?.config && isPaymentConfigured(data.config)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.config));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: data.config }));
        }
        return data.config;
      }
    }
  } catch (err) {
    console.warn('[PaymentConfig] Could not fetch payment config from server:', err);
  }

  // 4. Si el almacenamiento local ya tiene datos configurados pero la nube no los tenía, retornar local
  if (localConfig && isPaymentConfigured(localConfig)) {
    return localConfig;
  }

  return localConfig || DEFAULT_PAYMENT_CONFIG;
}

export async function savePaymentConfig(config: PaymentConfig): Promise<boolean> {
  // 1. Guardar en local storage inmediatamente
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}

  // 2. Disparar evento para actualizar instantáneamente cualquier pantalla en este dispositivo
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('digital-medic-payment-updated', { detail: config }));
    }
  } catch (_) {}

  // 3. Guardar DIRECTO en la nube de Google Firebase Firestore (settings/payment_config)
  try {
    await savePaymentConfigDirectToFirestore(config);
  } catch (err) {
    console.warn('[PaymentConfig] Error guardando directo en Firestore settings:', err);
  }

  // 4. Guardar en el ecosistema del usuario en la nube (Firestore) para persistencia total por sesión
  try {
    const activeUser = resolveActiveUserIdentifier();
    await saveDirectToFirestore({
      identifier: activeUser,
      paymentConfig: config,
      updatedAt: Date.now(),
    });

    if (activeUser !== 'carloseduardoleal29@gmail.com') {
      await saveDirectToFirestore({
        identifier: 'carloseduardoleal29@gmail.com',
        paymentConfig: config,
        updatedAt: Date.now(),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[PaymentConfig] Error guardando en ecosistema de Firestore:', err);
  }

  // 5. Sincronizar con el servidor backend
  try {
    const res = await fetch('/api/payment-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config })
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.error('Error saving payment config to server:', err);
  }

  return true;
}

export interface LiveBinanceRateResult {
  success: boolean;
  rate: number;
  source: string;
  updatedAt: string;
}

export async function fetchLiveBinanceRate(): Promise<LiveBinanceRateResult> {
  try {
    const res = await fetch('/api/binance-rate');
    if (res.ok) {
      const data = await res.json();
      if (data?.rate && data.rate > 0) {
        return {
          success: true,
          rate: Number(data.rate),
          source: data.source || 'Binance P2P Venezuela',
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Error fetching live Binance rate:', err);
  }

  // 2. Direct client fallback if API proxy is unreachable
  try {
    const fallbackRes = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData?.promedio && Number(fbData.promedio) > 0) {
        return {
          success: true,
          rate: Math.round(Number(fbData.promedio) * 100) / 100,
          source: 'Mercado Paralelo / Binance P2P Venezuela',
          updatedAt: fbData.fechaActualizacion || new Date().toISOString()
        };
      }
    }
  } catch (err2) {
    console.warn('Fallback rate fetch failed:', err2);
  }

  return {
    success: false,
    rate: 0,
    source: 'Sin conexión a Binance',
    updatedAt: new Date().toISOString()
  };
}
