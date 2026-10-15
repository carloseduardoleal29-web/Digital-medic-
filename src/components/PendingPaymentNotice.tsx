import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Crown,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { 
  PaymentConfig, 
  DEFAULT_PAYMENT_CONFIG, 
  fetchPaymentConfig 
} from '../services/paymentConfigService';
import { EditPaymentConfigModal } from './EditPaymentConfigModal';

interface PendingPaymentNoticeProps {
  doctor: DoctorConfig;
  onRefreshStatus?: () => Promise<boolean | void>;
  onActivateTrialTemp?: () => void;
  onLogout?: () => void;
}

export const PendingPaymentNotice: React.FC<PendingPaymentNoticeProps> = ({
  doctor,
  onRefreshStatus,
  onActivateTrialTemp,
  onLogout
}) => {
  // Configuración de pagos cargada dinámicamente desde el servicio central
  const [payConfig, setPayConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPaymentConfig().then((cfg) => {
      if (cfg && cfg.pagoMovil) setPayConfig(cfg);
    });

    const handlePaymentUpdated = (e: any) => {
      if (e?.detail) {
        setPayConfig(e.detail);
      } else {
        fetchPaymentConfig().then((cfg) => {
          if (cfg && cfg.pagoMovil) setPayConfig(cfg);
        });
      }
    };

    window.addEventListener('digital-medic-payment-updated', handlePaymentUpdated);
    return () => {
      window.removeEventListener('digital-medic-payment-updated', handlePaymentUpdated);
    };
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<'pagomovil' | 'binance' | 'zinli'>('pagomovil');
  const [refNumber, setRefNumber] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);

  // Determinar plan seleccionado
  const planId = doctor.subscriptionPlan || 'trimestral';
  const planInfoMap: Record<string, { name: string; price: number; period: string; badge: string }> = {
    mensual: { name: 'Plan Mensual Pro', price: 10, period: '1 Mes', badge: 'Acceso Total' },
    trimestral: { name: 'Plan Trimestral Pro', price: 28, period: '3 Meses', badge: '⭐ Con Descuento' },
    anual: { name: 'Plan Anual Master', price: 95, period: '1 Año', badge: '👑 Todo Incluido + Estudio de Diseño' },
    basico: { name: 'Plan Mensual Pro', price: 10, period: '1 Mes', badge: 'Acceso Total' },
    'diseno-pro': { name: 'Plan Trimestral Pro', price: 28, period: '3 Meses', badge: '⭐ Con Descuento' },
    'clinica-full': { name: 'Plan Anual Master', price: 95, period: '1 Año', badge: '👑 Todo Incluido + Estudio de Diseño' }
  };
  const planInfo = (planId && planInfoMap[planId]) || planInfoMap.trimestral;

  const totalBs = (planInfo.price * payConfig.tasaBinanceUsd).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendWhatsAppReport = () => {
    const cleanPhone = (payConfig.adminWhatsapp || '584140000000').replace(/[^0-9]/g, '');
    const methodNameMap: Record<string, string> = {
      pagomovil: 'Pago Móvil (Tasa Binance)',
      binance: 'Binance USDT',
      zinli: 'Zinli'
    };

    const message = `*🔔 REPORTE DE PAGO / ACTIVACIÓN - DIGITAL MÉDICO*\n\n` +
      `👤 *Médico:* ${doctor.doctorName}\n` +
      `🪪 *C.I / MPPS:* ${doctor.ci} / ${doctor.mpps}\n` +
      `📧 *Correo de Cuenta:* ${doctor.email}\n` +
      `📦 *Plan Solicitado:* ${planInfo.name} (${planInfo.period})\n` +
      `💵 *Monto:* $${planInfo.price} USD (${paymentMethod === 'pagomovil' ? `Bs. ${totalBs}` : `$${planInfo.price} USD`})\n` +
      `💳 *Método de Pago:* ${methodNameMap[paymentMethod]}\n` +
      `🔢 *Nº Referencia / Hash:* ${refNumber.trim() || 'Comprobante adjunto'}\n\n` +
      `_Por favor verificar el pago y activar mi cuenta profesional en Digital Médico. ¡Muchas gracias!_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    setCheckFeedback(null);
    if (onRefreshStatus) {
      await onRefreshStatus();
    }
    setTimeout(() => {
      setIsChecking(false);
      setCheckFeedback('Su cuenta aún figura en revisión. Si ya realizó el pago, por favor repórtelo al WhatsApp del administrador.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-100">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm">
        
        {/* Glow de fondo */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado con estado en pausa */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cuenta en Pausa · Verificación Pendiente</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Acceso en Proceso de Activación
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            ¡Estimado(a) <strong>{doctor.doctorName}</strong>! Sus datos profesionales y sello médico han sido registrados de forma segura. Su cuenta está a la espera de la validación del pago por parte de la administración.
          </p>
        </div>

        {/* Resumen del perfil registrado */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Datos Vinculados:</div>
            <div className="font-bold text-white">{doctor.doctorName} · {doctor.specialty}</div>
            <div className="text-[11px] text-slate-400">C.I: {doctor.ci} | MPPS: {doctor.mpps} | CMD: {doctor.collegeNumber || 'Registrado'}</div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-black text-[10px] border border-blue-500/30">
              {planInfo.name} (${planInfo.price})
            </span>
          </div>
        </div>

        {/* Tarjeta de Métodos de Pago Acordados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Opciones de Pago Acordadas:
            </span>
            <span className="text-[11px] font-mono text-amber-300">
              Monto: <strong>${planInfo.price} USD</strong> (Bs. {totalBs})
            </span>
          </div>

          {/* Selector de pestañas */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('pagomovil')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === 'pagomovil'
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Pago Móvil (Tasa Binance)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('binance')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === 'binance'
                  ? 'bg-amber-600/30 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Binance USDT</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('zinli')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === 'zinli'
                  ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Zinli</span>
            </button>
          </div>

          {/* Caja con datos para transferir */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
            {paymentMethod === 'pagomovil' && (
              <>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Banco:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {payConfig.pagoMovil.banco}
                    <button type="button" onClick={() => copyToClipboard(payConfig.pagoMovil.banco, 'banco')} className="hover:text-blue-400">
                      {copiedKey === 'banco' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Teléfono:</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1.5">
                    {payConfig.pagoMovil.telefono}
                    <button type="button" onClick={() => copyToClipboard(payConfig.pagoMovil.telefono, 'telefono')} className="hover:text-blue-400">
                      {copiedKey === 'telefono' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Cédula / RIF:</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1.5">
                    {payConfig.pagoMovil.cedula}
                    <button type="button" onClick={() => copyToClipboard(payConfig.pagoMovil.cedula, 'cedula')} className="hover:text-blue-400">
                      {copiedKey === 'cedula' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2 font-black">
                  <span className="text-blue-400">Monto en Bolívares:</span>
                  <span className="text-white font-mono text-sm flex items-center gap-1.5">
                    Bs. {totalBs}
                    <button type="button" onClick={() => copyToClipboard(totalBs, 'monto')} className="hover:text-blue-400">
                      {copiedKey === 'monto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
              </>
            )}

            {paymentMethod === 'binance' && (
              <>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Binance Pay ID:</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1.5">
                    {payConfig.binance.payId}
                    <button type="button" onClick={() => copyToClipboard(payConfig.binance.payId, 'payid')} className="hover:text-amber-400">
                      {copiedKey === 'payid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Correo Binance:</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1.5">
                    {payConfig.binance.email}
                    <button type="button" onClick={() => copyToClipboard(payConfig.binance.email, 'emailb')} className="hover:text-amber-400">
                      {copiedKey === 'emailb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2 font-black">
                  <span className="text-amber-400">Monto USDT:</span>
                  <span className="text-white font-mono text-sm">${planInfo.price}.00 USDT</span>
                </div>
              </>
            )}

            {paymentMethod === 'zinli' && (
              <>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Correo de Envío:</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1.5">
                    {payConfig.zinli.email}
                    <button type="button" onClick={() => copyToClipboard(payConfig.zinli.email, 'emailz')} className="hover:text-emerald-400">
                      {copiedKey === 'emailz' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Titular:</span>
                  <span className="font-bold text-white">{payConfig.zinli.titular}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2 font-black">
                  <span className="text-emerald-400">Monto:</span>
                  <span className="text-white font-mono text-sm">${planInfo.price}.00 USD</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Input de comprobante y botones de acción */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Número de Referencia Bancaria / Comprobante (opcional):
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="Ej: 04829104"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSendWhatsAppReport}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Reportar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Comprobando...' : 'Verificar Activación'}</span>
            </button>
          </div>

          {checkFeedback && (
            <p className="text-[11px] text-amber-300/90 text-center bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              {checkFeedback}
            </p>
          )}
        </div>

        {/* Opción de emergencia: Acceso Temporal de 14 días */}
        {onActivateTrialTemp && (
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-black text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>¿Necesita emitir un récipe con urgencia en su consulta?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Puede activar la <strong>Prueba Gratuita Temporal de 14 Días</strong> para recetar a sus pacientes mientras el administrador procesa la confirmación de su pago.
            </p>
            <button
              type="button"
              onClick={onActivateTrialTemp}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Activar Acceso Temporal de 14 Días y Entrar Ya</span>
            </button>
          </div>
        )}

        {/* Footer con opción de Cerrar Sesión y Editar Cobros */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>⚙️ Editar Datos de Cobro</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>

      </div>

      <EditPaymentConfigModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={(updated) => setPayConfig(updated)}
      />
    </div>
  );
};
