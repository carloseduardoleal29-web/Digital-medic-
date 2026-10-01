import React, { useState } from 'react';
import { X, Calculator, Scale, Pill, Activity } from 'lucide-react';

interface MedicalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertDoseIntoRecipe?: (text: string) => void;
}

export const MedicalCalculatorModal: React.FC<MedicalCalculatorModalProps> = ({
  isOpen,
  onClose,
  onInsertDoseIntoRecipe,
}) => {
  const [calcTab, setCalcTab] = useState<'imc' | 'pediatria'>('imc');

  // IMC & Superficie
  const [peso, setPeso] = useState<string>('70');
  const [talla, setTalla] = useState<string>('170');

  // Pediatría
  const [pesoPed, setPesoPed] = useState<string>('15');
  const [farmacoPed, setFarmacoPed] = useState<'paracetamol' | 'ibuprofeno'>('paracetamol');

  if (!isOpen) return null;

  // Calculos Adulto
  const p = parseFloat(peso) || 0;
  const t = parseFloat(talla) || 0;
  let imc = 0;
  let supCorp = 0;
  let imcText = '';

  if (p > 0 && t > 0) {
    const tM = t / 100;
    imc = parseFloat((p / (tM * tM)).toFixed(1));
    supCorp = parseFloat(Math.sqrt((p * t) / 3600).toFixed(2));

    if (imc < 18.5) imcText = 'Bajo peso (< 18.5)';
    else if (imc < 25) imcText = 'Peso normal (18.5 - 24.9)';
    else if (imc < 30) imcText = 'Sobrepeso (25.0 - 29.9)';
    else if (imc < 35) imcText = 'Obesidad Grado I (30.0 - 34.9)';
    else if (imc < 40) imcText = 'Obesidad Grado II (35.0 - 39.9)';
    else imcText = 'Obesidad Mórbida Grado III (≥ 40.0)';
  }

  // Calculos Pediátricos
  const pp = parseFloat(pesoPed) || 0;
  let dosisMg = 0;
  let dosisMl = 0;
  let posologiaPed = '';

  if (farmacoPed === 'paracetamol') {
    // 15 mg/kg/dosis, jarabe 120mg/5ml (24mg/ml)
    dosisMg = parseFloat((pp * 15).toFixed(0));
    dosisMl = parseFloat((dosisMg / 24).toFixed(1));
    posologiaPed = `Acetaminofén Jarabe 120mg/5ml: Administrar ${dosisMl} ml VO cada 6 horas condicionado a fiebre > 38.3°C o dolor (Dosis calculada: ${dosisMg} mg para ${pp} kg).`;
  } else {
    // 10 mg/kg/dosis, jarabe 100mg/5ml (20mg/ml)
    dosisMg = parseFloat((pp * 10).toFixed(0));
    dosisMl = parseFloat((dosisMg / 20).toFixed(1));
    posologiaPed = `Ibuprofeno Suspensión 100mg/5ml: Administrar ${dosisMl} ml VO cada 8 horas con los alimentos por 3 días (Dosis calculada: ${dosisMg} mg para ${pp} kg).`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Calculadoras Clínicas Rápidas</h3>
              <p className="text-[11px] text-slate-500">Antropometría y dosificación pediátrica</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white">
          <button
            onClick={() => setCalcTab('imc')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              calcTab === 'imc'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            IMC y Superficie Corporal
          </button>
          <button
            onClick={() => setCalcTab('pediatria')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              calcTab === 'pediatria'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Dosis Pediátrica mg/kg
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-xs text-slate-800 space-y-4">
          {calcTab === 'imc' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Peso (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Talla (cm):</label>
                  <input
                    type="number"
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Result Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-600">Índice de Masa Corporal (IMC):</span>
                  <span className="text-base font-bold text-blue-700 font-mono">{imc || '--'} kg/m²</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-600">Clasificación OMS:</span>
                  <span className="font-semibold text-slate-800">{imcText || '--'}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">Superficie Corporal (Mosteller):</span>
                  <span className="font-bold text-slate-800 font-mono">{supCorp || '--'} m²</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Peso del Niño (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={pesoPed}
                    onChange={(e) => setPesoPed(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Medicamento:</label>
                  <select
                    value={farmacoPed}
                    onChange={(e) => setFarmacoPed(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                  >
                    <option value="paracetamol">Acetaminofén (15mg/kg)</option>
                    <option value="ibuprofeno">Ibuprofeno (10mg/kg)</option>
                  </select>
                </div>
              </div>

              {/* Pediatric Result */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 space-y-2 text-emerald-950">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-emerald-900">Volumen a Administrar:</span>
                  <span className="text-lg font-bold text-emerald-700 font-mono">{dosisMl || '--'} ml</span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-emerald-800">
                  <span>Dosis absoluta en miligramos:</span>
                  <span className="font-mono font-bold">{dosisMg} mg / toma</span>
                </div>
                <p className="text-[11px] text-emerald-900 italic pt-1 border-t border-emerald-200">
                  {posologiaPed}
                </p>
              </div>

              {onInsertDoseIntoRecipe && (
                <button
                  onClick={() => {
                    onInsertDoseIntoRecipe(posologiaPed);
                    onClose();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  Insertar Posología al Récipe
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
