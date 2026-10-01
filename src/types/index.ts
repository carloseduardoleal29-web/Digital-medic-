export interface DoctorConfig {
  id: string;
  profileName: string; // Nombre del perfil / colega
  doctorName: string;
  specialty: string;
  mpps: string;
  ci: string;
  rif?: string;
  collegeNumber: string;
  phone: string;
  email: string;
  socialHandle: string;
  socialHandle2?: string;
  institution: string;
  institutionDetails: string;
  headerStyle: 'clasico' | 'moderno' | 'minimalista' | 'destacado';
  headerLayout?: 'ambos-logos' | 'solo-logo-izq' | 'solo-logo-der' | 'solo-texto' | 'centrado';
  tonePapel: string;
  paperTexture?: 'lisa' | 'verjurado' | 'seguridad' | 'lino' | 'milimetrado' | 'filigrana';
  fuenteHeader: string;
  headerColor: string;
  fuenteNombre: string;
  nombreSize: string;
  nombreColor: string;
  primaryDocColor: string;
  institutionSize?: string;
  institutionColor?: string;
  fuenteInstitution?: string;
  specialtySize?: string;
  specialtyColor?: string;
  fuenteSpecialty?: string;
  credentialsSize?: string;
  credentialsColor?: string;
  fuenteCredentials?: string;
  detailsSize?: string;
  detailsColor?: string;
  fuenteDetails?: string;
  contactSize?: string;
  contactColor?: string;
  fuenteContact?: string;
  footerNotesSize?: string;
  footerNotesColor?: string;
  disclaimerSize?: string;
  disclaimerColor?: string;
  footerDisclaimerSize?: string;
  footerDisclaimerColor?: string;
  signatureTitleSize?: string;
  signatureTitleColor?: string;
  borderStyle?: 'solido' | 'doble' | 'fino' | 'ninguno' | 'elegante' | 'ornamentado' | 'guilloche' | 'marco-clinico';
  docCornerRadius?: string;
  headerScaleCompact?: number; // Factor de escala para encabezado compacto (ej: 0.75 a 1.0)
  logoSize: number;
  formaLogo: 'logo-cuadrado' | 'logo-redondo';
  watermarkOpacity: number;
  watermarkScale: number; // 20% a 120%
  watermarkRotation?: number; // -45 a 45
  logoIzq: string;
  logoDer: string;
  marcaAgua: string;
  selloFirma: string; // Combined or legacy fallback
  selloImg?: string; // Sello del médico
  firmaImg?: string; // Firma real del médico
  stampSize?: number; // Ancho del sello en px (40 a 240, default: 110)
  signatureSize?: number; // Ancho de la firma en px (40 a 240, default: 110)
  stampPosX?: number; // Desplazamiento horizontal X (-100 a 100)
  stampPosY?: number; // Desplazamiento vertical Y (-100 a 100)
  signaturePosX?: number; // Desplazamiento horizontal X (-100 a 100)
  signaturePosY?: number; // Desplazamiento vertical Y (-100 a 100)
  stampAlign?: 'derecha' | 'centro' | 'izquierda' | 'superpuesto';
  rxTitle?: string;
  rxTitleColor?: string;
  rxBodyFontFamily?: string;
  rxDividerStyle?: 'tijera' | 'solido' | 'doble' | 'ninguno';
  rxPrescriptionBg?: 'blanco' | 'rayado' | 'cuadricula';
  accentDocColor?: string;
  colorPalettePreset?: string;
  bodyFontSize?: string;
  patientBarSize?: string;
  reportFontSize?: string;
  reportFontFamily?: string;
  indicationsFontSize?: string;
  indicationsFontFamily?: string;
  medicalRestFontSize?: string;
  medicalRestFontFamily?: string;
  footerNotesText: string;
  footerDisclaimer: string;
  signatureTitle: string;
  // Símbolos médicos al lado del nombre
  showMedicalSymbols?: boolean;
  medicalSymbolType?: 'esculapio' | 'cruz' | 'estetoscopio' | 'pulso' | 'caduceo' | 'rx';
  medicalSymbolColor?: string;
  // Foto o avatar del médico
  doctorPhoto?: string;
  // Folio y gestión de clientes pagos y versiones
  folioPrefix?: string;
  folioNumber?: number;
  isPaidClient?: boolean;
  paidPlanName?: string;
  paidUntilDate?: string;
  paymentStatus?: 'activo' | 'prueba' | 'pendiente' | 'vencido';
  password?: string; // Clave de acceso del médico asignada por el admin o creada en el registro
  subscriptionPlan?: 'mensual' | 'trimestral' | 'anual' | 'basico' | 'diseno-pro' | 'clinica-full'; // Planes: Mensual Pro ($10), Trimestral Pro ($28), Anual Master ($95)
  registrationDate?: string; // Fecha de ingreso / registro
  trialStartDate?: string; // Fecha ISO del inicio de la prueba gratuita
  trialEndDate?: string; // Fecha ISO del fin de la prueba gratuita (14 días después)
  trialDaysTotal?: number; // Total días otorgados de prueba (default 14)
  paymentVoucherImg?: string; // Foto/imagen del comprobante de pago
  paymentVoucherNotes?: string; // Mensaje / aviso para el administrador
  paymentVoucherDate?: string; // Fecha de envío del comprobante
  paymentMethodUsed?: string; // Método de pago utilizado (Pago Móvil, Binance, etc.)
  requestedPlan?: string; // Plan solicitado al pagar
  isAdmin?: boolean; // Acceso especial de Administrador Master (Exento de pagos y bloqueos)
  isVip?: boolean; // Usuario VIP con acceso exclusivo a Estudio de Diseño PRO
  enforcePureBlackText?: boolean; // Fuerza texto a negro puro (#000000) en todos los formatos para alta legibilidad
}

