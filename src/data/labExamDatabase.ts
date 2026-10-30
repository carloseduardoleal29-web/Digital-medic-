export type LabCategoryKey = 
  | 'heces'
  | 'orina'
  | 'sangre_quimica'
  | 'hematologia'
  | 'rx'
  | 'ecografia'
  | 'especiales'
  | 'agregar';

export interface LabExamItem {
  id: string;
  name: string;
  category: LabCategoryKey;
  preparation?: string;
  popular?: boolean;
}

export interface LabCategoryMeta {
  id: LabCategoryKey;
  label: string;
  icon: string;
  badge: string;
  description: string;
  // Distinct colors for the colorful dropdown menus
  theme: {
    bgLight: string;
    bgHover: string;
    border: string;
    borderActive: string;
    headerBg: string;
    headerText: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    checkboxActive: string;
    tagBorder: string;
    cardGradient: string;
  };
}

export const LAB_CATEGORIES: LabCategoryMeta[] = [
  {
    id: 'heces',
    label: 'Heces y Digestivo',
    icon: '💩',
    badge: 'Coproanálisis',
    description: 'Heces simples, sangre oculta, coprocultivo, amibas, parásitos y moco fecal',
    theme: {
      bgLight: 'bg-amber-50/70',
      bgHover: 'hover:bg-amber-100/60',
      border: 'border-amber-200',
      borderActive: 'border-amber-500',
      headerBg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600',
      headerText: 'text-white',
      accentColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'text-amber-900',
      checkboxActive: 'text-amber-600',
      tagBorder: 'border-amber-300',
      cardGradient: 'from-amber-500/10 to-orange-500/10',
    },
  },
  {
    id: 'orina',
    label: 'Orina y Función Renal',
    icon: '💧',
    badge: 'Uroanálisis',
    description: 'Examen general de orina, urocultivo con antibiograma, depuración de creatinina y proteinuria',
    theme: {
      bgLight: 'bg-yellow-50/70',
      bgHover: 'hover:bg-yellow-100/60',
      border: 'border-yellow-200',
      borderActive: 'border-yellow-500',
      headerBg: 'bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500',
      headerText: 'text-slate-950 font-black',
      accentColor: 'text-yellow-700',
      badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      badgeText: 'text-yellow-900',
      checkboxActive: 'text-yellow-600',
      tagBorder: 'border-yellow-300',
      cardGradient: 'from-yellow-500/10 to-amber-500/10',
    },
  },
  {
    id: 'sangre_quimica',
    label: 'Química Sanguínea y Perfil 20',
    icon: '🧪',
    badge: 'Bioquímica',
    description: 'Perfil 20, glicemia, urea, creatinina, perfil lipídico, hepático, ácido úrico y electrolitos',
    theme: {
      bgLight: 'bg-sky-50/70',
      bgHover: 'hover:bg-sky-100/60',
      border: 'border-sky-200',
      borderActive: 'border-sky-500',
      headerBg: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600',
      headerText: 'text-white',
      accentColor: 'text-sky-700',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
      badgeText: 'text-sky-900',
      checkboxActive: 'text-sky-600',
      tagBorder: 'border-sky-300',
      cardGradient: 'from-sky-500/10 to-blue-500/10',
    },
  },
  {
    id: 'hematologia',
    label: 'Hematología y Coagulación',
    icon: '🩸',
    badge: 'Sangre y Coagulación',
    description: 'Hematología completa, plaquetas, tiempos PT/PTT/INR, fibrinógeno, VSG y frotis',
    theme: {
      bgLight: 'bg-rose-50/70',
      bgHover: 'hover:bg-rose-100/60',
      border: 'border-rose-200',
      borderActive: 'border-rose-500',
      headerBg: 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-600',
      headerText: 'text-white',
      accentColor: 'text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      badgeText: 'text-rose-900',
      checkboxActive: 'text-rose-600',
      tagBorder: 'border-rose-300',
      cardGradient: 'from-rose-500/10 to-red-500/10',
    },
  },
  {
    id: 'rx',
    label: 'Rayos X (Radiología)',
    icon: '🩻',
    badge: 'Imágenes Rx',
    description: 'Tórax PA/Lateral, abdomen simple, columna cervical/lumbar, senos paranasales y extremidades',
    theme: {
      bgLight: 'bg-slate-100/70',
      bgHover: 'hover:bg-slate-200/60',
      border: 'border-slate-300',
      borderActive: 'border-slate-600',
      headerBg: 'bg-gradient-to-r from-slate-800 via-slate-700 to-zinc-700',
      headerText: 'text-white',
      accentColor: 'text-slate-800',
      badgeBg: 'bg-slate-200 text-slate-900 border-slate-300',
      badgeText: 'text-slate-900',
      checkboxActive: 'text-slate-800',
      tagBorder: 'border-slate-400',
      cardGradient: 'from-slate-500/10 to-zinc-500/10',
    },
  },
  {
    id: 'ecografia',
    label: 'Ecografías / Ultrasonido',
    icon: '🩺',
    badge: 'Ultrasonografía',
    description: 'Abdominal, renal, pélvica, transvaginal, mamaria, tiroides, Doppler vascular y obstétrica',
    theme: {
      bgLight: 'bg-emerald-50/70',
      bgHover: 'hover:bg-emerald-100/60',
      border: 'border-emerald-200',
      borderActive: 'border-emerald-500',
      headerBg: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600',
      headerText: 'text-white',
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeText: 'text-emerald-900',
      checkboxActive: 'text-emerald-600',
      tagBorder: 'border-emerald-300',
      cardGradient: 'from-emerald-500/10 to-teal-500/10',
    },
  },
  {
    id: 'especiales',
    label: 'Estudios Especiales y Cardiología',
    icon: '🧬',
    badge: 'Paraclínicos Avanzados',
    description: 'ECG, Holter, MAPA, Endoscopia, Colonoscopia, Tomografía (TAC), Resonancia (RM) y Hormonas',
    theme: {
      bgLight: 'bg-purple-50/70',
      bgHover: 'hover:bg-purple-100/60',
      border: 'border-purple-200',
      borderActive: 'border-purple-500',
      headerBg: 'bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-600',
      headerText: 'text-white',
      accentColor: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      badgeText: 'text-purple-900',
      checkboxActive: 'text-purple-600',
      tagBorder: 'border-purple-300',
      cardGradient: 'from-purple-500/10 to-indigo-500/10',
    },
  },
  {
    id: 'agregar',
    label: 'Agregar Estudio Personalizado',
    icon: '➕',
    badge: 'Personalizado',
    description: 'Añada cualquier examen o estudio médico no listado para incluirlo en la orden',
    theme: {
      bgLight: 'bg-fuchsia-50/70',
      bgHover: 'hover:bg-fuchsia-100/60',
      border: 'border-fuchsia-200',
      borderActive: 'border-fuchsia-500',
      headerBg: 'bg-gradient-to-r from-fuchsia-700 via-pink-600 to-rose-600',
      headerText: 'text-white',
      accentColor: 'text-fuchsia-700',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
      badgeText: 'text-fuchsia-900',
      checkboxActive: 'text-fuchsia-600',
      tagBorder: 'border-fuchsia-300',
      cardGradient: 'from-fuchsia-500/10 to-pink-500/10',
    },
  },
];

