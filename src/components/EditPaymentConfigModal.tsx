import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Zap, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  Save, 
  ShieldCheck, 
  Info,
  DollarSign
} from 'lucide-react';
import { 
  PaymentConfig, 
  DEFAULT_PAYMENT_CONFIG, 
  fetchPaymentConfig, 
  savePaymentConfig, 
  fetchLiveBinanceRate 
} from '../services/paymentConfigService';

interface EditPaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedConfig: PaymentConfig) => void;
}

export const EditPaymentConfigModal: React.FC<EditPaymentConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateMessage, setRateMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setRateMessage(null);
      setSaveSuccess(false);
      fetchPaymentConfig()
        .then((cfg) => {
          setConfig(cfg);
          if (!cfg.tasaBinanceUsd || cfg.tasaBinanceUsd <= 0) {
            handleFetchBinanceRate();
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchBinanceRate = async () => {
    setIsFetchingRate(true);
    setRateMessage(null);
    try {
      const res = await fetchLiveBinanceRate();
      if (res && res.rate > 0) {
        setConfig((prev) => ({
          ...prev,
          tasaBinanceUsd: res.rate,
          tasaFuente: res.source,
          tasaUltimaActualizacion: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
        }));
        setRateMessage(`✓ Tasa actualizada en vivo: ${res.rate.toFixed(2)} Bs/USDT (${res.source})`);
      } else {
        setRateMessage('No se pudo obtener la tasa automática. Puede ingresarla manualmente.');
      }
    } catch (e) {
      setRateMessage('Error al consultar Binance. Puede ajustar la tasa manualmente.');
    } finally {
      setIsFetchingRate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const ok = await savePaymentConfig(config);
      setSaveSuccess(true);
      if (onSaved) onSaved(config);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configuración de Cobros Oficiales</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Editar Mis Datos de Cobro
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure sus cuentas bancarias, Binance, Zinli y la tasa de cambio del día para recibir pagos de médicos y suscriptores.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Informativo: Solo 3 Métodos de Cobro */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-cyan-300">
              Métodos de Cobro Autorizados (Solo 3):
            </div>
            <div className="text-[11px] text-slate-300 flex flex-wrap gap-2 pt-0.5">
              <span className="px-2 py-0.5 bg-blue-900/60 rounded-md border border-blue-700/50 text-blue-200 font-bold">1. Pago Móvil (Bs Tasa Binance)</span>
              <span className="px-2 py-0.5 bg-amber-900/60 rounded-md border border-amber-700/50 text-amber-200 font-bold">2. Binance Pay (USDT)</span>
              <span className="px-2 py-0.5 bg-emerald-900/60 rounded-md border border-emerald-700/50 text-emerald-200 font-bold">3. Zinli</span>
            </div>
            <p className="text-[10px] text-slate-400">
              * Sin Zelle ni comisiones internacionales. Todos los precios en bolívares se calculan exactamente a la tasa Binance del día.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECCIÓN TASA BINANCE DEL DÍA EN VENEZUELA */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border-2 border-amber-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">
                    Tasa Binance del Día (Bs / USDT - Venezuela)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Esta tasa se usa automáticamente para calcular el monto exacto en bolívares al pagar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFetchBinanceRate}
                  disabled={isFetchingRate}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Consultar tasa P2P en vivo de Binance Venezuela"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin' : ''}`} />
                  <span>{isFetchingRate ? 'Consultando...' : '⚡ Actualizar Tasa en Vivo'}</span>
                </button>

                <a
                  href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white transition-all text-xs flex items-center gap-1"
                  title="Abrir Binance P2P oficial para verificar la tasa en Venezuela"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Valor de la Tasa Binance (Bs por cada 1 USD): *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-amber-400">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={config.tasaBinanceUsd}
                    onChange={(e) => setConfig({ ...config, tasaBinanceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-black text-white font-mono focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Ej: 956.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Fuente / Nota de la Tasa:
                </label>
                <input
                  type="text"
                  value={config.tasaFuente || 'Binance P2P Venezuela'}
                  onChange={(e) => setConfig({ ...config, tasaFuente: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="Ej: Binance P2P Venezuela"
                />
              </div>
            </div>

            {rateMessage && (
              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                {rateMessage}
              </div>
            )}
          </div>

          {/* 1. SECCIÓN PAGO MÓVIL (BOLÍVARES) */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-black text-blue-300">
                1. Pago Móvil / Transferencia en Bolívares (Bs)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Banco:</label>
                <input
                  type="text"
                  value={config.pagoMovil.banco}
                  onChange={(e) => setConfig({
                    ...config,
                    pagoMovil: { ...config.pagoMovil, banco: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: Banesco (0134) o Banco de Venezuela (0102)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono Pago Móvil:</label>
                <input
                  type="text"
                  value={config.pagoMovil.telefono}
                  onChange={(e) => setConfig({
                    ...config,
                    pagoMovil: { ...config.pagoMovil, telefono: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: 0414-1234567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cédula de Identidad o RIF:</label>
                <input
                  type="text"
                  value={config.pagoMovil.cedula}
                  onChange={(e) => setConfig({
                    ...config,
                    pagoMovil: { ...config.pagoMovil, cedula: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: V-12345678 o J-12345678-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Titular:</label>
                <input
                  type="text"
                  value={config.pagoMovil.titular}
                  onChange={(e) => setConfig({
                    ...config,
                    pagoMovil: { ...config.pagoMovil, titular: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: Nombre y Apellido o Razón Social"
                />
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN BINANCE PAY (USDT) */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black text-amber-300">
                2. Binance Pay / USDT (Cripto)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Binance Pay ID (Numérico):</label>
                <input
                  type="text"
                  value={config.binance.payId}
                  onChange={(e) => setConfig({
                    ...config,
                    binance: { ...config.binance, payId: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Ej: 482910482"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Correo de la Cuenta Binance:</label>
                <input
                  type="email"
                  value={config.binance.email}
                  onChange={(e) => setConfig({
                    ...config,
                    binance: { ...config.binance, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="pagos@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nickname / Alias de Binance (Opcional):</label>
                <input
                  type="text"
                  value={config.binance.nickname || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    binance: { ...config.binance, nickname: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Ej: MiCuenta_Pay"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Red Cripto (USDT):</label>
                <input
                  type="text"
                  value={config.binance.network || 'Binance Pay / USDT (TRC-20)'}
                  onChange={(e) => setConfig({
                    ...config,
                    binance: { ...config.binance, network: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Ej: Binance Pay o USDT (TRC-20)"
                />
              </div>
            </div>
          </div>

          {/* 3. SECCIÓN ZINLI */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-black text-emerald-300">
                3. Zinli (Billetera Digital en Dólares)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Correo Registrado en Zinli:</label>
                <input
                  type="email"
                  value={config.zinli.email}
                  onChange={(e) => setConfig({
                    ...config,
                    zinli: { ...config.zinli, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="zinli@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Titular en Zinli:</label>
                <input
                  type="text"
                  value={config.zinli.titular}
                  onChange={(e) => setConfig({
                    ...config,
                    zinli: { ...config.zinli, titular: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ej: Nombre Titular Zinli"
                />
              </div>
            </div>
          </div>

          {/* WHATSAPP DE ATENCIÓN Y REPORTES */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Número de WhatsApp para Envío de Comprobantes de Pago:
            </label>
            <input
              type="text"
              value={config.adminWhatsapp}
              onChange={(e) => setConfig({ ...config, adminWhatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ej: 584141234567 (código de país sin signos)"
            />
            <p className="text-[10px] text-slate-400">
              A este número de WhatsApp se abrirá el mensaje automático con el capture del pago cuando el médico confirme su suscripción.
            </p>
          </div>

          {/* Botón para Limpiar todos los campos si el usuario lo desea */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConfig({
                  pagoMovil: { banco: '', telefono: '', cedula: '', titular: '' },
                  binance: { payId: '', email: '', nickname: '', usdtAddress: '', network: 'USDT (TRC-20)' },
                  zinli: { email: '', titular: '' },
                  adminWhatsapp: '',
                  tasaBinanceUsd: config.tasaBinanceUsd,
                  tasaFuente: config.tasaFuente,
                  tasaUltimaActualizacion: config.tasaUltimaActualizacion
                });
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Vaciar / Limpiar todos los datos de cuentas
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Guardado Exitosamente!</span>
                </>
              ) : isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Mis Datos de Cobro</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