export interface RecipeItem {
  id: string;
  patientName: string;
  patientAge: string;
  patientCI: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  diagnosis: string;
  rp: string;
  indicationsNotes: string;
}

export interface VitalSigns {
  ta: string;
  fc: string;
  fr: string;
  temp: string;
  satO2: string;
  peso: string;
  talla: string;
  imc: string;
}

export interface ClinicalRecord {
  id: string;
  patientName: string;
  patientAge: string;
  patientGender: 'M' | 'F' | 'Otro';
  patientCI: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  bloodType: string;
  date: string;
  vitalSigns: VitalSigns;
  reason: string;
  currentIllness: string;
  personalAntecedents: string;
  familyAntecedents: string;
  surgicalAntecedents: string;
  allergies: string;
  currentMedication: string;
  habits: string;
  physicalExam: string;
  diagnoses: string;
  treatmentPlan: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface MedicalReport {
  id: string;
  patientName: string;
  patientAge: string;
  patientCI: string;
  patientPhone: string;
  patientGender: string;
  date: string;
  reportType: 'consulta' | 'quirurgico' | 'alta' | 'cardiologico' | 'general';
  title: string;
  reasonForConsultation: string;
  clinicalSummary: string;
  procedures: string;
  paraclinicalStudies: string;
  diagnosticImpression: string;
  treatmentPlan: string;
  recommendations: string;
  daysRest?: number | string;
  restStartDate?: string;
  restEndDate?: string;
  includeRest?: boolean;
  createdAt: number;
}

export interface IndicationsSheet {
  id: string;
  patientName: string;
  patientCI: string;
  patientPhone: string;
  patientAge: string;
  date: string;
  diagnosis: string;
  generalInstructions: string;
  medicationSchedule: string;
  dietAndRest: string;
  alarmSigns: string;
  nextAppointment: string;
}

export interface MedicalRestCert {
  id: string;
  patientName: string;
  patientCI: string;
  patientPhone: string;
  patientAge: string;
  patientOccupation: string;
  companyName: string;
  date: string;
  daysRest: number;
  startDate: string;
  endDate: string;
  diagnosis: string;
  observations: string;
}

export type ActiveModule = 
  | 'inicio'
  | 'diseno'
  | 'recipe-master'
  | 'recipe-4en1'
  | 'informes'
  | 'historias'
  | 'indicaciones'
  | 'reposo'
  | 'farmacos'
  | 'suscripcion';

export interface SavedPatientEntry {
  id: string;
  patientName: string;
  patientCI: string;
  patientAge: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  diagnosis: string;
  rp: string;
  indicationsNotes?: string;
  sourceModule?: 'recipe' | 'informe' | 'reposo' | 'historia';
}
