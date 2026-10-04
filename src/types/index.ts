export interface DoctorConfig {
  id: string;
  profileName: string;
  doctorName: string;
  specialty: string;
  mpps: string;
  ci: string;
  collegeNumber: string;
  phone: string;
  email: string;
  socialHandle?: string;
  socialHandle2?: string;
  institution?: string;
  institutionDetails: string;
  headerStyle: 'clasico' | 'moderno' | 'minimalista' | 'institucional';
  headerLayout: 'logo-izq' | 'logo-der' | 'ambos-logos' | 'sin-logos';
  tonePapel: string;
  fuenteHeader: string;
  headerColor: string;
  fuenteNombre: string;
  nombreSize: string;
  nombreColor: string;
  primaryDocColor: string;
  borderStyle: 'ninguno' | 'solido' | 'doble' | 'elegante';
  docCornerRadius: string;
  logoSize: number;
  formaLogo: 'logo-redondo' | 'logo-cuadrado';
  watermarkOpacity: number;
  watermarkScale: number;
  watermarkRotation: number;
  logoIzq: string;
  logoDer: string;
  marcaAgua: string;
  firmaImg: string;
  selloImg: string;
  selloFirma: string;
  rxTitle: string;
  rxTitleColor: string;
  bodyFontSize: string;
  footerNotesText: string;
  footerDisclaimer: string;
  signatureTitle: string;
  showMedicalSymbols?: boolean;
  medicalSymbolType?: 'esculapio' | 'cruz' | 'corazon' | 'institucional';
  medicalSymbolColor?: string;
  folioPrefix: string;
  folioNumber: number;
  isPaidClient: boolean;
  paidPlanName: string;
  paymentStatus: 'activo' | 'pendiente' | 'vencido' | 'prueba';
  isAdmin?: boolean;
  isVip?: boolean;
  subscriptionPlan?: string;
  updatedAt?: number;
  password?: string;
  rif?: string;
  enforcePureBlackText?: boolean;
  doctorPhoto?: string;
  paymentVoucherImg?: string;
  paymentVoucherNotes?: string;
  paidUntilDate?: string;
  requestedPlan?: string;
  stampPosX?: number;
  stampPosY?: number;
  signaturePosX?: number;
  signaturePosY?: number;
  footerNotesSize?: string;
  footerNotesColor?: string;
  disclaimerSize?: string;
  disclaimerColor?: string;
  signatureSize?: string | number;
  stampSize?: string | number;
  signatureTitleSize?: string;
  signatureTitleColor?: string;
  institutionColor?: string;
  fuenteInstitution?: string;
  institutionSize?: string;
  specialtyColor?: string;
  fuenteSpecialty?: string;
  specialtySize?: string;
  fuenteCredentials?: string;
  credentialsColor?: string;
  credentialsSize?: string;
  fuenteDetails?: string;
  detailsColor?: string;
  detailsSize?: string;
  fuenteContact?: string;
  contactColor?: string;
  contactSize?: string;
  headerScaleCompact?: number;
  paperTexture?: string;
  rxBodyFontFamily?: string;
  indicationsFontSize?: string;
  indicationsFontFamily?: string;
  reportFontSize?: string;
  reportFontFamily?: string;
  medicalRestFontSize?: string;
  medicalRestFontFamily?: string;
  rxDividerStyle?: string;
  stampAlign?: string;
  footerDisclaimerSize?: string;
  footerDisclaimerColor?: string;
  trialDaysTotal?: number;
  trialStartDate?: string;
  trialEndDate?: string;
  registrationDate?: string;
  patientBarSize?: string;
  colorPalettePreset?: string;
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
  patientGender: string;
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
  reportType: 'consulta' | 'referencia' | 'evaluacion' | 'general';
  title: string;
  reasonForConsultation: string;
  clinicalSummary: string;
  procedures: string;
  paraclinicalStudies: string;
  diagnosticImpression: string;
  treatmentPlan: string;
  recommendations: string;
  daysRest: string;
  restStartDate: string;
  restEndDate: string;
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

export interface SavedPatientEntry {
  id: string;
  patientName: string;
  patientCI: string;
  patientAge: string;
  patientPhone: string;
  patientEmail?: string;
  indicationsNotes?: string;
  date: string;
  diagnosis: string;
  rp: string;
  sourceModule: 'recipe' | 'historia' | 'informe' | 'indicaciones' | 'reposo';
}

export type ActiveModule = 'inicio' | 'recipe' | 'recipe-4en1' | 'recipe-master' | 'informe' | 'informes' | 'indicaciones' | 'reposo' | 'historia' | 'historias' | 'suscripcion' | 'diseno';
