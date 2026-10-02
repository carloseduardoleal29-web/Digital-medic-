import React, { useState } from 'react';
import { 
  DollarSign, 
  RefreshCw, 
  ExternalLink, 
  Calculator, 
  Copy, 
  Check, 
  CreditCard,
  TrendingUp,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { fetchLiveBinanceRate } from '../services/paymentConfigService';

interface BinanceRateViewerProps {
  currentRate: number;
  onRateUpdated?: (newRate: number, source: string) => void;
  onOpenEditPaymentConfig?: () => void;
  className?: string;
  variant?: 'card' | 'compact' | 'banner';
}

export const BinanceRateViewer: React.FC<BinanceRateViewerProps> = ({
  currentRate,
  onRateUpdated,
  onOpenEditPaymentConfig,
  className = '',
  variant = 'card'
}) => {
  const [rate, setRate] = useState<number>(currentRate || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sourceNote, setSourceNote] = useState<string>('Binance P2P Venezuela');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [usdInput, setUsdInput] = useState<string>('10');
  const [copiedBs, setCopiedBs] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto-refresh real-time rate on mount and every 60 seconds
  React.useEffect(() => {
    // 1. Initial fetch
    handleRefresh();

    // 2. Setup periodic background refresh for true real-time tracking
    const interval = setInterval(() => {
      fetchLiveBinanceRate().then((res) => {
        if (res && res.rate > 0) {
          setRate(res.rate);
          setSourceNote(res.source);
          const timeStr = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
          setLastUpdated(timeStr);
          if (onRateUpdated) {
            onRateUpdated(res.rate, res.source);
          }
        }
      }).catch(err => console.warn('[BinanceRateViewer] Auto background refresh failed:', err));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsUpdating(true);
    setFeedbackMsg(null);
    try {
      const res = await fetchLiveBinanceRate();
      if (res && res.rate > 0) {
        setRate(res.rate);
        setSourceNote(res.source);
        const timeStr = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(timeStr);
        setFeedbackMsg(`✓ Tasa actualizada en vivo: ${res.rate.toFixed(2)} Bs.`);
        if (onRateUpdated) {
          onRateUpdated(res.rate, res.source);
        }
      } else {
        setFeedbackMsg('No se pudo sincronizar la tasa en este momento.');
      }
    } catch (_) {
      setFeedbackMsg('Error al consultar Binance.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const numericUsd = parseFloat(usdInput) || 0;
  const calculatedBs = numericUsd * (rate || 0);

  const handleCopyCalculatedBs = () => {
    navigator.clipboard.writeText(calculatedBs.toFixed(2));
    setCopiedBs(true);
    setTimeout(() => setCopiedBs(false), 2500);
  };

  if (variant === 'compact') {
    return (
      <div className={`p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🇻🇪</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Tasa Binance Venezuela:</span>
          <span className="font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {rate > 0 ? `Bs. ${rate.toFixed(2)}` : 'Consultando...'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isUpdating}
            className="p-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            title="Actualizar tasa en tiempo real"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? '...' : '⚡ Actualizar'}</span>
          </button>
          <a
            href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            title="Ver mercado oficial P2P en Binance Venezuela"
          >
            <ExternalLink className="w-3 h-3" />
            <span>P2P ↗</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-amber-950/20 p-4 sm:p-5 shadow-xl text-slate-100 space-y-4 ${className}`}>
      
      {/* Encabezado y Tasa Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>🇻🇪 Tasa Binance P2P del Día (Venezuela)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Oficial USDT / VES</span>
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-2 mt-0.5">
              <span>{rate > 0 ? `Bs. ${rate.toFixed(2)}` : 'Cargando tasa...'}</span>
              <span className="text-xs text-amber-300/80 font-normal">por cada 1 USDT / USD</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {sourceNote} {lastUpdated ? `· Actualizado a las ${lastUpdated}` : ''}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
            title="Consultar la tasa P2P en vivo de Binance Venezuela"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Consultando...' : '⚡ Actualizar Tasa'}</span>
          </button>

          <a
            href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Abrir la página oficial de Binance P2P Venezuela para verificar el precio en tiempo real"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver en Binance P2P Oficial ↗</span>
          </a>

          {onOpenEditPaymentConfig && (
            <button
              type="button"
              onClick={onOpenEditPaymentConfig}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Abrir ventana para editar mis datos de cobro"
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-300" />
              <span>Editar Mis Cobros</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-bold animate-in fade-in">
          {feedbackMsg}
        </div>
      )}

      {/* Calculadora / Conversor Instantáneo a Tasa Binance */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Conversor Instantáneo a Tasa Binance del Día:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Montos rápidos:</span>
            <button
              type="button"
              onClick={() => setUsdInput('10')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                usdInput === '10' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              $10 (Mensual)
            </button>
            <button
              type="button"
              onClick={() => setUsdInput('28')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                usdInput === '28' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              $28 (Trimestral)
            </button>
            <button
              type="button"
              onClick={() => setUsdInput('95')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                usdInput === '95' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              $95 (Anual)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Monto en Dólares (USD):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono font-bold text-amber-400">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-white font-mono focus:ring-2 focus:ring-amber-400 focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
              Equivalente Exacto a Transferir en Bolívares (Bs):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-base font-black text-cyan-300 font-mono">
                Bs. {calculatedBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <button
                type="button"
                onClick={handleCopyCalculatedBs}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Copiar monto en bolívares"
              >
                {copiedBs ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBs ? '¡Copiado!' : 'Copiar Bs'}</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          💡 Nota: Si paga por Pago Móvil en Bolívares, use este monto exacto calculado a la tasa oficial de Binance P2P del momento.
        </p>
      </div>

    </div>
  );
};