export const PREPARATION_PRESETS: string[] = [
  'Ayuno estricto de 12 horas (solo se permite agua pura en poca cantidad).',
  'Ayuno de 8 horas.',
  'Muestra de heces fresca en envase estéril recolectada la misma mañana.',
  'Para sangre oculta en heces: No consumir carnes rojas, embutidos, remolacha ni vitamina C 3 días previos.',
  'Primera orina de la mañana (chorro medio) previo aseo genital con agua y jabón.',
  'Vejiga moderadamente llena (ingerir 4 a 5 vasos de agua 1 hora antes y no orinar).',
  'Vejiga vacía inmediatamente antes del procedimiento transvaginal.',
  'Acudir con ropa cómoda de dos piezas sin broches ni elementos metálicos.',
  'Sin preparación previa requerida.',
];

export const DEFAULT_LAB_EXAMS: LabExamItem[] = [
  // ==========================================
  // 💩 1. HECES Y COPROANÁLISIS (DIGESTIVO)
  // ==========================================
  { 
    id: 'heces-coproanalisis', 
    name: 'Examen de Heces / Coproanálisis Simple', 
    category: 'heces', 
    popular: true, 
    preparation: 'Muestra fecal fresca en recolector estéril' 
  },
  { 
    id: 'heces-sangre-oculta', 
    name: 'Sangre Oculta en Heces (Guayaco / Inmunoquímico)', 
    category: 'heces', 
    popular: true, 
    preparation: 'Dieta sin carnes rojas, embutidos, brócoli ni vitamina C por 72 horas previas' 
  },
  { 
    id: 'heces-copro-seriado', 
    name: 'Coproanálisis Seriado (3 muestras en días consecutivos)', 
    category: 'heces', 
    popular: true, 
    preparation: '3 recolectores debidamente identificados' 
  },
  { 
    id: 'heces-coprocultivo', 
    name: 'Coprocultivo con Antibiograma', 
    category: 'heces', 
    popular: true, 
    preparation: 'Muestra estéril obtenida antes de iniciar tratamiento antibiótico' 
  },
  { 
    id: 'heces-moco-fecal', 
    name: 'Citología de Moco Fecal (Polimorfonucleares y Mononucleares)', 
    category: 'heces', 
    popular: true 
  },
  { 
    id: 'heces-amibas-giardia', 
    name: 'Investigación de Amibas y Giardia lamblia al Fresco', 
    category: 'heces', 
    popular: true, 
    preparation: 'Muestra entregada al laboratorio en menos de 1 hora de emitida' 
  },
  { 
    id: 'heces-test-graham', 
    name: 'Test de Graham (Cinta adhesiva perianal para Oxiuros)', 
    category: 'heces', 
    preparation: 'Tomar la muestra en la mañana al despertar, sin aseo perianal previo' 
  },
  { 
    id: 'heces-hpylori', 
    name: 'Antígeno Fecal para Helicobacter pylori en Heces', 
    category: 'heces', 
    popular: true, 
    preparation: 'Suspender antibióticos y protectores gástricos 2 semanas antes si lo autoriza su médico' 
  },
  { 
    id: 'heces-rotavirus', 
    name: 'Rotavirus y Adenovirus en Heces (Inmunocromatografía)', 
    category: 'heces' 
  },
  { 
    id: 'heces-calprotectina', 
    name: 'Calprotectina Fecal Cuantitativa (Marcador de inflamación intestinal)', 
    category: 'heces', 
    popular: true 
  },
  { 
    id: 'heces-sudan', 
    name: 'Grasas Fecales (Tinción con Sudán III / Esteatocrito)', 
    category: 'heces' 
  },
  { 
    id: 'heces-sust-reductoras', 
    name: 'Sustancias Reductoras y pH en Heces', 
    category: 'heces' 
  },

  // ==========================================
  // 💧 2. ORINA Y FUNCIÓN RENAL (UROANÁLISIS)
  // ==========================================
  { 
    id: 'orina-uroanalisis', 
    name: 'Examen General de Orina (Uroanálisis Completo / Citoquímico y Sedimento)', 
    category: 'orina', 
    popular: true, 
    preparation: 'Primera orina de la mañana o chorro medio con aseo genital previo' 
  },
  { 
    id: 'orina-urocultivo', 
    name: 'Urocultivo con Antibiograma', 
    category: 'orina', 
    popular: true, 
    preparation: 'Aseo genital estricto con agua y jabón, recoger chorro medio en frasco estéril' 
  },
  { 
    id: 'orina-depuracion-creat', 
    name: 'Depuración de Creatinina en Orina de 24 horas (Clearance)', 
    category: 'orina', 
    popular: true, 
    preparation: 'Recolectar toda la orina durante exactamente 24 horas en botellón limpio refrigerado' 
  },
  { 
    id: 'orina-proteinuria-24h', 
    name: 'Proteínas / Proteinuria en Orina de 24 horas', 
    category: 'orina', 
    popular: true, 
    preparation: 'Recolección continua de orina de 24 horas' 
  },
  { 
    id: 'orina-microalbuminuria', 
    name: 'Microalbuminuria en Orina (Muestra aislada o 24 horas)', 
    category: 'orina', 
    popular: true 
  },
  { 
    id: 'orina-relacion-alb-creat', 
    name: 'Relación Albúmina / Creatinina en Orina (ACR)', 
    category: 'orina', 
    popular: true 
  },
  { 
    id: 'orina-electrolitos-24h', 
    name: 'Electrolitos en Orina de 24 horas (Sodio, Potasio, Cloro urinario)', 
    category: 'orina' 
  },
  { 
    id: 'orina-ac-urico-24h', 
    name: 'Ácido Úrico en Orina de 24 horas (Uricosuria)', 
    category: 'orina' 
  },
  { 
    id: 'orina-calcio-24h', 
    name: 'Calcio en Orina de 24 horas (Calciuria)', 
    category: 'orina' 
  },

  // ==========================================
  // 🧪 3. QUÍMICA SANGUÍNEA Y PERFIL 20
  // ==========================================
  { 
    id: 'quim-perfil-20', 
    name: 'Perfil 20 (Química Sanguínea Integral Completa)', 
    category: 'sangre_quimica', 
    popular: true, 
    preparation: 'Ayuno estricto de 12 horas' 
  },
  { 
    id: 'quim-basica', 
    name: 'Química Sanguínea Básica (Glicemia, Urea, Creatinina)', 
    category: 'sangre_quimica', 
    popular: true, 
    preparation: 'Ayuno de 8 a 12 horas' 
  },
  { 
    id: 'quim-glicemia', 
    name: 'Glicemia Basal en Ayunas', 
    category: 'sangre_quimica', 
    popular: true, 
    preparation: 'Ayuno de 8 a 12 horas' 
  },
  { 
    id: 'quim-hba1c', 
    name: 'Hemoglobina Glicosilada (HbA1c)', 
    category: 'sangre_quimica', 
    popular: true 
  },
  { 
    id: 'quim-glicemia-post', 
    name: 'Glicemia Postprandial (2 horas después de comer)', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-curva-tolerancia', 
    name: 'Curva de Tolerancia Oral a la Glucosa (PTOG con 75g)', 
    category: 'sangre_quimica', 
    preparation: 'Ayuno de 10-12h; disponer de 2 a 3 horas en el laboratorio' 
  },
  { 
    id: 'quim-urea-creat', 
    name: 'Urea, Creatinina Sérica y Nitrógeno Ureico (BUN)', 
    category: 'sangre_quimica', 
    popular: true 
  },
  { 
    id: 'quim-ac-urico', 
    name: 'Ácido Úrico Sérico', 
    category: 'sangre_quimica', 
    popular: true 
  },
  { 
    id: 'quim-perfil-lipidico', 
    name: 'Perfil Lipídico Completo (Colesterol Total, HDL, LDL, VLDL y Triglicéridos)', 
    category: 'sangre_quimica', 
    popular: true, 
    preparation: 'Ayuno estricto de 12 a 14 horas, sin alcohol 48h antes' 
  },
  { 
    id: 'quim-colesterol', 
    name: 'Colesterol Total y Fracciones', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-trigliceridos', 
    name: 'Triglicéridos Séricos', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-perfil-hepatico', 
    name: 'Perfil Hepático (TGO/AST, TGP/ALT, Bilirrubina Total/Fraccionada, Fosfatasa Alcalina, GGT)', 
    category: 'sangre_quimica', 
    popular: true 
  },
  { 
    id: 'quim-transaminasas', 
    name: 'Transaminasas (TGO / AST y TGP / ALT)', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-bilirrubinas', 
    name: 'Bilirrubina Total y Fraccionada (Directa e Indirecta)', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-fosfatasa-ggt', 
    name: 'Fosfatasa Alcalina (FA) y Gamma-Glutamil Transferasa (GGT)', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-proteinas-totales', 
    name: 'Proteínas Totales y Fraccionadas (Albúmina y Globulinas)', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-electrolitos', 
    name: 'Electrolitos Séricos (Sodio, Potasio, Cloro)', 
    category: 'sangre_quimica', 
    popular: true 
  },
  { 
    id: 'quim-calcio-fosf-mag', 
    name: 'Calcio Sérico, Magnesio y Fósforo', 
    category: 'sangre_quimica' 
  },
  { 
    id: 'quim-amilasa-lipasa', 
    name: 'Amilasa y Lipasa Sérica (Perfil Pancreático)', 
    category: 'sangre_quimica', 
    popular: true 
  },

  // ==========================================
  // 🩸 4. HEMATOLOGÍA Y COAGULACIÓN
  // ==========================================
  { 
    id: 'hem-completa', 
    name: 'Hematología Completa (Hemoglobina, Hematocrito, Plaquetas, Glóbulos Blancos y Fórmula)', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-coagulacion', 
    name: 'Tiempos de Coagulación (PT, PTT, Fibrinógeno, INR)', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-dimero-d', 
    name: 'Dímero D Cuantitativo', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-pcr', 
    name: 'Proteína C Reactiva (PCR Cuantitativa)', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-vsg', 
    name: 'Velocidad de Sedimentación Globular (VSG)', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-frotis', 
    name: 'Frotis de Sangre Periférica (Morfología eritrocitaria y leucocitaria)', 
    category: 'hematologia' 
  },
  { 
    id: 'hem-grupo-rh', 
    name: 'Grupo Sanguíneo y Factor Rh', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-perfil-ferrico', 
    name: 'Perfil de Hierro (Ferritina Sérica, Hierro Sérico y Capacidad de Fijación TIBC)', 
    category: 'hematologia', 
    popular: true 
  },
  { 
    id: 'hem-reticulocitos', 
    name: 'Conteo de Reticulocitos', 
    category: 'hematologia' 
  },

  // ==========================================
  // 🩻 5. RAYOS X (RADIOLOGÍA)
  // ==========================================
  { id: 'rx-torax-pa', name: 'Rx de Tórax PA (Posteroanterior)', category: 'rx', popular: true },
  { id: 'rx-torax-pa-lat', name: 'Rx de Tórax PA y Lateral', category: 'rx', popular: true },
  { id: 'rx-abdomen-simple', name: 'Rx de Abdomen Simple (De pie y decúbito)', category: 'rx', popular: true },
  { id: 'rx-columna-cervical', name: 'Rx de Columna Cervical (AP y Lateral)', category: 'rx', popular: true },
  { id: 'rx-columna-dorsal', name: 'Rx de Columna Torácica / Dorsal (AP y Lateral)', category: 'rx' },
  { id: 'rx-columna-lumbosacra', name: 'Rx de Columna Lumbosacra (AP y Lateral)', category: 'rx', popular: true },
  { id: 'rx-pelvis-caderas', name: 'Rx de Pelvis (AP) / Caderas Comparativas', category: 'rx', popular: true },
  { id: 'rx-rodilla', name: 'Rx de Rodilla (AP y Lateral con apoyo)', category: 'rx', popular: true },
  { id: 'rx-tobillo', name: 'Rx de Tobillo (AP, Lateral y Mortaja)', category: 'rx', popular: true },
  { id: 'rx-pie', name: 'Rx de Pie (AP y Oblicua)', category: 'rx' },
  { id: 'rx-senos-paranasales', name: 'Rx de Senos Paranasales (Waters, Caldwell y Lateral)', category: 'rx', popular: true },
  { id: 'rx-hombro', name: 'Rx de Hombro (AP Verdadera y Axilar)', category: 'rx', popular: true },
  { id: 'rx-mano-muneca', name: 'Rx de Mano y Muñeca (AP y Oblicua)', category: 'rx' },
  { id: 'rx-craneo', name: 'Rx de Cráneo (AP y Lateral)', category: 'rx' },
  { id: 'rx-cavum', name: 'Rx de Cavum Faríngeo (Lateral)', category: 'rx' },

  // ==========================================
  // 🩺 6. ECOGRAFÍAS / ULTRASONIDO
  // ==========================================
  { 
    id: 'eco-abdominal', 
    name: 'Ecografía Abdominal Completa (Hígado, Vesícula, Páncreas, Bazo y Riñones)', 
    category: 'ecografia', 
    popular: true, 
    preparation: 'Ayuno de 8 horas' 
  },
  { 
    id: 'eco-renal', 
    name: 'Ecografía Renal y Vías Urinarias (Vesical con residuo postmiccional)', 
    category: 'ecografia', 
    popular: true, 
    preparation: 'Vejiga moderadamente llena (beber 4 a 6 vasos de agua 1h antes)' 
  },
  { 
    id: 'eco-pelvica', 
    name: 'Ecografía Pélvica Ginecológica Suprapúbica', 
    category: 'ecografia', 
    popular: true, 
    preparation: 'Vejiga llena' 
  },
  { 
    id: 'eco-transvaginal', 
    name: 'Ecografía Transvaginal de Alta Resolución', 
    category: 'ecografia', 
    popular: true, 
    preparation: 'Vejiga vacía antes del examen' 
  },
  { 
    id: 'eco-obstetrica', 
    name: 'Ecografía Obstétrica', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-obst-genetica', 
    name: 'Ecografía Obstétrica Morfogenética / Detalle Anatómico', 
    category: 'ecografia' 
  },
  { 
    id: 'eco-tiroidea', 
    name: 'Ecografía Tiroidea con Doppler Color', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-mamaria', 
    name: 'Ecografía Mamaria Bilateral con Rastreo Ganglionar Axilar', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-prostatica', 
    name: 'Ecografía Prostática Suprapúbica y Vesical', 
    category: 'ecografia', 
    popular: true, 
    preparation: 'Vejiga llena' 
  },
  { 
    id: 'eco-testicular', 
    name: 'Ecografía Testicular / Escrotal con Doppler Color', 
    category: 'ecografia' 
  },
  { 
    id: 'eco-ecocardiograma', 
    name: 'Ecocardiograma Transtorácico Doppler Color', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-doppler-venoso', 
    name: 'Eco-Doppler Venoso de Miembros Inferiores', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-doppler-arterial', 
    name: 'Eco-Doppler Arterial de Miembros Inferiores', 
    category: 'ecografia' 
  },
  { 
    id: 'eco-doppler-carotideo', 
    name: 'Eco-Doppler de Troncos Supraórticos (Carotídeo y Vertebral)', 
    category: 'ecografia', 
    popular: true 
  },
  { 
    id: 'eco-partes-blandas', 
    name: 'Ecografía de Partes Blandas / Pared Abdominal / Hernias', 
    category: 'ecografia' 
  },

  // ==========================================
  // 🧬 7. ESTUDIOS ESPECIALES, HORMONAS Y PARACLÍNICOS
  // ==========================================
  { id: 'esp-ecg', name: 'Electrocardiograma (ECG de 12 derivaciones con informe)', category: 'especiales', popular: true },
  { id: 'esp-mapa', name: 'MAPA (Monitoreo Ambulatorio de Presión Arterial 24h)', category: 'especiales', popular: true },
  { id: 'esp-holter', name: 'Holter de Ritmo Cardíaco 24h (ECG continuo)', category: 'especiales', popular: true },
  { id: 'esp-ergometria', name: 'Prueba de Esfuerzo Cardiovascular (Ergometría computarizada)', category: 'especiales' },
  { id: 'esp-endoscopia', name: 'Endoscopia Digestiva Superior (Gastroscopia con Biopsia y Test de Ureasa)', category: 'especiales', popular: true, preparation: 'Ayuno estricto de 8 horas' },
  { id: 'esp-colonoscopia', name: 'Colonoscopia Total con Sedación y Biopsia', category: 'especiales', popular: true, preparation: 'Preparación colónica previa con dieta líquida y laxantes' },
  { id: 'esp-tac-craneo', name: 'Tomografía Computarizada (TC / TAC) de Cráneo Simple', category: 'especiales', popular: true },
  { id: 'esp-tac-torax', name: 'Tomografía Computarizada (TC) de Tórax de Alta Resolución (TACAR)', category: 'especiales', popular: true },
  { id: 'esp-tac-abdomen', name: 'Tomografía Computarizada (TC) de Abdomen y Pelvis con Doble Contraste', category: 'especiales', preparation: 'Ayuno 8h y creatinina sérica previa' },
  { id: 'esp-rmn-cerebral', name: 'Resonancia Magnética (RM) Cerebral', category: 'especiales', popular: true },
  { id: 'esp-rmn-columna', name: 'Resonancia Magnética (RM) de Columna Lumbosacra', category: 'especiales', popular: true },
  { id: 'esp-mamografia', name: 'Mamografía Bilateral Digital con Proyecciones Axilares', category: 'especiales', popular: true, preparation: 'Sin desodorante, talco ni crema corporal' },
  { id: 'esp-citologia', name: 'Citología Cérvico-Vaginal (Papanicolaou / PAP)', category: 'especiales', popular: true, preparation: 'Abstinencia sexual 48h antes, sin sangrado menstrual' },
  { id: 'esp-densitometria', name: 'Densitometría Ósea (Columna Lumbar y Cadera DEXA)', category: 'especiales', popular: true },
  { id: 'esp-espirometria', name: 'Espirometría Simple y con Broncodilatador', category: 'especiales' },
  { id: 'esp-perfil-tiroideo', name: 'Perfil Tiroideo Completo (TSH Ultrasensible y T4 Libre)', category: 'especiales', popular: true },
  { id: 'esp-psa', name: 'Antígeno Prostático Específico (PSA Total y Libre)', category: 'especiales', popular: true, preparation: 'Abstinencia sexual 48h antes' },
  { id: 'esp-serologia-vih-vdrl', name: 'Serología Infecciosa (VIH 1 y 2, VDRL, Hepatitis B y C)', category: 'especiales', popular: true },
  { id: 'esp-vit-d-b12', name: 'Vitamina D3 (25-OH) y Vitamina B12 Sérica', category: 'especiales' },
  { id: 'esp-beta-hcg', name: 'Subunidad Beta hCG Cuantitativa (Prueba de Embarazo)', category: 'especiales', popular: true },
];

export const getExamsByCategory = (category: LabCategoryKey): LabExamItem[] => {
  return DEFAULT_LAB_EXAMS.filter((e) => e.category === category);
};

export const searchLabExams = (query: string): LabExamItem[] => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return DEFAULT_LAB_EXAMS.filter(
    (e) => e.name.toLowerCase().includes(q) || (e.preparation && e.preparation.toLowerCase().includes(q))
  );
};
