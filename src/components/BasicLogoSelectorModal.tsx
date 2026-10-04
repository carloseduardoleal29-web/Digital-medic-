import React, { useRef, useState, useMemo } from 'react';
import { X, Upload, Trash2, Check, Sparkles, Search, Filter } from 'lucide-react';
import { BASIC_MEDICAL_LOGOS, BasicMedicalLogo } from '../data/defaultAssets';

interface BasicLogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'logoIzq' | 'logoDer';
  currentLogo?: string;
  onSelectLogo: (side: 'logoIzq' | 'logoDer', dataUrl: string) => void;
  onRemoveLogo?: (side: 'logoIzq' | 'logoDer') => void;
}

export const BasicLogoSelectorModal: React.FC<BasicLogoSelectorModalProps> = ({
  isOpen,
  onClose,
  side,
  currentLogo,
  onSelectLogo,
  onRemoveLogo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  // Fast keywords mapping for instant search relevance
  const KEYWORD_MAP: Record<string, string[]> = {
    'obstetricia-embarazo': ['embarazo', 'embarazada', 'mujer', 'parto', 'bebe', 'feto', 'madre', 'ginecologia', 'maternidad', 'utero'],
    'anestesiologia-laringo': ['anestesia', 'anestesiologia', 'laringoscopio', 'via aerea', 'intubacion', 'quirofano', 'sedacion'],
    'pediatria-pie': ['pediatria', 'puericultura', 'bebe', 'nino', 'infantil', 'huella', 'recien nacido', 'hijo'],
    'cirugia-bisturi': ['cirugia', 'cirujano', 'bisturi', 'quirofano', 'operacion', 'corte', 'incision'],
    'cardio-pulso': ['cardiologia', 'corazon', 'electro', 'pulso', 'ritmo', 'cardiovascular'],
    'traumatologia-hueso': ['traumatologia', 'ortopedia', 'hueso', 'fractura', 'columna', 'vertebra', 'articulacion'],
    'neumonologia-pulmones': ['neumonologia', 'pulmones', 'respiratorio', 'bronquios', 'asma', 'traquea', 'aire'],
    'neurologia-cerebro': ['neurologia', 'cerebro', 'mente', 'sinapsis', 'neuro', 'cefalea', 'psiquiatria'],
    'oftalmologia-ojo': ['oftalmologia', 'ojo', 'vision', 'vista', 'optometria', 'retina', 'pupila'],
    'gastro-estomago': ['gastroenterologia', 'estomago', 'digestivo', 'colon', 'gastritis', 'reflujo'],
    'nefrologia-rinon': ['nefrologia', 'urologia', 'rinon', 'renal', 'orina', 'prostata'],
    'dermatologia-piel': ['dermatologia', 'piel', 'cutaneo', 'dermatoscopio', 'lupa', 'acne', 'lunar'],
    'otorrino-oido': ['otorrinolaringologia', 'oido', 'nariz', 'garganta', 'orl', 'audicion'],
    'emergencias-estrella': ['emergencia', 'urgencias', 'ambulancia', 'paramedico', 'estrella de la vida', 'socorro'],
    'psicologia-psi': ['psicologia', 'psi', 'mente', 'emocion', 'terapia', 'psiquiatria'],
    'dental-diente': ['odontologia', 'dental', 'diente', 'muela', 'sonrisa', 'dentista'],
    'laboratorio-microscopio': ['laboratorio', 'bioanalisis', 'microscopio', 'sangre', 'analisis', 'tubo'],
    'nutricion-manzana': ['nutricion', 'dietetica', 'dieta', 'manzana', 'peso', 'saludable'],
    'fisioterapia-movimiento': ['fisioterapia', 'rehabilitacion', 'movimiento', 'terapia fisica', 'kinesiologia'],
    'endocrino-tiroides': ['endocrinologia', 'tiroides', 'metabolismo', 'hormonas', 'diabetes']
  };

  const filteredLogos = useMemo(() => {
    let list = BASIC_MEDICAL_LOGOS;

    // Filter by category filter pill
    if (selectedFilter !== 'todos') {
      if (selectedFilter === 'obstetricia') {
        list = list.filter(l => l.id.includes('obstetricia') || l.category.toLowerCase().includes('ginecolog'));
      } else if (selectedFilter === 'anestesia') {
        list = list.filter(l => l.id.includes('anestesi') || l.category.toLowerCase().includes('anestesi'));
      } else if (selectedFilter === 'pediatria') {
        list = list.filter(l => l.id.includes('pediatria') || l.category.toLowerCase().includes('pediatr'));
      } else if (selectedFilter === 'cirugia') {
        list = list.filter(l => l.id.includes('cirugia') || l.category.toLowerCase().includes('cirug'));
      } else if (selectedFilter === 'cardio-neumo') {
        list = list.filter(l => l.id.includes('cardio') || l.id.includes('neumono') || l.id.includes('esteto'));
      } else if (selectedFilter === 'oficiales') {
        list = list.filter(l => l.category.includes('Oficial') || l.category.includes('General') || l.category.includes('Institucional'));
      }
    }

    // Filter by search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(l => {
        const inName = l.name.toLowerCase().includes(q);
        const inCat = l.category.toLowerCase().includes(q);
        const inKeywords = (KEYWORD_MAP[l.id] || []).some(k => k.includes(q));
        return inName || inCat || inKeywords;
      });
    }

    return list;
  }, [searchQuery, selectedFilter]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        onSelectLogo(side, evt.target.result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const title = side === 'logoIzq' ? 'Logo Médico Izquierdo' : 'Logo Médico Derecho';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Seleccione el emblema oficial o de su especialidad médica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Option A: Upload custom logo from PC */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Subir logo personalizado</span>
                <span className="text-[10px] text-slate-400">Cargar imagen propia desde su PC o teléfono (PNG, JPG o SVG)</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Examinar</span>
            </button>
          </div>

          {/* Search Bar & Category Filters */}
          <div className="space-y-2.5 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por especialidad (ej. obstetricia, laringoscopio, pediatría, cardio, cirugía...)"
                className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Specialty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedFilter('todos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  selectedFilter === 'todos'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Todas ({BASIC_MEDICAL_LOGOS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('obstetricia')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'obstetricia'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
                }`}
              >
                <span>🌸 Obstetricia / Embarazo</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('anestesia')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'anestesia'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                <span>💉 Anestesia / Laringoscopio</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('pediatria')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'pediatria'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                }`}
              >
                <span>👶 Pediatría</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('cirugia')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'cirugia'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-800 text-teal-300 hover:bg-slate-700'
                }`}
              >
                <span>🔪 Cirugía</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('cardio-neumo')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'cardio-neumo'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                <span>🫀 Cardio / Respiratorio</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('oficiales')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'oficiales'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                }`}
              >
                <span>⚕️ Emblemas Oficiales</span>
              </button>
            </div>
          </div>

          {/* Grid of Medical Logos */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Logos Médicos por Especialidad ({filteredLogos.length})
              </span>
              <span className="text-[10px] text-slate-400">Haga clic en cualquiera para aplicarlo</span>
            </div>

            {filteredLogos.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">No se encontraron logos con ese término de búsqueda.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedFilter('todos'); }}
                  className="mt-2 text-xs text-blue-400 hover:underline font-bold"
                >
                  Ver todos los logos disponibles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredLogos.map((logo: BasicMedicalLogo) => {
                  const isSelected = currentLogo === logo.svgDataUri;
                  return (
                    <button
                      key={logo.id}
                      onClick={() => {
                        onSelectLogo(side, logo.svgDataUri);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all group relative cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/40'
                          : 'border-slate-800 bg-slate-950/70 hover:border-blue-500/50 hover:bg-slate-800/80 hover:scale-[1.02]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      
                      <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        <img 
                          src={logo.svgDataUri} 
                          alt={logo.name} 
                          className="w-full h-full object-contain" 
                          loading="lazy"
                        />
                      </div>

                      <div className="w-full">
                        <span className="text-[11px] font-bold text-slate-200 block line-clamp-2 leading-tight">
                          {logo.name}
                        </span>
                        <span className="text-[9px] text-blue-400/90 font-medium block mt-0.5 truncate">
                          {logo.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Option C: Remove Logo */}
          {currentLogo && onRemoveLogo && (
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">¿Desea dejar el encabezado sin logo en este lado?</span>
              <button
                onClick={() => {
                  onRemoveLogo(side);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar logo</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
