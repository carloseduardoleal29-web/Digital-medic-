import React, { useState } from 'react';
import { DoctorConfig, ClinicalRecord } from '../types';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';
import { getDocumentBorderStyle, getPaperTextureClass } from '../utils/documentStyles';
import { 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Share2, 
  ArrowLeft, 
  Heart, 
  Activity, 
  Thermometer, 
  Clock, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  FileCheck,
  Search
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
  onTransferToRecipe?: (record: ClinicalRecord) => void;
  onPrint?: () => void;
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

  const borderStyle = getDocumentBorderStyle(config.borderStyle, config.primaryDocColor);
  const textureClass = getPaperTextureClass(config.paperTexture);

  const record = activeRecord || (records && records[0]) || {
    id: 'HC-001',
    patientName: '',
    patientAge: '',
    patientGender: 'M',
    patientCI: '',
    patientPhone: '',
    date: new Date().toLocaleDateString('es-VE'),
    vitalSigns: { ta: '120/80', fc: '72', fr: '16', temp: '36.5', satO2: '98', peso: '', talla: '', imc: '' },
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
  };

  const filteredRecords = records ? records.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patientCI.includes(searchTerm) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Action & Patient Switcher Bar */}
      <div className="w-full max-w-[880px] mb-4 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs no-print">
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition-colors border border-slate-300 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Volver</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewRecord}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Historia</span>
          </button>

          {onTransferToRecipe && record.patientName && (
            <button
              type="button"
              onClick={() => onTransferToRecipe(record)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pasar a Récipe</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          )}

          {onSaveAndShare && (
            <button
              type="button"
              onClick={() => onSaveAndShare(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Guardar / PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSaveRecord(record)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Records Drawer / Right Clinical Sheet */}
      <div className="w-full max-w-[880px] grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Sidebar: Saved Records List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col gap-2.5 h-fit no-print">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Historias ({records?.length || 0})</span>
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por paciente o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredRecords.map((r) => {
              const isSelected = r.id === record.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRecord(r)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex flex-col gap-0.5 ${
                    isSelected 
                      ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="truncate max-w-[130px]">{r.patientName || 'Paciente sin nombre'}</span>
                    {records.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(r.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                        title="Eliminar historia"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>CI: {r.patientCI || '—'}</span>
                    <span>{r.date || '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Printable Document: Historia Clínica Completa */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div 
            id="printable-document"
            className={`w-full max-w-[800px] bg-white rounded-xl shadow-lg p-6 border border-slate-300/80 transition-all ${textureClass}`}
            style={{ border: borderStyle }}
          >
            {/* Header Oficial */}
            <DocumentHeader config={config} title="HISTORIA CLÍNICA GENERAL" />

            {/* Datos Demográficos del Paciente */}
            <div className="mt-4 p-3 bg-slate-50/90 border border-slate-200 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Nombre y Apellido del Paciente</label>
                <input
                  type="text"
                  value={record.patientName}
                  onChange={(e) => onUpdateRecord({ patientName: e.target.value })}
                  placeholder="Ej: María Rodríguez"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Cédula de Identidad / ID</label>
                <input
                  type="text"
                  value={record.patientCI}
                  onChange={(e) => onUpdateRecord({ patientCI: e.target.value })}
                  placeholder="Ej: V-18.452.123"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Edad</label>
                  <input
                    type="text"
                    value={record.patientAge}
                    onChange={(e) => onUpdateRecord({ patientAge: e.target.value })}
                    placeholder="Ej: 34 años"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 text-xs outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Género</label>
                  <select
                    value={record.patientGender || 'M'}
                    onChange={(e) => onUpdateRecord({ patientGender: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-1 py-1 font-semibold text-slate-800 text-xs outline-none"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Signos Vitales y Biometría */}
            <div className="mt-3 p-3 bg-purple-50/40 border border-purple-200/80 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 mb-2 text-purple-900 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>SIGNOS VITALES Y BIOMETRÍA</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">T.A. (mmHg)</span>
                  <input
                    type="text"
                    value={record.vitalSigns?.ta || ''}
                    onChange={(e) => onUpdateRecord({ vitalSigns: { ...record.vitalSigns, ta: e.target.value } })}
                    placeholder="120/80"
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">F.C. (LPM)</span>
                  <input
                    type="text"
                    value={record.vitalSigns?.fc || ''}
                    onChange={(e) => onUpdateRecord({ vitalSigns: { ...record.vitalSigns, fc: e.target.value } })}
                    placeholder="72"
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Temp (°C)</span>
                  <input
                    type="text"
                    value={record.vitalSigns?.temp || ''}
                    onChange={(e) => onUpdateRecord({ vitalSigns: { ...record.vitalSigns, temp: e.target.value } })}
                    placeholder="36.5"
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">SatO2 (%)</span>
                  <input
                    type="text"
                    value={record.vitalSigns?.satO2 || ''}
                    onChange={(e) => onUpdateRecord({ vitalSigns: { ...record.vitalSigns, satO2: e.target.value } })}
                    placeholder="98"
                    className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Motivo de Consulta y Enfermedad Actual */}
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              <div>
                <label className="text-[11px] font-extrabold text-slate-800 uppercase block mb-1">Motivo de Consulta</label>
                <textarea
                  value={record.reason}
                  onChange={(e) => onUpdateRecord({ reason: e.target.value })}
                  rows={2}
                  placeholder="Describa brevemente la razón principal de la visita médica..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-800 uppercase block mb-1">Enfermedad Actual / Examen Físico</label>
                <textarea
                  value={record.currentIllness}
                  onChange={(e) => onUpdateRecord({ currentIllness: e.target.value })}
                  rows={3}
                  placeholder="Evolución del cuadro, semiología y hallazgos al examen físico..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-800 uppercase block mb-1">Diagnóstico e Impresión Clínica</label>
                <textarea
                  value={record.diagnoses}
                  onChange={(e) => onUpdateRecord({ diagnoses: e.target.value })}
                  rows={2}
                  placeholder="1. Diagnóstico principal&#10;2. Diagnósticos secundarios..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 resize-y"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-800 uppercase block mb-1">Plan de Tratamiento y Conducta</label>
                <textarea
                  value={record.treatmentPlan}
                  onChange={(e) => onUpdateRecord({ treatmentPlan: e.target.value })}
                  rows={3}
                  placeholder="Plan terapéutico, estudios indicados y conducta médica..."
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-lg p-2 text-xs outline-none focus:border-purple-500 resize-y"
                />
              </div>
            </div>

            {/* Footer Oficial */}
            <DocumentFooter config={config} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalHistoryModule;
