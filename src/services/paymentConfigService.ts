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

const LOCAL_STORAGE_KEY = 'digital_medic_payment_config_v4';

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  // 1. Check local storage first
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

  // 2. Fetch from server
  try {
    const res = await fetch('/api/payment-config');
    if (res.ok) {
      const data = await res.json();
      if (data?.config && isPaymentConfigured(data.config)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    console.warn('Could not fetch payment config from server, using local storage:', err);
  }

  // 3. If server returned unconfigured/empty data but local config has data, keep local config & push to server!
  if (localConfig && isPaymentConfigured(localConfig)) {
    savePaymentConfig(localConfig);
    return localConfig;
  }

  return localConfig || DEFAULT_PAYMENT_CONFIG;
}

export async function savePaymentConfig(config: PaymentConfig): Promise<boolean> {
  // Save in local storage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}

  // Sync to server
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
  return false;
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
