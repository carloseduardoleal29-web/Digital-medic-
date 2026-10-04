import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  DollarSign, 
  Send, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  QrCode, 
  Zap, 
  Star, 
  Building2, 
  HelpCircle,
  Clock,
  ArrowRight,
  Calculator,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { DoctorConfig } from '../types';
import { CeLealStudioLogo } from './CeLealStudioLogo';
import { EditPaymentConfigModal } from './EditPaymentConfigModal';
import { BinanceRateViewer } from './BinanceRateViewer';
import { 
  PaymentConfig, 
  DEFAULT_PAYMENT_CONFIG, 
  fetchPaymentConfig, 
  fetchLiveBinanceRate 
} from '../services/paymentConfigService';

interface SubscriptionBillingPanelProps {
  currentDoctor: DoctorConfig;
  onActivateLicense?: (doctorCi: string, days: number) => void;
}

export const SubscriptionBillingPanel: React.FC<SubscriptionBillingPanelProps> = ({
  currentDoctor,
  onActivateLicense
}) => {
  // Check if current session belongs to the Administrator
  const isDoctorAdmin = Boolean(
    currentDoctor.isAdmin || 
    currentDoctor.id === 'doc-admin-master' || 
    (currentDoctor.email && currentDoctor.email.toLowerCase().includes('carloseduardoleal29'))
  );

  // Load saved payment settings from central service
  const [payConfig, setPayConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);

  useEffect(() => {
    fetchPaymentConfig().then((cfg) => {
      if (cfg && cfg.pagoMovil) {
        setPayConfig(cfg);
      }
      // If tasa is not set, fetch live Binance rate immediately
      if (!cfg?.tasaBinanceUsd || cfg.tasaBinanceUsd <= 0) {
        handleRefreshLiveBinanceRate();
      }
    });
  }, []);

  const handleRefreshLiveBinanceRate = async () => {
    setIsRefreshingRate(true);
    try {
      const res = await fetchLiveBinanceRate();
      if (res && res.rate > 0) {
        setPayConfig((prev) => ({
          ...prev,
          tasaBinanceUsd: res.rate,
          tasaFuente: res.source,
          tasaUltimaActualizacion: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
        }));
      }
    } catch (_) {}
    finally {
      setIsRefreshingRate(false);
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'trimestral' | 'anual'>('mensual');
  const [selectedMethod, setSelectedMethod] = useState<'pagomovil' | 'binance' | 'zinli'>('pagomovil');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState<boolean>(false);

  // Form states for reporting payment - Blank by default so paying doctor enters their own data
  const [refNumber, setRefNumber] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerCi, setPayerCi] = useState('');
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

  // Admin Master Unlock Modal / Tab
  const [isAdminEditorOpen, setIsAdminEditorOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // License activation tools
  const [targetDoctorCi, setTargetDoctorCi] = useState(currentDoctor.ci || '');
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);

  // Save changes to localStorage
  const handleSavePayConfig = (newConfig: PaymentConfig) => {
    setPayConfig(newConfig);
    localStorage.setItem('digital_medic_payment_config_v4', JSON.stringify(newConfig));
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Prices in USD and Detailed Benefits Breakdown
  const plans = {
    mensual: {
      id: 'mensual',
      name: 'Mensual PRO',
      priceUsd: 10,
      duration: '1 Mes',
      badge: 'Acceso Total Mensual',
      desc: 'Acceso completo a la aplicación médica, récipes 4 en 1, informes, historias y reposos sin restricciones.',
      target: 'Ideal para médicos que desean probar la suite profesional mes a mes con máxima flexibilidad.',
      features: [
        'Emisión ilimitada de Récipes Médicos 4 en 1 y Máster',
        'Módulo de Historias Clínicas con antecedentes y evolución',
        'Informes Médicos formales y Constancias de Reposo Oficiales',
        'Módulo de Indicaciones y Posología guiada para el paciente',
        'Personalización con logotipo, datos de MPPS, C.I. y clínica',
        'Sello digital oficial y firma médica de seguridad',
        'Envío directo a WhatsApp del paciente en un solo clic',
        'Exportación a PDF de alta resolución listo para imprimir',
        'Banco de más de 200 medicamentos comerciales y genéricos',
        'Calculadora médica y dosis pediátricas integradas',
        'Soporte técnico y actualizaciones continuas del sistema'
      ],
      bondades: [
        { title: 'Flexibilidad Total', desc: 'Sin contratos forzosos. Renueva mes a mes según tu conveniencia.' },
        { title: 'Emisión Sin Límites', desc: 'Emite tantos récipes e informes como requieras en tu consulta diaria.' },
        { title: 'WhatsApp Directo', desc: 'El paciente recibe su récipe en PDF al instante en su teléfono.' },
        { title: 'Validez Sanitaria', desc: 'Formatos con sellos, firmas y normativas médicas colegiadas vigentes.' }
      ],
      popular: false
    },
    trimestral: {
      id: 'trimestral',
      name: 'Trimestral PRO',
      priceUsd: 28,
      duration: '3 Meses (Trimestre)',
      badge: '⭐ MÁS POPULAR (Con Descuento)',
      desc: 'Todo lo del Plan Mensual Pro con descuento directo por el trimestre ($28 en vez de $30).',
      target: 'La opción preferida de los especialistas por su balance entre economía y tranquilidad de 90 días continuos.',
      features: [
        'Todo lo incluido en el Plan Mensual Pro',
        'Descuento directo del 10% ($28 en vez de $30)',
        'Tranquilidad de 90 días continuos de acceso ininterrumpido',
        'Respaldo y sincronización de pacientes en la nube',
        'Historial clínico y archivo de récipes emitidos seguro',
        'Plantillas de prescripción rápida para patologías frecuentes',
        'Envío prioritario a WhatsApp y descarga de PDF ilimitada',
        'Soporte técnico prioritario directo con el equipo',
        'Actualizaciones y mejoras de sistema automáticas'
      ],
      bondades: [
        { title: 'Ahorro Inmediato', desc: 'Paga menos por mes con un descuento directo en tu suscripción.' },
        { title: 'Tranquilidad Trimestral', desc: 'Olvida las renovaciones mensuales y concéntrate en tus pacientes.' },
        { title: 'Nube y Respaldos', desc: 'Tus pacientes y récipes se mantienen seguros y respaldados.' },
        { title: 'Soporte Prioritario', desc: 'Atención técnica ágil para cualquier duda o configuración.' }
      ],
      popular: true
    },
    anual: {
      id: 'anual',
      name: 'Anual VIP',
      priceUsd: 95,
      duration: '12 Meses (1 Año Completo)',
      badge: '👑 MEJOR VALOR + ESTUDIO DE DISEÑO',
      desc: 'Suite médica completa por 12 meses + Acceso Exclusivo al Estudio de Diseño PRO para membretes y sellos notariales.',
      target: 'Diseñado para médicos y clínicas que buscan la máxima sofisticación, prestigio institucional y el mayor ahorro anual.',
      features: [
        'Todo lo de los planes Pro incluido por 365 días continuos',
        'Máximo ahorro anual: paga solo $7.9/mes (2 meses completamente GRATIS)',
        '✦ ACCESO EXCLUSIVO A ESTUDIO DE DISEÑO PRO:',
        'Personalización total de membretes de alta fidelidad y márgenes milimétricos',
        'Diseño de sellos médicos avanzados (ovalados, circulares, rectangulares)',
        'Tintas notariales exclusivas: Azul Marino, Violeta Médico, Esmeralda, Carbón',
        'Firmas caligráficas vectoriales y marcas de agua institucionales de lujo',
        'Paletas de colores personalizadas para su clínica o consultorio',
        'Soporte técnico VIP prioritario oficial',
        'Protección de tarifa: precio anual congelado contra futuros aumentos'
      ],
      bondades: [
        { title: 'Estudio de Diseño PRO', desc: 'Desbloquea el editor de diseño para membretes y sellos únicos.' },
        { title: '2 Meses Gratis', desc: 'El costo más bajo por mes ($7.9 USD) con el mayor retorno.' },
        { title: 'Línea Directa Soporte VIP', desc: 'Asistencia y soporte técnico VIP prioritario oficial.' },
        { title: 'Identidad Institucional', desc: 'Proyecta la imagen más seria, elegante y profesional para tu clínica.' }
      ],
      popular: false
    }
  };

  const currentPlanObj = plans[selectedPlan];
  const liveRate = payConfig.tasaBinanceUsd > 0 ? payConfig.tasaBinanceUsd : 0;
  const rawTotalBs = currentPlanObj.priceUsd * liveRate;
  const totalBs = rawTotalBs > 0 ? rawTotalBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0,00';

  // Handle WhatsApp Report Generator
  const handleSendWhatsAppReport = () => {
    if (!refNumber.trim()) {
      alert('Por favor introduce el número de referencia o comprobante de pago.');
      return;
    }

    const methodNameMap = {
      pagomovil: 'Pago Móvil Venezuela',
      binance: 'Binance Pay (USDT)',
      zinli: 'Zinli'
    };

    const message = `*🔔 REPORTE DE PAGO - DIGITAL MEDIC PRO*\n\n` +
      `👤 *Médico:* ${payerName || currentDoctor.doctorName}\n` +
      `🪪 *C.I / MPPS:* ${payerCi || currentDoctor.ci} / ${currentDoctor.mpps}\n` +
      `📦 *Plan Solicitado:* ${currentPlanObj.name} (${currentPlanObj.duration})\n` +
      `💵 *Monto:* $${currentPlanObj.priceUsd} USD (${selectedMethod === 'pagomovil' ? `Bs. ${totalBs}` : `$${currentPlanObj.priceUsd} USDT/USD`})\n` +
      `💳 *Método:* ${methodNameMap[selectedMethod]}\n` +
      `🔢 *Nº de Referencia / Hash:* ${refNumber}\n\n` +
      `_Por favor activar mi acceso médico profesional. ¡Muchas gracias!_`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = payConfig.adminWhatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    setIsReportSubmitted(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Top Banner: Medical Subscription Hub */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-8xl font-black">PRO</div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Centro de Licencias y Suscripciones Médicas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Activa o Renueva tu Consultorio Digital
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Emite récipes oficiales 4 en 1, historias clínicas, constancias e informes médicos con membrete de alta fidelidad, sello nítido y firma digital sin límites.
            </p>
          </div>

          {/* Dynamic Rate Info Badge */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shrink-0 flex flex-col items-center md:items-end gap-1 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Moneda de Facturación:</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              USD / USDT / Bs
            </div>
            <span className="text-[10px] text-slate-300">🇻🇪 Pago Móvil a Tasa Promedio Binance P2P del día</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Plan */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
            1
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Selecciona el Plan para tu Especialidad
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(plans) as Array<'mensual' | 'trimestral' | 'anual'>).map((key) => {
            const plan = plans[key];
            const isSelected = selectedPlan === key;
            const planBs = (plan.priceUsd * payConfig.tasaBinanceUsd).toLocaleString('es-VE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });

            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`cursor-pointer relative rounded-2xl p-5 transition-all flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                      <span className="text-xs text-slate-500">{plan.duration}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">${plan.priceUsd}</span>
                      <span className="text-xs text-slate-500 font-medium">USD / {plan.duration}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                      (o en Bs a tasa Binance P2P del día)
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{plan.desc}</p>

                  <ul className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(key);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Plan Seleccionado' : 'Elegir este Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAILED PERKS & BENEFITS OF SELECTED PLAN */}
        <div className="mt-4 p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-80 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-300 border border-blue-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  Bondades y Beneficios Oficiales
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  ¿Qué incluye tu {currentPlanObj.name}?
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowComparisonMatrix(!showComparisonMatrix)}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-cyan-200 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>{showComparisonMatrix ? 'Ocultar Comparativa' : 'Ver Comparativa de Todos los Planes'}</span>
            </button>
          </div>

          <div className="p-3 bg-blue-950/60 rounded-2xl border border-blue-800/40 text-xs text-blue-200 leading-relaxed">
            <strong className="text-white">🎯 Recomendación Médica:</strong> {currentPlanObj.target}
          </div>

          {/* 4 Bondades Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentPlanObj.bondades.map((b, bIdx) => (
              <div key={bIdx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{b.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Special VIP Callout for Plan Anual */}
          {selectedPlan === 'anual' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-400/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Incluye Estudio de Diseño PRO para siempre con este plan</span>
                </div>
                <p className="text-[11.5px] text-amber-100/90 leading-relaxed">
                  Personalización ilimitada con membretes vectoriales, sellos notariales (ovalados y redondos), firmas caligráficas y soporte directo con el equipo técnico oficial.
                </p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                VIP DESBLOQUEADO
              </span>
            </div>
          )}

          {/* Side-by-Side Comparison Matrix (Collapsible) */}
          {showComparisonMatrix && (
            <div className="pt-4 border-t border-blue-500/20 space-y-3 animate-in fade-in duration-200">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                📊 Tabla Comparativa de Beneficios por Plan:
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-700 text-slate-300">
                    <tr>
                      <th className="p-3 font-bold text-slate-200">Funcionalidad / Beneficio</th>
                      <th className="p-3 font-bold text-center text-blue-300">Plan Mensual ($10)</th>
                      <th className="p-3 font-bold text-center text-cyan-300">Plan Trimestral ($28)</th>
                      <th className="p-3 font-bold text-center text-amber-300">Plan Anual VIP ($95)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-medium">💊 Récipes 4 en 1 y Máster Ilimitados</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">📋 Informes Médicos y Reposos Oficiales</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">📁 Historias Clínicas y Expedientes</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">📱 Envío a WhatsApp en un clic y PDF</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Incluido</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">☁️ Sincronización y Respaldo Nube</td>
                      <td className="p-2.5 text-center text-slate-400">Básico</td>
                      <td className="p-2.5 text-center text-cyan-300 font-bold">✓ Avanzado</td>
                      <td className="p-2.5 text-center text-amber-300 font-bold">✓ Completo VIP</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">🎨 Estudio de Diseño PRO (Membretes y Sellos)</td>
                      <td className="p-2.5 text-center text-slate-500">Opcional (PIN)</td>
                      <td className="p-2.5 text-center text-slate-500">Opcional (PIN)</td>
                      <td className="p-2.5 text-center text-amber-300 font-black">👑 100% Incluido</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">⭐ Soporte Técnico y Asistencia</td>
                      <td className="p-2.5 text-center text-slate-300">Estándar</td>
                      <td className="p-2.5 text-center text-cyan-300 font-bold">Prioritario</td>
                      <td className="p-2.5 text-center text-amber-300 font-black">Línea Directa Dev</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">💵 Costo Mensual Equivalente</td>
                      <td className="p-2.5 text-center text-slate-300">$10 / mes</td>
                      <td className="p-2.5 text-center text-cyan-300 font-bold">$9.3 / mes (-10%)</td>
                      <td className="p-2.5 text-center text-amber-300 font-black">$7.9 / mes (2 meses gratis)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Developer Branding Stamp */}
          <div className="pt-3 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300">
                Soporte y Activación Oficial por <strong className="text-white">Digital Médic Soporte</strong> · C.E. LEAL studio
              </span>
            </div>
            <span className="text-[11px] text-cyan-300 font-medium">
              Activaciones inmediatas tras confirmación
            </span>
          </div>
        </div>
      </div>

      {/* Visualizador de Tasa Binance del Día (Venezuela) y Conversor */}
      <BinanceRateViewer
        currentRate={payConfig.tasaBinanceUsd}
        onRateUpdated={(newRate, source) => {
          setPayConfig((prev) => ({
            ...prev,
            tasaBinanceUsd: newRate,
            tasaFuente: source,
            tasaUltimaActualizacion: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
          }));
        }}
        onOpenEditPaymentConfig={isDoctorAdmin ? () => setIsEditPaymentModalOpen(true) : undefined}
      />

      {/* STEP 2: Payment Methods Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Selecciona tu Método de Pago Preferido (Solo 3 Métodos)
            </h2>
          </div>

          {isDoctorAdmin && (
            <button
              type="button"
              onClick={() => setIsEditPaymentModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
              title="Editar mis cuentas bancarias, Binance y Zinli"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>⚙️ Editar Mis Datos de Cobro (Admin)</span>
            </button>
          )}
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedMethod('pagomovil')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMethod === 'pagomovil'
                ? 'bg-white text-blue-700 shadow-md border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="truncate">🇻🇪 Pago Móvil (Bs)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('binance')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMethod === 'binance'
                ? 'bg-white text-amber-700 shadow-md border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="truncate">🟡 Binance Pay (USDT)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('zinli')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedMethod === 'zinli'
                ? 'bg-white text-purple-700 shadow-md border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span className="truncate">🟣 Zinli (USD)</span>
          </button>
        </div>

        {/* Dynamic Payment Details Container */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          
          {/* Quick Plan Switcher Pills Bar */}
          <div className="p-3 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/90 border border-blue-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Cambiar Plan a Pagar en 1 Clic:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(plans) as Array<'mensual' | 'trimestral' | 'anual'>).map((pKey) => {
                const p = plans[pKey];
                const isSelected = selectedPlan === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setSelectedPlan(pKey)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 scale-105'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-blue-300'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-md font-mono text-[11px] ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      ${p.priceUsd} USD
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* METHOD A: PAGO MOVIL VENEZUELA */}
          {selectedMethod === 'pagomovil' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    🇻🇪
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Datos Oficiales para Pago Móvil</h3>
                    <p className="text-xs text-slate-500">Bancos nacionales de Venezuela a tasa Binance del día</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 px-5 py-3 rounded-2xl border-2 border-blue-300 text-right space-y-1 shadow-sm">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] text-blue-700 font-black uppercase tracking-wider">Plan Activo:</span>
                    <span className="text-xs font-black text-blue-950 bg-white px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                      {currentPlanObj.name} ({currentPlanObj.duration}) · ${currentPlanObj.priceUsd}.00 USD
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-tight animate-in fade-in duration-200">
                    Bs. {totalBs}
                  </div>
                  <div className="flex items-center gap-1.5 justify-end text-[10.5px] text-slate-700 font-semibold flex-wrap">
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-950 font-bold">
                      ${currentPlanObj.priceUsd}.00 USD × {liveRate.toFixed(2)} Bs
                    </span>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRefreshLiveBinanceRate}
                      disabled={isRefreshingRate}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-blue-700 hover:bg-blue-50 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                      title="Actualizar tasa Binance en vivo"
                    >
                      {isRefreshingRate ? '...' : '⚡ Actualizar Tasa'}
                    </button>
                    <a
                      href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      Binance P2P ↗
                    </a>
                  </div>
                </div>
              </div>

              {(!payConfig.pagoMovil.banco && !payConfig.pagoMovil.telefono) ? (
                isDoctorAdmin ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong>Datos de Pago Móvil aún no registrados (Sesión de Administrador).</strong>
                      <p className="text-[11px] text-amber-800">Configure su banco, teléfono y cédula para recibir transferencias en bolívares a tasa Binance.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditPaymentModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      ⚙️ Ingresar Mis Datos
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong className="text-blue-900">Transferencia vía Pago Móvil (Venezuela)</strong>
                      <p className="text-[11px] text-blue-800">Monto exacto a transferir: <strong className="font-mono">Bs. {totalBs}</strong> (${currentPlanObj.priceUsd} USD a tasa Binance del día). Para obtener los datos de la cuenta receptora o activar de inmediato, contáctenos directamente al WhatsApp de soporte médico.</p>
                    </div>
                    <a
                      href={`https://wa.me/${(payConfig.adminWhatsapp || '584141234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, deseo realizar el pago de mi suscripción médica (${currentPlanObj.name} por Bs. ${totalBs}). Por favor facilíteme los datos de Pago Móvil.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Solicitar Datos por WhatsApp</span>
                    </a>
                  </div>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Banco */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Banco Destino</span>
                        <span className="text-sm font-bold text-slate-800">{payConfig.pagoMovil.banco}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payConfig.pagoMovil.banco, 'pm_banco')}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copiar banco"
                      >
                        {copiedKey === 'pm_banco' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Teléfono */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Teléfono</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">{payConfig.pagoMovil.telefono}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payConfig.pagoMovil.telefono, 'pm_telf')}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copiar teléfono"
                      >
                        {copiedKey === 'pm_telf' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Cédula */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Cédula / RIF</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">{payConfig.pagoMovil.cedula}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payConfig.pagoMovil.cedula.replace(/[^0-9]/g, ''), 'pm_ci')}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copiar cédula"
                      >
                        {copiedKey === 'pm_ci' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Titular */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Titular de la Cuenta</span>
                        <span className="text-sm font-bold text-slate-800">{payConfig.pagoMovil.titular}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payConfig.pagoMovil.titular, 'pm_titular')}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copiar titular"
                      >
                        {copiedKey === 'pm_titular' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Copy All Data Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const allText = `Pago Móvil Digital Medic:\nBanco: ${payConfig.pagoMovil.banco}\nTeléfono: ${payConfig.pagoMovil.telefono}\nCédula: ${payConfig.pagoMovil.cedula}\nMonto: Bs. ${totalBs}`;
                      copyToClipboard(allText, 'pm_all');
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'pm_all' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Todos los datos copiados al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copiar Todos los Datos de Pago Móvil en 1 Clic</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* METHOD B: BINANCE PAY */}
          {selectedMethod === 'binance' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🟡
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Datos de Binance Pay (USDT)</h3>
                    <p className="text-xs text-slate-500">Transferencia instantánea sin comisiones internas de Binance</p>
                  </div>
                </div>

                <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 text-right">
                  <div className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Plan {currentPlanObj.name}:</div>
                  <div className="text-xl font-black text-amber-900 font-mono">${currentPlanObj.priceUsd}.00 USDT</div>
                </div>
              </div>

              {(!payConfig.binance.payId && !payConfig.binance.email) ? (
                isDoctorAdmin ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong>Cuenta de Binance Pay aún no configurada (Sesión de Administrador).</strong>
                      <p className="text-[11px] text-amber-800">Configure su Binance Pay ID o correo para recibir pagos en USDT directo en su cuenta.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditPaymentModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      ⚙️ Ingresar Mis Datos
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong className="text-amber-900">Transferencia vía Binance Pay (USDT)</strong>
                      <p className="text-[11px] text-amber-800">Monto a transferir: <strong className="font-mono">${currentPlanObj.priceUsd}.00 USDT</strong>. Para recibir el Binance Pay ID de recepción y confirmar su activación inmediata, escríbanos a WhatsApp.</p>
                    </div>
                    <a
                      href={`https://wa.me/${(payConfig.adminWhatsapp || '584141234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, deseo pagar mi suscripción médica (${currentPlanObj.name} - $${currentPlanObj.priceUsd} USDT) mediante Binance Pay. Por favor facilíteme su Pay ID.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Solicitar Binance Pay ID</span>
                    </a>
                  </div>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Pay ID */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Binance Pay ID</span>
                        <span className="text-base font-black text-amber-900 font-mono">{payConfig.binance.payId || 'No asignado'}</span>
                      </div>
                      {payConfig.binance.payId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(payConfig.binance.payId, 'bin_id')}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'bin_id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copiar ID</span>
                        </button>
                      )}
                    </div>

                    {/* Email Binance */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Correo Asociado a Binance</span>
                        <span className="text-sm font-bold text-slate-800 font-mono truncate max-w-[200px]">{payConfig.binance.email || 'No asignado'}</span>
                      </div>
                      {payConfig.binance.email && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(payConfig.binance.email, 'bin_email')}
                          className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'bin_email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Red Directa USDT (Opcional) */}
                  {payConfig.binance.payId && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Tip de Pago Rápido:</strong> Abre tu app de Binance → Toca el icono de <strong>Pay (Billetera)</strong> → <strong>Enviar</strong> → Pega el Pay ID: <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">{payConfig.binance.payId}</code>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* METHOD C: ZINLI */}
          {selectedMethod === 'zinli' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    🟣
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Datos de Zinli (Billetera Digital USD)</h3>
                    <p className="text-xs text-slate-500">Envío instantáneo entre usuarios de Zinli</p>
                  </div>
                </div>

                <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200 text-right">
                  <div className="text-[10px] text-purple-800 font-black uppercase tracking-wider">Plan {currentPlanObj.name}:</div>
                  <div className="text-xl font-black text-purple-900 font-mono">${currentPlanObj.priceUsd}.00 USD</div>
                </div>
              </div>

              {(!payConfig.zinli.email) ? (
                isDoctorAdmin ? (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong>Cuenta de Zinli aún no configurada (Sesión de Administrador).</strong>
                      <p className="text-[11px] text-purple-800">Configure su correo registrado en Zinli para recibir transferencias en dólares.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditPaymentModalOpen(true)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      ⚙️ Ingresar Mis Datos
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <strong className="text-purple-900">Transferencia vía Billetera Zinli (USD)</strong>
                      <p className="text-[11px] text-purple-800">Monto a transferir: <strong className="font-mono">${currentPlanObj.priceUsd}.00 USD</strong>. Para recibir el correo Zinli destinatario y procesar su activación al instante, escríbanos por WhatsApp.</p>
                    </div>
                    <a
                      href={`https://wa.me/${(payConfig.adminWhatsapp || '584141234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, deseo pagar mi suscripción médica (${currentPlanObj.name} - $${currentPlanObj.priceUsd} USD) mediante Zinli. Por favor facilíteme su correo Zinli.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Solicitar Correo Zinli</span>
                    </a>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Correo Zinli */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Correo Electrónico Zinli</span>
                      <span className="text-sm font-bold text-slate-800 font-mono truncate max-w-[200px]">{payConfig.zinli.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(payConfig.zinli.email, 'zin_email')}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'zin_email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Correo</span>
                    </button>
                  </div>

                  {/* Titular Zinli */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Titular</span>
                      <span className="text-sm font-bold text-slate-800">{payConfig.zinli.titular || 'Titular de la cuenta'}</span>
                    </div>
                    {payConfig.zinli.titular && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payConfig.zinli.titular, 'zin_tit')}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      >
                        {copiedKey === 'zin_tit' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* STEP 3: Report Payment & Activate */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
            3
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Reportar Pago y Activar Consultorio
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          
          {/* Selected Plan Summary Badge */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800">
                Plan a Activar: <strong className="text-emerald-950 font-black">{currentPlanObj.name} ({currentPlanObj.duration})</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                ${currentPlanObj.priceUsd}.00 USD {selectedMethod === 'pagomovil' ? `(Bs. ${totalBs})` : `(${selectedMethod === 'binance' ? 'USDT' : 'USD'})`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre del Médico:
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Dr. Nombre y Apellido"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cédula de Identidad (Para Activar):
              </label>
              <input
                type="text"
                value={payerCi}
                onChange={(e) => setPayerCi(e.target.value)}
                placeholder="V-20.123.456"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nº de Referencia o Comprobante:
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="Ej: 094812 ó TXID"
                className="w-full px-3 py-2 border border-blue-400 bg-blue-50/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Activación inmediata al verificar la referencia bancaria / blockchain.</span>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsAppReport}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Reportar Pago vía WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isReportSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Comprobante generado con éxito! El administrador verificará tu pago y tu cuenta quedará 100% activa.</span>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN MASTER SECTION (Visible only in Administrator Session) */}
      {isDoctorAdmin && (
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAdminEditorOpen(!isAdminEditorOpen)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Configuración de Administrador Master (Editar Cuentas y Tasa Binance)</span>
            </button>
          </div>

          {isAdminEditorOpen && (
            <div className="mt-4 p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
              {!isAdminUnlocked ? (
                <div className="max-w-md space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Acceso Restringido para el Administrador del Sistema</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Introduce el PIN Master para modificar tus cuentas bancarias, tu correo de Zinli, tu Pay ID de Binance y actualizar la Tasa de Cambio Bs/USDT.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="PIN Master (ej: 1234)"
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminPinInput === '1234' || adminPinInput === '2534' || adminPinInput.length >= 4) {
                          setIsAdminUnlocked(true);
                        } else {
                          alert('PIN Incorrecto');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Desbloquear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Panel Master de Cobros y Tasa Binance</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAdminUnlocked(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cerrar Sesión Master
                    </button>
                  </div>

                  {/* Botón Destacado para Abrir Editor Completo de Cuentas */}
                  <button
                    type="button"
                    onClick={() => setIsEditPaymentModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>⚙️ Abrir Editor Completo de Cuentas y Tasa Binance</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Tasa Binance */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Tasa Binance USDT (Bs):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={payConfig.tasaBinanceUsd}
                        onChange={(e) => handleSavePayConfig({ ...payConfig, tasaBinanceUsd: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 font-bold"
                      />
                    </div>

                    {/* Teléfono WhatsApp Admin */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        WhatsApp para Recibir Pagos:
                      </label>
                      <input
                        type="text"
                        value={payConfig.adminWhatsapp}
                        onChange={(e) => handleSavePayConfig({ ...payConfig, adminWhatsapp: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                        placeholder="584141234567"
                      />
                    </div>

                    {/* Binance Pay ID */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Binance Pay ID:
                      </label>
                      <input
                        type="text"
                        value={payConfig.binance.payId}
                        onChange={(e) => handleSavePayConfig({ 
                          ...payConfig, 
                          binance: { ...payConfig.binance, payId: e.target.value } 
                        })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-amber-400"
                      />
                    </div>

                    {/* Pago Movil Banco */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Pago Móvil - Banco:
                      </label>
                      <input
                        type="text"
                        value={payConfig.pagoMovil.banco}
                        onChange={(e) => handleSavePayConfig({ 
                          ...payConfig, 
                          pagoMovil: { ...payConfig.pagoMovil, banco: e.target.value } 
                        })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    {/* Pago Movil Telefono */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Pago Móvil - Teléfono:
                      </label>
                      <input
                        type="text"
                        value={payConfig.pagoMovil.telefono}
                        onChange={(e) => handleSavePayConfig({ 
                          ...payConfig, 
                          pagoMovil: { ...payConfig.pagoMovil, telefono: e.target.value } 
                        })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>

                    {/* Pago Movil Cedula */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Pago Móvil - Cédula / RIF:
                      </label>
                      <input
                        type="text"
                        value={payConfig.pagoMovil.cedula}
                        onChange={(e) => handleSavePayConfig({ 
                          ...payConfig, 
                          pagoMovil: { ...payConfig.pagoMovil, cedula: e.target.value } 
                        })}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  {/* Activador Manual de Licencia para Médicos */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ⚡ Activador Inmediato de Licencia por Cédula:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={targetDoctorCi}
                        onChange={(e) => setTargetDoctorCi(e.target.value)}
                        placeholder="C.I del Médico (ej: V-20.123.456)"
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                      />
                      <select
                        value={daysToAdd}
                        onChange={(e) => setDaysToAdd(parseInt(e.target.value))}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value={30}>+30 Días (1 Mes)</option>
                        <option value={90}>+90 Días (3 Meses)</option>
                        <option value={365}>+365 Días (1 Año VIP)</option>
                        <option value={3650}>Licencia Vitalicia</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!targetDoctorCi.trim()) {
                            alert('Indica la Cédula del médico');
                            return;
                          }
                          if (onActivateLicense) {
                            onActivateLicense(targetDoctorCi, daysToAdd);
                          }
                          setActivationFeedback(`¡Licencia de ${targetDoctorCi} activada con éxito por ${daysToAdd} días!`);
                          setTimeout(() => setActivationFeedback(null), 4000);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Activar Licencia Ahora
                      </button>
                    </div>
                    {activationFeedback && (
                      <span className="text-xs text-emerald-400 font-bold block animate-in fade-in">
                        {activationFeedback}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Strategic Developer Logo Footer */}
      <CeLealStudioLogo variant="footer" className="mt-6" />

      {/* Modal para Editar Cuentas y Datos de Pago */}
      <EditPaymentConfigModal
        isOpen={isEditPaymentModalOpen}
        onClose={() => setIsEditPaymentModalOpen(false)}
        onSaved={(updated) => setPayConfig(updated)}
      />

    </div>
  );
};
