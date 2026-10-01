import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Sparkles, PenTool, ShieldCheck, Upload, Feather, Wand2 } from 'lucide-react';
import { 
  createDoctorStampSVG, 
  DoctorStampStyle,
  createCalligraphicSignatureSVG,
  CalligraphicStyle
} from '../data/defaultAssets';
import { removeDarkBackgroundAndEnhanceInk } from '../utils/imageCleanup';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string, target?: 'firma' | 'sello' | 'ambos') => void;
  doctorName: string;
  mpps: string;
  ci: string;
  specialty?: string;
  collegeNumber?: string;
  existingStamp?: string;
  existingSignature?: string;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  doctorName,
  mpps,
  ci,
  specialty = 'Médico Cirujano',
  collegeNumber = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Default to automated calligraphy signature so user doesn't have to struggle drawing on PC!
  const [activeTab, setActiveTab] = useState<'calligraphy' | 'stamp' | 'draw' | 'upload'>('calligraphy');
  
  // Calligraphic state
  const [calligStyle, setCalligStyle] = useState<CalligraphicStyle>('bucle-formal');
  const [calligInk, setCalligInk] = useState('#1e3a8a');
  const [customNameForSignature, setCustomNameForSignature] = useState(doctorName || 'Dr. Médico Especialista');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#1e3a8a');
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Sello generator state
  const [selectedStampStyle, setSelectedStampStyle] = useState<DoctorStampStyle>('con-firma');
  const [stampInkColor, setStampInkColor] = useState('#1e3a8a');

  // Uploaded state
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'firma' | 'sello'>('firma');

  useEffect(() => {
    if (doctorName) {
      setCustomNameForSignature(doctorName);
    }
  }, [doctorName]);

  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }, 60);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Drawing Canvas logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl, 'firma');
    onClose();
  };

  const handleSaveCalligraphic = () => {
    const svg = createCalligraphicSignatureSVG(customNameForSignature, calligStyle, calligInk);
    onSaveSignature(svg, 'firma');
    onClose();
  };

  const handleApplyOfficialStamp = () => {
    const stampSvg = createDoctorStampSVG(
      doctorName, 
      mpps, 
      ci, 
      stampInkColor, 
      specialty, 
      selectedStampStyle,
      collegeNumber
    );
    onSaveSignature(stampSvg, 'sello');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (typeof evt.target?.result === 'string') {
        const raw = evt.target.result;
        // Clean dark/shadow background automatically to ensure crisp transparency
        const cleaned = await removeDarkBackgroundAndEnhanceInk(raw, 215, true);
        setUploadedPreview(cleaned);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCleanBackgroundManually = async () => {
    if (!uploadedPreview) return;
    const cleaned = await removeDarkBackgroundAndEnhanceInk(uploadedPreview, 200, true);
    setUploadedPreview(cleaned);
  };

  const handleSaveUploaded = () => {
    if (uploadedPreview) {
      onSaveSignature(uploadedPreview, uploadTarget);
      onClose();
    }
  };

  const calligraphicPresets: { id: CalligraphicStyle; title: string; subtitle: string }[] = [
    { id: 'bucle-formal', title: 'Rúbrica con Bucle Superior', subtitle: 'Curva fluida con inicial mayúscula y floritura inferior' },
    { id: 'ejecutiva-pluma', title: 'Caligrafía Ejecutiva Inclinada', subtitle: 'Tinta de pluma a 65° con trazo continuo profesional' },
    { id: 'rapida-recipista', title: 'Firma Rápida de Récipe', subtitle: 'Trazo de consulta hospitalaria con subrayado y punto' },
    { id: 'iniciales-enlazadas', title: 'Iniciales con Rúbrica Envolvente', subtitle: 'Combinación elegante de iniciales con lazo circular' },
    { id: 'quirurgica-fluida', title: 'Manuscrito Quirúrgico', subtitle: 'Estilo dinámico y elegante de alta velocidad' },
    { id: 'autorizada-formal', title: 'Firma Médica Autorizada', subtitle: 'Línea de rúbrica con lazo de seguridad' },
  ];

  const stampPreviewSvg = createDoctorStampSVG(
    doctorName, 
    mpps, 
    ci, 
    stampInkColor, 
    specialty, 
    selectedStampStyle,
    collegeNumber
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Estudio de Firma & Sello Médico Digital</h3>
              <p className="text-xs text-slate-500">Elija una firma automática, genere un sello o suba su foto</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('calligraphy')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calligraphy'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            1. Rúbrica Automática (Sin dibujar)
          </button>

          <button
            onClick={() => setActiveTab('stamp')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stamp'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            2. Sello Oficial Húmedo
          </button>

          <button
            onClick={() => setActiveTab('draw')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'draw'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4 text-emerald-600" />
            3. Trazar con Ratón / Táctil
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-600" />
            4. Subir Foto / Escaneo
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: RÚBRICA CALIGRÁFICA AUTOMÁTICA (Resuelve el problema de dibujar con ratón) */}
          {activeTab === 'calligraphy' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">¡No necesita dibujar nada con el ratón ni con el dedo!</span>
                  <span>
                    El sistema genera una firma caligráfica realista con curvas elegantes a partir del nombre del médico.
                  </span>
                </div>
              </div>

              {/* Nombre a Firmar & Color de Tinta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre o Rótulo de la Firma:</label>
                  <input
                    type="text"
                    value={customNameForSignature}
                    onChange={(e) => setCustomNameForSignature(e.target.value)}
                    placeholder="Dr. Nombre y Apellido"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Color de Tinta de Firma:</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { label: 'Azul Cobalto', val: '#1e3a8a' },
                      { label: 'Negro Tinta Pluma', val: '#0f172a' },
                      { label: 'Violeta Clínico', val: '#6b21a8' },
                    ].map((ink) => (
                      <button
                        key={ink.val}
                        type="button"
                        onClick={() => setCalligInk(ink.val)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          calligInk === ink.val
                            ? 'border-slate-800 bg-white shadow-xs ring-1 ring-slate-400'
                            : 'border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ink.val }} />
                        <span className="text-[11px]">{ink.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modelos Caligráficos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Seleccione el Estilo de Firma Médica que más le guste:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {calligraphicPresets.map((p) => {
                    const previewSvg = createCalligraphicSignatureSVG(customNameForSignature, p.id, calligInk);
                    const isSelected = calligStyle === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCalligStyle(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {p.title}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <div 
                          className="w-full h-16 bg-white rounded-lg border border-slate-200/80 p-1 flex items-center justify-center my-1.5 overflow-hidden shadow-2xs"
                          dangerouslySetInnerHTML={{
                            __html: previewSvg.replace('data:image/svg+xml;utf8,', '')
                          }}
                        />
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {p.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELLO AUTOMÁTICO */}
          {activeTab === 'stamp' && (
            <div className="space-y-4">
              {/* Estilo de Sello */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Seleccione el Modelo de Sello Húmedo:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'con-firma', label: 'Sello con Rúbrica Superpuesta', desc: 'Sello oficial + firma azul manuscrita superpuesta' },
                    { id: 'oval', label: 'Ovalado Oficial de Médico', desc: 'Doble elipse con estrellas y MPPS' },
                    { id: 'rectangular', label: 'Rectangular Clásico', desc: 'Borde punteado y datos centrados' },
                    { id: 'circular', label: 'Circular con Caduceo', desc: 'Sello redondo institucional' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStampStyle(s.id as DoctorStampStyle)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedStampStyle === s.id
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`block font-bold text-xs ${selectedStampStyle === s.id ? 'text-blue-900' : 'text-slate-800'}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                        {s.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color de Tinta de Sello */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Tinta del Sello:</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Azul Cobalto', val: '#1e3a8a' },
                    { label: 'Violeta Clínico', val: '#6b21a8' },
                    { label: 'Negro Carbón', val: '#0f172a' },
                    { label: 'Verde Médico', val: '#0d9488' },
                  ].map((ink) => (
                    <button
                      key={ink.val}
                      type="button"
                      onClick={() => setStampInkColor(ink.val)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                        stampInkColor === ink.val
                          ? 'border-slate-800 bg-white shadow-xs ring-1 ring-slate-400'
                          : 'border-slate-200 hover:bg-white text-slate-600'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ink.val }} />
                      <span className="text-[11px]">{ink.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vista Previa en Vivo */}
              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[160px]">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                  Vista Previa en Vivo del Sello Generado
                </span>
                <div 
                  className="w-72 h-36 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-2 transition-all hover:scale-105"
                  dangerouslySetInnerHTML={{
                    __html: stampPreviewSvg.replace('data:image/svg+xml;utf8,', '')
                  }}
                />
                <span className="text-[11px] text-slate-500 mt-2 text-center">
                  Médico: <strong>{doctorName}</strong> · MPPS: <strong>{mpps}</strong> · C.I: <strong>{ci}</strong>
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: TRAZAR FIRMA A MANO (Opcional) */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-semibold">Tinta:</span>
                  <button
                    onClick={() => setStrokeColor('#1e3a8a')}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      strokeColor === '#1e3a8a' ? 'border-slate-800 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#1e3a8a' }}
                    title="Azul Cobalto"
                  />
                  <button
                    onClick={() => setStrokeColor('#0f172a')}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      strokeColor === '#0f172a' ? 'border-blue-600 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#0f172a' }}
                    title="Negro Carbón"
                  />
                  <button
                    onClick={() => setStrokeColor('#6b21a8')}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      strokeColor === '#6b21a8' ? 'border-slate-800 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: '#6b21a8' }}
                    title="Violeta"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-semibold">Grosor:</span>
                  <input
                    type="range"
                    min="1.5"
                    max="4.5"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                    className="w-20 accent-blue-600 h-1.5"
                  />
                </div>

                <button
                  onClick={handleClear}
                  className="px-2.5 py-1 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpiar Trazo
                </button>
              </div>

              {/* Drawing Area */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={190}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-[190px] touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-slate-400 text-xs flex flex-col items-center gap-1.5">
                    <PenTool className="w-6 h-6 opacity-40 text-blue-600" />
                    <span className="font-semibold text-slate-500">Trace con ratón o pantalla táctil</span>
                    <span className="text-[10px] text-slate-400">(Si se le dificulta, use la pestaña 1 para elegir una firma automática)</span>
                  </div>
                )}
                <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none" />
              </div>
            </div>
          )}

          {/* TAB 4: SUBIR FOTO O ESCANEO DE FIRMA O SELLO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 text-xs text-purple-900">
                <span className="font-bold block mb-1">¿Qué imagen vas a cargar?</span>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUploadTarget('sello')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      uploadTarget === 'sello'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Es el SELLO Oficial (Foto o PNG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTarget('firma')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      uploadTarget === 'firma'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Feather className="w-4 h-4" />
                    <span>Es la FIRMA Real del Médico (Foto de hoja blanca)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Al guardarla por separado, nunca se borrará tu sello ni tu firma. Podrás ajustar el tamaño y mover cada uno libremente donde tú quieras.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-2xl bg-purple-50/30 hover:bg-purple-50/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-800 block">
                    Haga clic aquí para seleccionar foto o escaneo
                  </span>
                  <span className="text-xs text-slate-500">
                    {uploadTarget === 'sello' 
                      ? 'Foto del sello húmedo de goma o archivo transparente PNG' 
                      : 'Firme con bolígrafo en una hoja de papel blanco limpia, tome una foto y súbala aquí'}
                  </span>
                </div>
              </div>

              {uploadedPreview && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Vista previa para {uploadTarget === 'sello' ? 'Sello Oficial' : 'Firma Real del Médico'} (Sin fondo):
                  </span>
                  <img
                    src={uploadedPreview}
                    alt="Subida preview"
                    className="max-h-36 max-w-full object-contain bg-white rounded-lg border border-slate-200 p-2 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleCleanBackgroundManually}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    title="Remover fondo y realzar tinta azul/negra"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Hacer Fondo Más Transparente y Nítido</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Se propaga a todos los formatos y récipes del médico
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            {activeTab === 'calligraphy' && (
              <button
                onClick={handleSaveCalligraphic}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar Esta Rúbrica Médica</span>
              </button>
            )}

            {activeTab === 'stamp' && (
              <button
                onClick={handleApplyOfficialStamp}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar Sello Oficial</span>
              </button>
            )}

            {activeTab === 'draw' && (
              <button
                onClick={handleSaveDrawn}
                disabled={!hasDrawn}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-colors ${
                  hasDrawn
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Guardar Firma Trazada</span>
              </button>
            )}

            {activeTab === 'upload' && (
              <button
                onClick={handleSaveUploaded}
                disabled={!uploadedPreview}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-colors ${
                  uploadedPreview
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Guardar Imagen Cargada</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
