import React, { useState } from 'react';
import { DoctorConfig, ClinicalRecord } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { 
  Users, 
  Plus, 
  Search, 
  AlertTriangle, 
  Activity, 
  FileSpreadsheet, 
  Trash2, 
  Printer, 
  Save, 
  ArrowRight,
  Heart,
  Scale,
  Download,
  ArrowLeft
} from 'lucide-react';

interface ClinicalHistoryModuleProps {
  config: DoctorConfig;
  records: ClinicalRecord[];
  activeRecord: ClinicalRecord;
  onSelectRecord: (record: ClinicalRecord) => void;
  onUpdateRecord: (updated: Partial<ClinicalRecord>) => void;
  onSaveRecord: (record: ClinicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNewRecord: () => void;
  onTransferToRecipe: (patientName: string, patientAge: string, patientCI: string, diagnosis: string) => void;
  onPrint: () => void;
  onSaveAndShare?: (shouldDownload?: boolean) => void;
  onBackToHome?: () => void;
}

export const ClinicalHistoryModule: React.FC<ClinicalHistoryModuleProps> = ({
  config,
  records,
  activeRecord,
  onSelectRecord,
  onUpdateRecord,
  onSaveRecord,
  onDeleteRecord,
  onNewRecord,
  onTransferToRecipe,
  onPrint,
  onSaveAndShare,
  onBackToHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'anamnesis' | 'vitales' | 'examen' | 'impresion'>('anamnesis');

  // Filtered patients
  const filteredRecords = records.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patientCI.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Automated BMI Calculator
  const pesoNum = parseFloat(activeRecord.vitalSigns?.peso || '0');
  const tallaNum = parseFloat(activeRecord.vitalSigns?.talla || '0');
  let calculatedImc = '';
  let imcClass = '';

  if (pesoNum > 0 && tallaNum > 0) {
    const tallaM = tallaNum > 3 ? tallaNum / 100 : tallaNum; // if in cm or meters
    const imc = pesoNum / (tallaM * tallaM);
    calculatedImc = imc.toFixed(1);

    if (imc < 18.5) imcClass = 'Bajo peso';
    else if (imc < 25) imcClass = 'Normal (Eutrófico)';
    else if (imc < 30) imcClass = 'Sobrepeso';
    else if (imc < 35) imcClass = 'Obesidad Grado I';
    else if (imc < 40) imcClass = 'Obesidad Grado II';
    else imcClass = 'Obesidad Mórbida (Grado III)';
  }

  const handleUpdateVital = (key: string, val: string) => {
    onUpdateRecord({
      vitalSigns: {
        ...activeRecord.vitalSigns,
        [key]: val,
        imc: key === 'peso' || key === 'talla' ? calculatedImc : activeRecord.vitalSigns.imc,
      },
    });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 items-start">
      
      {/* Left Patient Directory (no-print) */}
      <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition-colors border border-slate-300/80 cursor-pointer"
                title="Volver a la pantalla principal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
                <span>Inicio</span>
              </button>
            )}
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pacientes</h3>
          </div>
          <button
            onClick={onNewRecord}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* List */}
        <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No se encontraron historias clínicas.
            </div>
          ) : (
            filteredRecords.map((r) => {
              const isSelected = r.id === activeRecord.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRecord(r)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 text-blue-900 shadow-2xs font-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-slate-900 truncate">{r.patientName || 'Paciente sin nombre'}</p>
                    <p className="text-[11px] text-slate-500">
                      {r.patientCI ? `CI: ${r.patientCI}` : 'Sin CI'} · {r.patientAge || '-- años'}
                    </p>
                  </div>
                  {records.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(r.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar esta historia"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Clinical History Document */}
      <div className="flex-1 w-full flex flex-col items-center">
        
        {/* Actions bar (no-print) */}
        <div className="w-full max-w-[850px] mb-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Historia Clínica N°:</span>
            <span className="font-mono text-blue-600 font-semibold">{activeRecord.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Rojo: Dejar en Blanco */}
            <button
              type="button"
              onClick={() => {
                onUpdateRecord({
                  patientName: '',
                  patientAge: '',
                  patientCI: '',
                  patientPhone: '',
                  patientEmail: '',
                  patientAddress: '',
                  reason: '',
                  currentIllness: '',
                  personalAntecedents: '',
                  familyAntecedents: '',
                  surgicalAntecedents: '',
                  allergies: '',
                  currentMedication: '',
                  habits: '',
                  physicalExam: '',
                  diagnoses: '',
                  treatmentPlan: '',
                  notes: '',
                  vitalSigns: {
                    ta: '120/80',
                    fc: '72',
                    fr: '16',
                    temp: '36.5',
                    satO2: '98',
                    peso: '',
                    talla: '',
                    imc: '',
                  },
                });
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-500"
              title="Dejar esta historia clínica en blanco para un nuevo paciente"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
              <span>Dejar en Blanco</span>
            </button>

            <button
              onClick={() => onTransferToRecipe(
                activeRecord.patientName,
                activeRecord.patientAge,
                activeRecord.patientCI,
                activeRecord.diagnoses
              )}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors"
              title="Pasar paciente al módulo de Récipes para recetar"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Emitir Récipe</span>
            </button>

            <button
              onClick={() => onSaveRecord(activeRecord)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-lg flex items-center gap-1 transition-colors"
              title="Guardar ficha médica en la base de datos"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>💾 Guardar Ficha</span>
            </button>

            {onSaveAndShare && (
              <button
                type="button"
                onClick={() => {
                  if (onSaveAndShare) {
                    (onSaveAndShare as any)(true);
                  }
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-95 transition-all border border-blue-400/40 cursor-pointer"
                title="Guardar paciente y descargar PDF directamente. Al descargar, se abrirán las opciones de WhatsApp y Correo."
              >
                <Download className="w-4 h-4 text-blue-100" />
                <span>Descargar PDF</span>
              </button>
            )}

            <button
              onClick={onPrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Imprimir documento físico"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Printable History Sheet */}
        <div
          className={`relative w-full max-w-[850px] min-h-[1080px] shadow-xl p-8 transition-all print-container flex flex-col justify-between ${
            config.enforcePureBlackText ? 'enforce-pure-black' : ''
          }`}
          style={{
            backgroundColor: config.tonePapel || '#ffffff',
            border: (() => {
              const color = config.primaryDocColor || '#2563eb';
              switch (config.borderStyle) {
                case 'doble':
                  return `4px double ${color}`;
                case 'fino':
                  return `1px solid ${color}88`;
                case 'ninguno':
                  return 'none';
                case 'elegante':
                  return `3px double ${color}`;
                case 'solido':
                default:
                  return `2px solid ${color}`;
              }
            })(),
            borderRadius: config.docCornerRadius || '16px',
          }}
        >
          {/* Watermark */}
          {config.marcaAgua && (
            <div
              className="marca-agua"
              style={{
                backgroundImage: `url(${config.marcaAgua})`,
                opacity: config.watermarkOpacity,
                backgroundSize: `${config.watermarkScale || 55}% auto`,
                transform: `rotate(${config.watermarkRotation || 0}deg)`,
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full flex-1">
            <DocumentHeader config={config} />

            <div className="text-center my-2 pb-1 border-b border-slate-200">
              <h2
                className="text-base font-bold uppercase tracking-wider"
                style={{ color: config.headerColor, fontFamily: config.fuenteHeader }}
              >
                HISTORIA CLÍNICA INTEGRAL
              </h2>
            </div>

            {/* 1. Datos del Paciente */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50/80 border border-slate-200 rounded-lg text-xs mb-3">
              <div>
                <label className="font-bold text-slate-700 block text-[11px]">Paciente:</label>
                <input
                  type="text"
                  value={activeRecord.patientName}
                  onChange={(e) => onUpdateRecord({ patientName: e.target.value })}
                  placeholder="Nombre y Apellidos"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-[11px]">C.I. / Pasaporte:</label>
                <input
                  type="text"
                  value={activeRecord.patientCI}
                  onChange={(e) => onUpdateRecord({ patientCI: e.target.value })}
                  placeholder="V-00.000.000"
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-[11px]">Edad / Sexo:</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={activeRecord.patientAge}
                    onChange={(e) => onUpdateRecord({ patientAge: e.target.value })}
                    placeholder="35 años"
                    className="w-16 bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900"
                  />
                  <select
                    value={activeRecord.patientGender}
                    onChange={(e) => onUpdateRecord({ patientGender: e.target.value as any })}
                    className="bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900"
                  >
                    <option value="M">Masc</option>
                    <option value="F">Fem</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block text-[11px]">Teléfono / Contacto:</label>
                <input
                  type="text"
                  value={activeRecord.patientPhone}
                  onChange={(e) => onUpdateRecord({ patientPhone: e.target.value })}
                  placeholder="+58 412..."
                  className="w-full bg-transparent border-b border-dashed border-slate-300 outline-none text-slate-900"
                />
              </div>
            </div>

            {/* 2. Banner de Alergias Crítico */}
            <div className="p-2.5 rounded-lg border border-red-300 bg-red-50/80 mb-3 flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-red-800 uppercase tracking-wide">Alergias Conocidas (Medicamentos / Alimentos):</span>
                <input
                  type="text"
                  value={activeRecord.allergies}
                  onChange={(e) => onUpdateRecord({ allergies: e.target.value })}
                  placeholder="Ej: Penicilina, AINEs, Dipirona, Mariscos, Ninguna conocida..."
                  className="w-full bg-transparent border-b border-dashed border-red-300 text-red-900 font-semibold outline-none mt-0.5"
                />
              </div>
            </div>

            {/* 3. Signos Vitales y Triaje */}
            <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg mb-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-900 uppercase flex items-center gap-1 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Signos Vitales y Somatometría
                </span>
                {calculatedImc && (
                  <span className="font-semibold text-blue-800">
                    IMC: {calculatedImc} kg/m² ({imcClass})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                <div>
                  <span className="text-[10px] text-slate-600 block">T/A (mmHg):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.ta || ''}
                    onChange={(e) => handleUpdateVital('ta', e.target.value)}
                    placeholder="120/80"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">FC (lpm):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.fc || ''}
                    onChange={(e) => handleUpdateVital('fc', e.target.value)}
                    placeholder="75"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">FR (rpm):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.fr || ''}
                    onChange={(e) => handleUpdateVital('fr', e.target.value)}
                    placeholder="16"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Temp (°C):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.temp || ''}
                    onChange={(e) => handleUpdateVital('temp', e.target.value)}
                    placeholder="36.5"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">SatO2 (%):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.satO2 || ''}
                    onChange={(e) => handleUpdateVital('satO2', e.target.value)}
                    placeholder="98"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Peso (kg):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.peso || ''}
                    onChange={(e) => handleUpdateVital('peso', e.target.value)}
                    placeholder="70"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Talla (cm):</span>
                  <input
                    type="text"
                    value={activeRecord.vitalSigns?.talla || ''}
                    onChange={(e) => handleUpdateVital('talla', e.target.value)}
                    placeholder="172"
                    className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Anamnesis y Antecedentes */}
            <div className="space-y-2.5 text-xs text-slate-800 flex-1">
              <div>
                <label className="font-bold block text-slate-800" style={{ color: config.headerColor }}>
                  MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL:
                </label>
                <textarea
                  value={activeRecord.currentIllness}
                  onChange={(e) => onUpdateRecord({ currentIllness: e.target.value })}
                  placeholder="Inicio de síntomas, evolución cronológica, características del dolor, factores agravantes/atenuantes..."
                  className="w-full min-h-[55px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block text-slate-800 text-[11px]" style={{ color: config.headerColor }}>
                    ANTECEDENTES PATOLÓGICOS / QUIRÚRGICOS:
                  </label>
                  <textarea
                    value={activeRecord.personalAntecedents}
                    onChange={(e) => onUpdateRecord({ personalAntecedents: e.target.value })}
                    placeholder="HTA, Diabetes, Asma, Cardiopatías, Cirugías previas..."
                    className="w-full min-h-[45px] p-1.5 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold block text-slate-800 text-[11px]" style={{ color: config.headerColor }}>
                    MEDICACIÓN HABITUAL Y HÁBITOS:
                  </label>
                  <textarea
                    value={activeRecord.currentMedication}
                    onChange={(e) => onUpdateRecord({ currentMedication: e.target.value })}
                    placeholder="Tratamiento regular, dosis, tabaquismo, alcohol..."
                    className="w-full min-h-[45px] p-1.5 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Examen Físico */}
              <div>
                <label className="font-bold block text-slate-800" style={{ color: config.headerColor }}>
                  EXAMEN FÍSICO SEGMENTARIO:
                </label>
                <textarea
                  value={activeRecord.physicalExam}
                  onChange={(e) => onUpdateRecord({ physicalExam: e.target.value })}
                  placeholder="Estado general, piel/mucosas, cardiopulmonar, abdomen, extremidades, neurológico..."
                  className="w-full min-h-[55px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Diagnósticos y Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block text-slate-800" style={{ color: config.headerColor }}>
                    IMPRESIÓN DIAGNÓSTICA (CIE-10):
                  </label>
                  <textarea
                    value={activeRecord.diagnoses}
                    onChange={(e) => onUpdateRecord({ diagnoses: e.target.value })}
                    placeholder="1. Diagnóstico Principal..."
                    className="w-full min-h-[50px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold block text-slate-800" style={{ color: config.headerColor }}>
                    PLAN DE TRATAMIENTO Y CONDUCTA:
                  </label>
                  <textarea
                    value={activeRecord.treatmentPlan}
                    onChange={(e) => onUpdateRecord({ treatmentPlan: e.target.value })}
                    placeholder="Conducta médica inmediata, estudios solicitados, paraclínicos..."
                    className="w-full min-h-[50px] p-2 bg-transparent border border-slate-200 rounded focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3">
              <DocumentFooter config={config} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
