import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
  MEDICINE_EMBLEM_ESCULAPIO_SVG,
  ANESTHESIOLOGY_LARYNGOSCOPE_SVG
} from '../data/defaultAssets';

export interface DatosRecipePDF {
  nombreMedico?: string;
  especialidad?: string;
  mpps?: string;
  ci?: string;
  rif?: string;
  cm?: string;
  institucion?: string;
  clinicaDireccion?: string;
  telefonoMedico?: string;
  emailMedico?: string;
  logoIzq?: string;
  logoDer?: string;
  primaryColor?: string;
  fuenteNombre?: string;
  nombreColor?: string;
  marcaAgua?: string;
  watermarkOpacity?: number;
  watermarkRotation?: number;
  selloBase64?: string;
  firmaBase64?: string;
  signatureTitle?: string;
  socialHandle?: string;
  socialHandle2?: string;
  footerDisclaimer?: string;
  footerNotesText?: string;

  nombrePaciente?: string;
  cedulaPaciente?: string;
  edadPaciente?: string;
  fecha?: string;
  telefonoPaciente?: string;
  diagnostico?: string;

  // Tone / Background
  tonePapel?: string;

  // Récipe 1 (Mitad Izquierda)
  textoRp?: string;
  tituloRecipe1?: string;

  // Récipe 2 o Indicaciones (Mitad Derecha)
  textoIndicaciones?: string;
  textoRecipe2?: string;
  tituloRecipe2?: string;

  // Structured Indications Fields for Emojis
  dietAndRest?: string;
  alarmSigns?: string;
  nextAppointment?: string;
  generalInstructions?: string;
  medicationSchedule?: string;
  documentType?: string;
  diasReposo?: number | string;
  fechaInicioReposo?: string;
  fechaFinReposo?: string;
  observacionesReposo?: string;
  motivoConsulta?: string;
  resumenClinico?: string;
  procedimientos?: string;
  estudiosParaclinicos?: string;
  impresionDiagnostica?: string;
  recomendacionesReporte?: string;
  reportTitle?: string;
}

export function convertSvgDataUrlToSvgString(src: string | undefined): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (trimmed.toLowerCase().startsWith('<svg')) {
    return trimmed;
  }
  if (trimmed.startsWith('data:image/svg+xml')) {
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex !== -1) {
      const meta = trimmed.substring(0, commaIndex);
      const rawContent = trimmed.substring(commaIndex + 1);
      if (meta.includes(';base64')) {
        try {
          const binary = atob(rawContent);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const decoded = new TextDecoder('utf-8').decode(bytes);
          if (decoded.includes('<svg')) {
            return decoded;
          }
        } catch (_) {
          try {
            const decoded = decodeURIComponent(escape(atob(rawContent)));
            if (decoded.includes('<svg')) return decoded;
          } catch (e2) {}
        }
      } else {
        try {
          const decoded = decodeURIComponent(rawContent);
          if (decoded.includes('<svg')) return decoded;
        } catch (_) {
          if (rawContent.includes('<svg')) return rawContent;
        }
      }
    }
  }
  return null;
}

export function safeFormatSrcUrl(src: string): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('<svg')) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.startsWith('data:image/svg+xml')) {
    if (trimmed.includes(';base64,')) return trimmed;
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex !== -1) {
      const rawContent = trimmed.substring(commaIndex + 1);
      try {
        const decoded = decodeURIComponent(rawContent);
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(decoded)}`;
      } catch (_) {
        const safeContent = encodeURI(rawContent).replace(/#/g, '%23');
        return `data:image/svg+xml;charset=utf-8,${safeContent}`;
      }
    }
  }
  return trimmed;
}

export function mountNativeLogoNode(
  container: HTMLElement | null,
  rawLogoVal: string | undefined,
  defaultSvg: string,
  altText: string,
  maxHeightPx: number = 68,
  maxWidthPx: number = 135
): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.minWidth = '56px';
  container.style.height = `${maxHeightPx}px`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  let val = (rawLogoVal && rawLogoVal.trim()) ? rawLogoVal.trim() : defaultSvg;
  if (!val) val = defaultSvg;

  // 1. Extraer SVG nativo si es SVG (para evitar que Firefox en Android bloquee/manche el canvas con <img>)
  const svgContent = convertSvgDataUrlToSvgString(val);
  if (svgContent) {
    container.innerHTML = svgContent;
    const svgEl = container.querySelector('svg');
    if (svgEl) {
      svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgEl.style.maxHeight = `${maxHeightPx}px`;
      svgEl.style.maxWidth = `${maxWidthPx}px`;
      svgEl.style.height = `${maxHeightPx}px`;
      // Si el viewBox es cuadrado (como el laringoscopio o esculapio 200x200), fijar width simétrico
      const vb = svgEl.getAttribute('viewBox') || '';
      const vbParts = vb.trim().split(/\s+|,/);
      if (vbParts.length === 4 && parseFloat(vbParts[2]) === parseFloat(vbParts[3])) {
        svgEl.style.width = `${maxHeightPx}px`;
      } else {
        svgEl.style.width = 'auto';
      }
      svgEl.style.objectFit = 'contain';
      svgEl.style.display = 'block';
    }
    return;
  }

  if (val.toLowerCase().startsWith('<img')) {
    const srcMatch = val.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      val = srcMatch[1].trim();
    }
  }

  const img = document.createElement('img');
  img.src = safeFormatSrcUrl(val);
  img.style.maxHeight = `${maxHeightPx}px`;
  img.style.maxWidth = `${maxWidthPx}px`;
  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.objectFit = 'contain';
  img.style.display = 'block';
  img.alt = altText;
  container.appendChild(img);
}

export function mountNativeStampAndSignatureNode(
  container: HTMLElement | null,
  rawSelloVal: string | undefined,
  rawFirmaVal: string | undefined,
  altText: string = 'Firma y Sello',
  maxHeightPx: number = 55
): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.alignItems = 'flex-end';
  container.style.justifyContent = 'center';
  container.style.gap = '12px';
  container.style.minHeight = `${maxHeightPx}px`;

  const appendSingleImg = (rawVal: string, defaultAlt: string) => {
    let val = rawVal.trim();
    if (!val) return;

    if (val.toLowerCase().startsWith('<svg')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = val;
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'flex-end';
      wrapper.style.justifyContent = 'center';
      container.appendChild(wrapper);
      return;
    }

    if (val.toLowerCase().startsWith('<img')) {
      const srcMatch = val.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        val = srcMatch[1].trim();
      }
    }

    const img = document.createElement('img');
    img.src = safeFormatSrcUrl(val);
    img.style.maxHeight = `${maxHeightPx}px`;
    img.style.maxWidth = '130px';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.alt = defaultAlt;
    container.appendChild(img);
  };

  if (rawFirmaVal && rawFirmaVal.trim()) {
    appendSingleImg(rawFirmaVal, 'Firma Digital');
  }
  if (rawSelloVal && rawSelloVal.trim()) {
    appendSingleImg(rawSelloVal, 'Sello Digital');
  }
}

export function mountNativeStampNode(
  container: HTMLElement | null,
  rawVal: string | undefined,
  altText: string,
  maxHeightPx: number = 50
): void {
  mountNativeStampAndSignatureNode(container, rawVal, undefined, altText, maxHeightPx);
}

let isGeneratingPdfLock = false;

export function extractDatosFromApp(
  config?: any,
  recipe?: any,
  indications?: any,
  customOpts?: Partial<DatosRecipePDF>
): DatosRecipePDF {
  let docConfig = config;
  if (!docConfig && typeof localStorage !== 'undefined') {
    try {
      const activeSessionId = localStorage.getItem('digital_medic_active_doctor_session');
      const colleaguesStr = localStorage.getItem('digital_medic_colleagues_v2');
      if (activeSessionId && colleaguesStr) {
        const colleagues = JSON.parse(colleaguesStr);
        if (Array.isArray(colleagues)) {
          const found = colleagues.find((c: any) => c.id === activeSessionId || c.email === activeSessionId);
          if (found) docConfig = found;
        }
      }
      if (!docConfig) {
        const stored = localStorage.getItem('digital_medic_doctor_config_v2') || localStorage.getItem('digital_medic_current_config');
        if (stored) docConfig = JSON.parse(stored);
      }
    } catch (_) {}
  }

  let curRecipe = recipe;
  let curRecipe2: any = null;
  if (!curRecipe && typeof localStorage !== 'undefined') {
    try {
      const storedEco = localStorage.getItem('digital_medic_user_ecosystem_v2');
      if (storedEco) {
        const parsed = JSON.parse(storedEco);
        if (parsed.recipes && parsed.recipes.length > 0) {
          curRecipe = parsed.recipes[0];
          if (parsed.recipes.length > 1) curRecipe2 = parsed.recipes[1];
        }
      }
      if (!curRecipe) {
        const storedRec = localStorage.getItem('digital_medic_recipes_v2');
        if (storedRec) {
          const parsedRecs = JSON.parse(storedRec);
          if (parsedRecs.length > 0) curRecipe = parsedRecs[0];
          if (parsedRecs.length > 1) curRecipe2 = parsedRecs[1];
        }
      }
    } catch (_) {}
  }

  let curIndications = indications;
  if (!curIndications && typeof localStorage !== 'undefined') {
    try {
      const storedInd = localStorage.getItem('digital_medic_indications_v2');
      if (storedInd) curIndications = JSON.parse(storedInd);

      const storedEco = localStorage.getItem('digital_medic_user_ecosystem_v2');
      if (storedEco && !curIndications) {
        const parsed = JSON.parse(storedEco);
        if (parsed.indications) curIndications = parsed.indications;
      }
    } catch (_) {}
  }

  const primaryColor = customOpts?.primaryColor || docConfig?.primaryDocColor || docConfig?.rxTitleColor || '#5A82CA';
  const fuenteNombre = customOpts?.fuenteNombre || docConfig?.fuenteNombre || "'Dancing Script', 'Playfair Display', Georgia, serif";
  const nombreColor = customOpts?.nombreColor || docConfig?.nombreColor || docConfig?.primaryDocColor || '#2563eb';
  const nombreMedico = customOpts?.nombreMedico || docConfig?.doctorName || 'Dr. Carlos E. Leal S.';
  const especialidad = customOpts?.especialidad || docConfig?.specialty || 'Especialista en Anestesiología y Reanimación';
  const mpps = customOpts?.mpps || docConfig?.mpps || '94.228';
  const ci = customOpts?.ci || docConfig?.ci || 'V15489288-1';
  const rif = customOpts?.rif || docConfig?.rif || 'V15489288-1';
  const cm = customOpts?.cm || docConfig?.collegeNumber || '';
  const institucion = customOpts?.institucion || docConfig?.institution || '';
  const clinicaDireccion = customOpts?.clinicaDireccion || docConfig?.address || docConfig?.clinicAddress || '';
  const telefonoMedico = customOpts?.telefonoMedico || docConfig?.phone || '';
  const emailMedico = customOpts?.emailMedico || docConfig?.email || '';

  const logoIzq = (customOpts?.logoIzq && customOpts.logoIzq.trim()) 
    ? customOpts.logoIzq 
    : ((docConfig?.logoIzq && docConfig.logoIzq.trim()) ? docConfig.logoIzq : DIGITAL_MEDIC_OFFICIAL_LOGO_SVG);
  const logoDer = (customOpts?.logoDer && customOpts.logoDer.trim()) 
    ? customOpts.logoDer 
    : ((docConfig?.logoDer && docConfig.logoDer.trim()) 
        ? docConfig.logoDer 
        : (docConfig?.specialty?.toLowerCase().includes('anest') ? ANESTHESIOLOGY_LARYNGOSCOPE_SVG : DIGITAL_MEDIC_OFFICIAL_LOGO_SVG));
  const marcaAgua = customOpts?.marcaAgua || docConfig?.marcaAgua || '';

  const selloBase64 = customOpts?.selloBase64 || docConfig?.selloImg || docConfig?.selloDigitalImg || '';
  const firmaBase64 = customOpts?.firmaBase64 || docConfig?.firmaImg || docConfig?.signatureImg || '';
  const signatureTitle = customOpts?.signatureTitle || docConfig?.signatureTitle || 'Firma y Sello del Médico Tratante';

  const nombrePaciente = customOpts?.nombrePaciente || curRecipe?.patientName || curIndications?.patientName || 'Carlos Leal';
  const cedulaPaciente = customOpts?.cedulaPaciente || curRecipe?.patientCI || curIndications?.patientCI || 'V-00.000.000';
  const edadPaciente = customOpts?.edadPaciente || curRecipe?.patientAge || curIndications?.patientAge || '—';
  const todayStrVE = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  const fecha = customOpts?.fecha || curRecipe?.date || todayStrVE;
  const telefonoPaciente = customOpts?.telefonoPaciente || curRecipe?.patientPhone || curIndications?.patientPhone || '';
  const diagnostico = customOpts?.diagnostico || curRecipe?.diagnosis || curIndications?.diagnosis || '';

  const textoRp = (customOpts?.textoRp && customOpts.textoRp.trim()) 
    ? customOpts.textoRp.trim() 
    : (curRecipe?.rp && curRecipe.rp.trim() ? curRecipe.rp.trim() : 'Prescripción médica facultativa.');

  const dietAndRest = customOpts?.dietAndRest || curIndications?.dietAndRest || '';
  const alarmSigns = customOpts?.alarmSigns || curIndications?.alarmSigns || '';
  const nextAppointment = customOpts?.nextAppointment || curIndications?.nextAppointment || '';
  const generalInstructions = customOpts?.generalInstructions || curIndications?.generalInstructions || '';
  const medicationSchedule = customOpts?.medicationSchedule || curIndications?.medicationSchedule || '';

  let textoIndicaciones = (customOpts?.textoIndicaciones && customOpts.textoIndicaciones.trim()) 
    ? customOpts.textoIndicaciones.trim() 
    : '';
  if (!textoIndicaciones && curIndications) {
    const parts = [
      generalInstructions ? generalInstructions.trim() : '',
      medicationSchedule ? medicationSchedule.trim() : '',
      dietAndRest ? `RECOMENDACIONES / DIETA Y REPOSO:\n${dietAndRest.trim()}` : '',
      alarmSigns ? `SIGNOS DE ALARMA:\n${alarmSigns.trim()}` : '',
      nextAppointment ? `PRÓXIMA CITA: ${nextAppointment.trim()}` : '',
    ].filter(Boolean);
    if (parts.length > 0) {
      textoIndicaciones = parts.join('\n\n');
    }
  }
  if (!textoIndicaciones && curRecipe?.indicationsNotes) {
    textoIndicaciones = curRecipe.indicationsNotes.trim();
  }
  if (!textoIndicaciones && curRecipe2?.rp) {
    textoIndicaciones = curRecipe2.rp.trim();
  }
  if (!textoIndicaciones) {
    textoIndicaciones = 'Cumplir las indicaciones según la posología especificada.';
  }

  const tonePapel = customOpts?.tonePapel || docConfig?.tonePapel || docConfig?.paperTone || '#ffffff';

  return {
    nombreMedico,
    especialidad,
    mpps,
    ci,
    rif,
    cm,
    institucion,
    clinicaDireccion,
    telefonoMedico,
    emailMedico,
    logoIzq,
    logoDer,
    primaryColor,
    fuenteNombre,
    nombreColor,
    marcaAgua,
    selloBase64,
    firmaBase64,
    signatureTitle,
    socialHandle: customOpts?.socialHandle || docConfig?.socialHandle || '',
    socialHandle2: customOpts?.socialHandle2 || docConfig?.socialHandle2 || '',
    footerDisclaimer: customOpts?.footerDisclaimer || docConfig?.footerDisclaimer || '',
    footerNotesText: customOpts?.footerNotesText || docConfig?.footerNotesText || '',
    nombrePaciente,
    cedulaPaciente,
    edadPaciente,
    fecha,
    telefonoPaciente,
    diagnostico,
    textoRp,
    textoIndicaciones,
    tonePapel,
    dietAndRest,
    alarmSigns,
    nextAppointment,
    generalInstructions,
    medicationSchedule,
    documentType: customOpts?.documentType,
    diasReposo: customOpts?.diasReposo,
    fechaInicioReposo: customOpts?.fechaInicioReposo,
    fechaFinReposo: customOpts?.fechaFinReposo,
    observacionesReposo: customOpts?.observacionesReposo,
    motivoConsulta: customOpts?.motivoConsulta,
    resumenClinico: customOpts?.resumenClinico,
    procedimientos: customOpts?.procedimientos,
    estudiosParaclinicos: customOpts?.estudiosParaclinicos,
    impresionDiagnostica: customOpts?.impresionDiagnostica,
    recomendacionesReporte: customOpts?.recomendacionesReporte,
    reportTitle: customOpts?.reportTitle,
    ...customOpts,
  };
}

export function prepareClonedElementForCanvas(sourceEl: HTMLElement): HTMLElement {
  const clone = sourceEl.cloneNode(true) as HTMLElement;

  const noPrintEls = clone.querySelectorAll('.no-print, button, svg.lucide-camera, [title*="editar"], [title*="Haga clic"], [title*="Arrastre"], .no-pdf');
  noPrintEls.forEach((el) => el.remove());

  const emojiFontFallback = ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

  const origInputs = Array.from(sourceEl.querySelectorAll('input'));
  const cloneInputs = Array.from(clone.querySelectorAll('input'));
  origInputs.forEach((origInput, idx) => {
    const cloneInput = cloneInputs[idx];
    if (!cloneInput) return;

    const val = origInput.value !== undefined && origInput.value !== null ? origInput.value : (origInput.getAttribute('value') || '');
    const span = document.createElement('span');
    span.textContent = val;

    const computedColor = window.getComputedStyle(origInput).color;
    const computedFont = window.getComputedStyle(origInput).fontFamily;
    const computedFontSize = window.getComputedStyle(origInput).fontSize;

    span.style.cssText = cloneInput.style.cssText;
    span.style.display = 'inline-block';
    span.style.minWidth = '16px';
    span.style.color = computedColor && computedColor !== 'rgba(0, 0, 0, 0)' ? computedColor : '#0f172a';
    span.style.fontFamily = (computedFont || 'inherit') + emojiFontFallback;
    span.style.fontSize = computedFontSize || 'inherit';
    span.style.fontWeight = 'bold';

    if (cloneInput.className.includes('border-b') || cloneInput.className.includes('border-dashed')) {
      span.style.borderBottom = '1px dashed #cbd5e1';
      span.style.paddingBottom = '1px';
    } else {
      span.style.border = 'none';
    }

    cloneInput.parentNode?.replaceChild(span, cloneInput);
  });

  const origTextareas = Array.from(sourceEl.querySelectorAll('textarea'));
  const cloneTextareas = Array.from(clone.querySelectorAll('textarea'));
  origTextareas.forEach((origTa, idx) => {
    const cloneTa = cloneTextareas[idx];
    if (!cloneTa) return;

    const val = origTa.value !== undefined && origTa.value !== null ? origTa.value : (origTa.textContent || '');
    const div = document.createElement('div');
    div.textContent = val;

    const computedColor = window.getComputedStyle(origTa).color;
    const computedFont = window.getComputedStyle(origTa).fontFamily;
    const computedFontSize = window.getComputedStyle(origTa).fontSize;
    const computedLineHeight = window.getComputedStyle(origTa).lineHeight;

    div.style.cssText = cloneTa.style.cssText;
    div.style.whiteSpace = 'pre-wrap';
    div.style.display = 'block';
    div.style.width = '100%';
    div.style.height = 'auto';
    div.style.border = 'none';
    div.style.background = 'transparent';
    div.style.color = computedColor && computedColor !== 'rgba(0, 0, 0, 0)' ? computedColor : '#0f172a';
    div.style.fontFamily = (computedFont || 'inherit') + emojiFontFallback;
    div.style.fontSize = computedFontSize || 'inherit';
    div.style.lineHeight = computedLineHeight || '1.5';
    div.style.wordBreak = 'break-word';

    cloneTa.parentNode?.replaceChild(div, cloneTa);
  });

  const editables = clone.querySelectorAll('[contenteditable]');
  editables.forEach((el) => {
    el.removeAttribute('contenteditable');
    (el as HTMLElement).style.outline = 'none';
    (el as HTMLElement).style.border = 'none';
  });

  // Convert all SVG images to native inline SVG elements to guarantee crisp vector rendering without canvas taint in Firefox on Android
  const imgs = Array.from(clone.querySelectorAll('img'));
  imgs.forEach((img) => {
    const src = img.getAttribute('src') || img.src || '';
    const svgString = convertSvgDataUrlToSvgString(src);
    if (svgString) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (svgEl) {
          const compStyle = window.getComputedStyle(img);
          const computedW = img.style.width || compStyle.width;
          const computedH = img.style.height || compStyle.height;
          const computedMaxW = img.style.maxWidth || compStyle.maxWidth;
          const computedMaxH = img.style.maxHeight || compStyle.maxHeight;

          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          if (computedW && computedW !== 'auto') svgEl.style.width = computedW;
          if (computedH && computedH !== 'auto') svgEl.style.height = computedH;
          if (computedMaxW && computedMaxW !== 'none') svgEl.style.maxWidth = computedMaxW;
          if (computedMaxH && computedMaxH !== 'none') svgEl.style.maxHeight = computedMaxH;
          svgEl.style.objectFit = 'contain';
          svgEl.style.display = 'block';

          img.parentNode?.replaceChild(svgEl, img);
          return;
        }
      } catch (_) {}
    }

    if (img.src) {
      img.src = safeFormatSrcUrl(img.src);
    }
  });

  // Guarantee the clone is completely untangled from offscreen positioning
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.position = 'relative';
  clone.style.left = '0px';
  clone.style.top = '0px';
  clone.style.width = '100%';
  clone.style.height = '100%';
  clone.style.boxSizing = 'border-box';

  return clone;
}

function triggerPdfDownload(pdf: jsPDF, fileName: string): void {
  try {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 20000);
  } catch (blobErr) {
    console.warn('Blob download strategy failed, trying pdf.save:', blobErr);
    try {
      pdf.save(fileName);
    } catch (saveErr) {
      console.error('All pdf download methods failed:', saveErr);
    }
  }
}

export async function generarPDFDefinitivo(
  customDatos?: Partial<DatosRecipePDF>,
  fileNameInput?: string,
  targetElement?: HTMLElement | null
): Promise<boolean> {
  if (isGeneratingPdfLock) return false;
  isGeneratingPdfLock = true;

  try {
    const datos = extractDatosFromApp(undefined, undefined, undefined, customDatos);
    const paperToneColor = datos.tonePapel || '#ffffff';

    // Prioridad 1: Capturar el elemento real clonándolo en un contenedor oculto detrás de pantalla (z-index -9999 en 0,0)
    let realElement = targetElement;
    if (!realElement) {
      realElement = document.getElementById('hidden-pdf-landscape-mold')
        || document.getElementById('recipe-indications-dual-sheet')
        || document.getElementById('dual-recipe-print-container')
        || document.getElementById('lab-order-print-container')
        || document.getElementById('dual-lab-order-print-sheet')
        || document.getElementById('indications-print-container')
        || document.getElementById('recipe-single-print-container')
        || document.getElementById('report-print-container')
        || document.getElementById('rest-print-container')
        || document.getElementById('history-print-container')
        || document.getElementById('recipe-4en1-print-sheet')
        || (document.querySelector('.dual-recipe-container') as HTMLElement)
        || (document.querySelector('.indications-container') as HTMLElement)
        || (document.querySelector('.print-container') as HTMLElement);
    }

    let canvas: HTMLCanvasElement | null = null;
    const isRestDoc = (customDatos?.documentType === 'rest')
      || (fileNameInput && /reposo|constancia/i.test(fileNameInput))
      || (realElement?.id === 'rest-print-container')
      || (targetElement?.id === 'rest-print-container');

    const isReportDoc = (customDatos?.documentType === 'report')
      || (fileNameInput && /informe/i.test(fileNameInput))
      || (realElement?.id === 'report-print-container')
      || (targetElement?.id === 'report-print-container');

    const isHistoryDoc = (customDatos?.documentType === 'history')
      || (fileNameInput && /historia/i.test(fileNameInput))
      || (realElement?.id === 'clinical-history-print-container')
      || (targetElement?.id === 'clinical-history-print-container');

    const isPortraitDoc = isRestDoc || isReportDoc || isHistoryDoc
      || realElement?.getAttribute('data-doc-orientation') === 'portrait'
      || targetElement?.getAttribute('data-doc-orientation') === 'portrait';

    let isLandscape = !isPortraitDoc;

    if (realElement) {
      if (!isPortraitDoc) {
        isLandscape = realElement.id === 'recipe-indications-dual-sheet' 
          || realElement.id === 'dual-recipe-print-container'
          || realElement.id === 'hidden-pdf-landscape-mold'
          || realElement.id === 'dual-lab-order-print-sheet'
          || realElement.id === 'lab-order-print-container'
          || realElement.classList.contains('recipe-horizontal-2en1')
          || realElement.classList.contains('dual-recipe-container')
          || realElement.classList.contains('dual-lab-sheet')
          || (targetElement?.id === 'hidden-pdf-landscape-mold')
          || (realElement.offsetWidth > 850 && realElement.offsetWidth > realElement.offsetHeight);
      }
      const targetW = isLandscape ? 1056 : 816;
      const targetH = isLandscape ? 816 : 1056;

      const offscreenWrapper = document.createElement('div');
      offscreenWrapper.id = 'pdf-export-offscreen-wrapper';
      offscreenWrapper.style.cssText = `
        position: fixed;
        left: 0px;
        top: 0px;
        width: ${targetW}px;
        min-width: ${targetW}px;
        max-width: ${targetW}px;
        height: ${targetH}px;
        min-height: ${targetH}px;
        max-height: ${targetH}px;
        background-color: ${paperToneColor};
        opacity: 1;
        z-index: -9999;
        pointer-events: none;
        overflow: hidden;
        box-sizing: border-box;
      `;

      // Copy all active web fonts and stylesheets into offscreen wrapper
      const headStyles = document.querySelectorAll('head style, head link[rel="stylesheet"]');
      headStyles.forEach((st) => {
        offscreenWrapper.appendChild(st.cloneNode(true));
      });

      const clonedEl = prepareClonedElementForCanvas(realElement);
      const isFlexContainer = !isPortraitDoc && (
        realElement.style.display === 'flex' || 
        realElement.id === 'recipe-indications-dual-sheet' || 
        realElement.id === 'dual-recipe-print-container' ||
        realElement.id === 'dual-lab-order-print-sheet'
      );
      clonedEl.style.display = isFlexContainer ? 'flex' : 'block';
      if (isFlexContainer) {
        clonedEl.style.flexDirection = 'row';
      }
      clonedEl.style.visibility = 'visible';
      clonedEl.style.width = `${targetW}px`;
      clonedEl.style.minWidth = `${targetW}px`;
      clonedEl.style.maxWidth = `${targetW}px`;
      clonedEl.style.height = `${targetH}px`;
      clonedEl.style.minHeight = `${targetH}px`;
      clonedEl.style.maxHeight = `${targetH}px`;
      clonedEl.style.backgroundColor = paperToneColor;

      // Ensure child sheets are displayed and styled
      const halfSheets = clonedEl.querySelectorAll<HTMLElement>('.recipe-half-sheet, [data-testid="recibo-medico"], .indications-container, .print-container');
      halfSheets.forEach((sheet) => {
        sheet.style.display = 'block';
        sheet.style.visibility = 'visible';
        sheet.style.backgroundColor = paperToneColor;
      });

      offscreenWrapper.appendChild(clonedEl);
      document.body.appendChild(offscreenWrapper);

      // Wait for fonts to finish rendering
      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 200));

      try {
        canvas = await html2canvas(offscreenWrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: targetW,
          height: targetH,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          windowWidth: targetW,
          windowHeight: targetH,
          backgroundColor: paperToneColor,
          onclone: (clonedDoc, clonedWrapper) => {
            clonedWrapper.style.zIndex = '999999';
            if (clonedDoc.body) {
              clonedDoc.body.style.width = `${targetW}px`;
              clonedDoc.body.style.overflow = 'hidden';
            }
            const imgs = Array.from(clonedWrapper.querySelectorAll('img'));
            imgs.forEach((img) => {
              if (img.src) {
                img.src = safeFormatSrcUrl(img.src);
                if (img.src.startsWith('http')) {
                  img.crossOrigin = 'anonymous';
                }
              }
            });
          }
        });
      } catch (canvasErr) {
        console.warn('html2canvas con wrapper falló, reintentando:', canvasErr);
      } finally {
        if (offscreenWrapper.parentNode) {
          document.body.removeChild(offscreenWrapper);
        }
      }
    }

    // Prioridad 2: Fallback con molde oculto detrás de pantalla si no existe elemento en pantalla
    if (!canvas) {
      isLandscape = !isPortraitDoc;
      let elemento = document.getElementById('hidden-pdf-landscape-mold');
      if (!elemento) {
        elemento = document.createElement('div');
        elemento.id = 'hidden-pdf-landscape-mold';
        document.body.appendChild(elemento);
      }

      const captureW = isLandscape ? 1056 : 816;
      const captureH = isLandscape ? 816 : 1056;

      elemento.style.cssText = `
        position: fixed;
        left: 0px;
        top: 0px;
        width: ${captureW}px;
        min-width: ${captureW}px;
        max-width: ${captureW}px;
        height: ${captureH}px;
        min-height: ${captureH}px;
        max-height: ${captureH}px;
        background-color: ${paperToneColor};
        z-index: -9999;
        pointer-events: none;
        overflow: hidden;
        box-sizing: border-box;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #000000;
        display: ${isPortraitDoc ? 'block' : 'flex'};
        flex-direction: ${isPortraitDoc ? 'column' : 'row'};
      `;

      const doctorColor = datos.primaryColor || '#5A82CA';
      const doctorFont = datos.fuenteNombre || "'Dancing Script', 'Playfair Display', Georgia, serif";
      const doctorNameColor = datos.nombreColor || doctorColor || '#2563eb';
      const docName = datos.nombreMedico || 'Dr. Carlos E. Leal S.';
      const docSpec = datos.especialidad || 'Especialista en Anestesiología y Reanimación';
      const docMPPS = datos.mpps || '94.228';
      const docCI = datos.ci || 'V15489288-1';
      const docRIF = datos.rif || (datos.cm ? (datos.cm.toLowerCase().includes('rif') ? datos.cm : `RIF: ${datos.cm}`) : 'RIF: V15489288-1');

      const pName = datos.nombrePaciente || 'Paciente';
      const pCI = datos.cedulaPaciente || 'S/C';
      const pAge = datos.edadPaciente || '—';
      const pDate = datos.fecha || new Date().toLocaleDateString('es-VE');
      const pPhone = datos.telefonoPaciente || '';
      const pDiag = datos.diagnostico || '';

      const rpContent = datos.textoRp || 'Prescripción médica facultativa.';

      // Parse structured indication sections for clean emoji-tagged cards
      let indDietAndRest = datos.dietAndRest || '';
      let indAlarmSigns = datos.alarmSigns || '';
      let indNextAppointment = datos.nextAppointment || '';
      let indPosology = [datos.generalInstructions?.trim(), datos.medicationSchedule?.trim()].filter(Boolean).join('\n\n');

      const rawIndText = datos.textoIndicaciones || '';
      if (!indPosology && rawIndText) {
        let textToParse = rawIndText;
        if (!indDietAndRest && textToParse.includes('RECOMENDACIONES / DIETA Y REPOSO:')) {
          const parts = textToParse.split('RECOMENDACIONES / DIETA Y REPOSO:');
          textToParse = parts[0].trim();
          const rest = parts[1] || '';
          if (!indAlarmSigns && rest.includes('SIGNOS DE ALARMA:')) {
            const subparts = rest.split('SIGNOS DE ALARMA:');
            indDietAndRest = subparts[0].trim();
            const rest2 = subparts[1] || '';
            if (!indNextAppointment && rest2.includes('PRÓXIMA CITA:')) {
              const sub2 = rest2.split('PRÓXIMA CITA:');
              indAlarmSigns = sub2[0].trim();
              indNextAppointment = sub2[1].trim();
            } else {
              indAlarmSigns = rest2.trim();
            }
          } else {
            indDietAndRest = rest.trim();
          }
        }
        indPosology = textToParse || rawIndText;
      }
      if (!indPosology) {
        indPosology = 'Cumplir indicaciones según posología médica.';
      }

      const footerNotesText = [
        datos.telefonoMedico ? `📞 ${datos.telefonoMedico}` : '',
        datos.emailMedico ? `✉️ ${datos.emailMedico}` : '',
        datos.socialHandle ? `📱 ${datos.socialHandle}` : '',
        datos.socialHandle2 ? `🌐 ${datos.socialHandle2}` : '',
        datos.clinicaDireccion ? `📍 ${datos.clinicaDireccion}` : '',
        (datos.footerNotesText && !datos.footerNotesText.includes('undefined') && datos.footerNotesText !== `${datos.telefonoMedico} · ${datos.emailMedico}`) ? datos.footerNotesText : ''
      ].filter(Boolean).join(' · ') || `${datos.telefonoMedico ? `Tel: ${datos.telefonoMedico}` : ''} ${datos.emailMedico ? `| ${datos.emailMedico}` : ''}`.trim() || 'Digital Médic - Documento Médico Oficial';

      // 1. Plantilla 2-en-1 Horizontal Letter para Récipe Estándar
      const renderHalfLayout = (
        logoIzqId: string,
        logoDerId: string,
        selloId: string,
        titleText: string,
        bodyText: string,
        isRightSide: boolean
      ) => `
        <div style="width: 50%; height: 100%; padding: 32px 36px; box-sizing: border-box; ${!isRightSide ? 'border-right: 2px dashed #94a3b8;' : ''} display: flex; flex-direction: column; justify-content: space-between; background-color: ${paperToneColor};">
          <div>
            <!-- Membrete Médico Oficial -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid ${doctorColor}; padding-bottom: 10px; margin-bottom: 12px;">
              <div id="${logoIzqId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 56px; min-height: 56px;"></div>
              <div style="text-align: center; flex: 1; padding: 0 6px;">
                ${datos.institucion ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 2px;">${datos.institucion}</div>` : ''}
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 2px 0;">
                  <span style="font-size: 13px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                  <h2 style="margin: 0; color: ${doctorNameColor}; font-family: ${doctorFont}; font-size: 22px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.25;">${docName}</h2>
                  <span style="font-size: 13px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                </div>
                <h3 style="margin: 2px 0 3px 0; color: ${doctorColor}; font-size: 12.5px; font-weight: 700; line-height: 1.2;">${docSpec}</h3>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: 600; color: #475569; line-height: 1.3;">
                  MPPS: ${docMPPS} · C.I: ${docCI}${docRIF ? ` · ${docRIF.toLowerCase().includes('rif') ? docRIF : `RIF: ${docRIF}`}` : ''}
                </p>
              </div>
              <div id="${logoDerId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 56px; min-height: 56px;"></div>
            </div>

            <!-- Título y Fecha -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1.5px solid ${doctorColor}; padding-bottom: 4px;">
              <span style="font-size: 12.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: ${doctorColor};">
                ${titleText}
              </span>
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">
                Fecha: ${pDate}
              </span>
            </div>

            <!-- Datos del Paciente -->
            <div style="padding: 7px 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 10px; box-sizing: border-box; font-size: 10.5px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4px;">
                <div><span style="font-weight: 600; color: #64748b;">Paciente:</span> <strong style="color: #0f172a;">${pName}</strong></div>
                <div><span style="font-weight: 600; color: #64748b;">C.I:</span> <strong style="color: #0f172a;">${pCI}</strong></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 2px;">
                <div><span style="font-weight: 600; color: #64748b;">Edad:</span> <strong style="color: #0f172a;">${pAge}</strong></div>
                ${pDiag ? `<div><span style="font-weight: 600; color: #64748b;">Diag:</span> <strong style="color: #0f172a;">${pDiag}</strong></div>` : ''}
              </div>
            </div>

            <!-- Cuerpo del Récipe o Indicaciones -->
            ${!isRightSide ? `
              <div style="padding: 10px 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; min-height: 230px; font-size: 12px; line-height: 1.55; color: #0f172a; white-space: pre-wrap; font-weight: 600;">
                ${bodyText}
              </div>
            ` : `
              <div style="min-height: 230px; font-size: 11px; line-height: 1.45;">
                <div style="padding: 8px 10px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; white-space: pre-wrap; margin-bottom: 6px;">
                  ${indPosology}
                </div>
                ${indDietAndRest ? `
                <div style="margin-top: 5px; font-size: 10.5px; color: #1e3a8a; background-color: #eff6ff; padding: 6px 9px; border-radius: 8px; border: 1px solid #bfdbfe;">
                  <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 1px;">🥗 Dieta y Reposo:</div>
                  <div style="font-weight: 600; color: #1e40af;">${indDietAndRest}</div>
                </div>` : ''}
                ${indAlarmSigns ? `
                <div style="margin-top: 5px; font-size: 10.5px; color: #991b1b; background-color: #fef2f2; padding: 6px 9px; border-radius: 8px; border: 1px solid #fecaca;">
                  <div style="font-weight: 800; color: #991b1b; margin-bottom: 1px;">⚠️ Signos de Alarma:</div>
                  <div style="font-weight: 600; color: #7f1d1d;">${indAlarmSigns}</div>
                </div>` : ''}
              </div>
            `}
          </div>

          <!-- Pie de Página -->
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; width: 100%;">
            <div style="flex: 1; font-size: 9px; color: #334155; line-height: 1.35;">
              <div style="font-weight: 600; color: #1e293b;">${footerNotesText}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; flex-shrink: 0; min-width: 170px;">
              <div id="${selloId}" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; min-height: 48px; margin-bottom: 2px;"></div>
              <div style="width: 100%; border-top: 1px solid ${doctorColor}; padding-top: 2px; font-size: 9.5px; font-weight: 800; color: #1e293b;">
                ${datos.signatureTitle || 'Firma y Sello'}
              </div>
            </div>
          </div>
        </div>
      `;

      // 2. Plantilla 2-en-1 Horizontal Letter para Órdenes de Exámenes
      const renderLabHalfLayout = (
        logoIzqId: string,
        logoDerId: string,
        selloId: string,
        titleText: string,
        examsText: string,
        prepText: string,
        isRightSide: boolean
      ) => `
        <div style="width: 50%; height: 100%; padding: 28px 32px; box-sizing: border-box; ${!isRightSide ? 'border-right: 2px dashed #94a3b8;' : ''} display: flex; flex-direction: column; justify-content: space-between; background-color: ${paperToneColor}; overflow: hidden;">
          <div>
            <!-- Membrete Médico Oficial -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid ${doctorColor}; padding-bottom: 8px; margin-bottom: 10px;">
              <div id="${logoIzqId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 54px; min-height: 54px;"></div>
              <div style="text-align: center; flex: 1; padding: 0 6px;">
                ${datos.institucion ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 2px;">${datos.institucion}</div>` : ''}
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 2px 0;">
                  <span style="font-size: 12px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                  <h2 style="margin: 0; color: ${doctorNameColor}; font-family: ${doctorFont}; font-size: 20px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.25;">${docName}</h2>
                  <span style="font-size: 12px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                </div>
                <h3 style="margin: 2px 0 3px 0; color: ${doctorColor}; font-size: 12px; font-weight: 700; line-height: 1.2;">${docSpec}</h3>
                <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: 600; color: #475569; line-height: 1.3;">
                  MPPS: ${docMPPS} · C.I: ${docCI}${docRIF ? ` · ${docRIF.toLowerCase().includes('rif') ? docRIF : `RIF: ${docRIF}`}` : ''}
                </p>
              </div>
              <div id="${logoDerId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 54px; min-height: 54px;"></div>
            </div>

            <!-- Título de la Orden de Laboratorio -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1.5px solid ${doctorColor}; padding-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: ${doctorColor};">
                🔬 ${titleText}
              </span>
              <span style="font-size: 9.5px; font-weight: 800; color: ${isRightSide ? '#166534' : '#1e40af'}; background-color: ${isRightSide ? '#dcfce7' : '#dbeafe'}; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase;">
                ${isRightSide ? 'Copia Paciente / Archivo' : 'Original / Laboratorio'}
              </span>
            </div>

            <!-- Datos del Paciente -->
            <div style="padding: 7px 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 10px; box-sizing: border-box; font-size: 10.5px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4px;">
                <div><span style="font-weight: 600; color: #64748b;">Paciente:</span> <strong style="color: #0f172a;">${pName}</strong></div>
                <div><span style="font-weight: 600; color: #64748b;">C.I:</span> <strong style="color: #0f172a;">${pCI}</strong></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 2px;">
                <div><span style="font-weight: 600; color: #64748b;">Edad:</span> <strong style="color: #0f172a;">${pAge}</strong></div>
                <div><span style="font-weight: 600; color: #64748b;">Fecha:</span> <strong style="color: #0f172a;">${pDate}</strong></div>
              </div>
            </div>

            <!-- Caja de Estudios Solicitados -->
            <div style="padding: 10px 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 11.5px; font-weight: 600; color: #0f172a; box-sizing: border-box; min-height: 200px;">
              <div style="font-size: 10.5px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                <span>🧪</span>
                <span>Estudios Paraclínicos y Exámenes Solicitados:</span>
              </div>
              <div style="white-space: pre-wrap; line-height: 1.55; color: #0f172a; font-weight: 700;">
                ${examsText || '1. Exámenes y estudios paraclínicos solicitados en consulta médica.'}
              </div>
            </div>

            <!-- Instrucciones -->
            ${prepText ? `
            <div style="margin-top: 8px; font-size: 10.5px; color: #78350f; background-color: #fffbeb; padding: 6px 10px; border-radius: 8px; border: 1px solid #fef3c7; box-sizing: border-box;">
              <div style="font-weight: 800; color: #92400e; margin-bottom: 2px; font-size: 10px; text-transform: uppercase;">⚠️ Instrucciones y Preparación:</div>
              <div style="font-weight: 600; color: #92400e; line-height: 1.35; white-space: pre-line;">${prepText}</div>
            </div>` : ''}
          </div>

          <!-- Pie de Página -->
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; width: 100%;">
            <div style="flex: 1; font-size: 9px; color: #334155; line-height: 1.35;">
              <div style="font-weight: 600; color: #1e293b;">${footerNotesText}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; flex-shrink: 0; min-width: 170px;">
              <div id="${selloId}" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; min-height: 48px; margin-bottom: 2px;"></div>
              <div style="width: 100%; border-top: 1px solid ${doctorColor}; padding-top: 2px; font-size: 9.5px; font-weight: 800; color: #1e293b;">
                ${datos.signatureTitle || 'Firma y Sello'}
              </div>
            </div>
          </div>
        </div>
      `;

      // 3. Plantilla Hoja Carta Entera Vertical para Constancia de Reposo (816x1056 px)
      const renderRestPortraitLayout = () => {
        const daysCount = datos.diasReposo || 1;
        const startDateStr = datos.fechaInicioReposo || datos.fecha || pDate;
        const endDateStr = datos.fechaFinReposo || 'cumplimiento del período';
        const observationsText = datos.observacionesReposo || datos.textoIndicaciones || '';

        return `
          <div style="width: 816px; height: 1056px; max-height: 1056px; padding: 42px 48px; box-sizing: border-box; background-color: ${paperToneColor}; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; color: #0f172a;">
            <div>
              <!-- Membrete Superior Oficial -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 2.5px solid ${doctorColor}; padding-bottom: 12px; margin-bottom: 16px;">
                <div id="pdf-portrait-logo-izq" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 68px; min-height: 68px;"></div>
                <div style="text-align: center; flex: 1; padding: 0 10px;">
                  ${datos.institucion ? `<div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 3px;">${datos.institucion}</div>` : ''}
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 2px 0;">
                    <span style="font-size: 14px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                    <h1 style="margin: 0; color: ${doctorNameColor}; font-family: ${doctorFont}; font-size: 26px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.2;">${docName}</h1>
                    <span style="font-size: 14px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                  </div>
                  <h2 style="margin: 2px 0 4px 0; color: ${doctorColor}; font-size: 14px; font-weight: 700; line-height: 1.2;">${docSpec}</h2>
                  <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #475569; line-height: 1.35;">
                    MPPS: ${docMPPS} · C.I: ${docCI}${docRIF ? ` · ${docRIF.toLowerCase().includes('rif') ? docRIF : `RIF: ${docRIF}`}` : ''}
                  </p>
                </div>
                <div id="pdf-portrait-logo-der" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 68px; min-height: 68px;"></div>
              </div>

              <!-- Título Oficial del Documento -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px;">
                <span style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: ${doctorColor};">
                  ⏱️ CONSTANCIA DE REPOSO MÉDICO
                </span>
                <span style="font-size: 11.5px; font-weight: 700; color: #475569; background-color: #f1f5f9; padding: 4px 10px; border-radius: 6px;">
                  📅 Fecha: ${pDate}
                </span>
              </div>

              <!-- Caja de Datos del Paciente -->
              <div style="padding: 12px 18px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #cbd5e1; margin-bottom: 20px; box-sizing: border-box;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 12px;">
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Paciente: </span>
                    <strong style="color: #0f172a;">${pName}</strong>
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Cédula: </span>
                    <strong style="color: #0f172a;">${pCI}</strong>
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Edad: </span>
                    <strong style="color: #0f172a;">${pAge}</strong>
                  </div>
                  ${pPhone ? `
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Teléfono: </span>
                    <strong style="color: #0f172a;">${pPhone}</strong>
                  </div>` : ''}
                  ${pDiag ? `
                  <div style="grid-column: span 2;">
                    <span style="font-weight: 600; color: #64748b;">Diagnóstico: </span>
                    <strong style="color: #0f172a;">${pDiag}</strong>
                  </div>` : ''}
                </div>
              </div>

              <!-- Párrafo de Certificación Médica Oficial -->
              <div style="font-size: 14px; line-height: 1.75; color: #1e293b; text-align: justify; margin-bottom: 22px; padding: 0 4px;">
                Por medio de la presente se certifica que el (la) paciente <strong style="color: #0f172a;">${pName}</strong>, titular de la Cédula de Identidad <strong style="color: #0f172a;">${pCI}</strong>, ha sido evaluado(a) clínicamente en esta fecha, determinándose la necesidad facultativa de cumplir <strong style="color: ${doctorColor}; font-weight: 800;">REPOSO MÉDICO</strong> para su recuperación y restablecimiento de la salud.
              </div>

              <!-- Tarjeta Destacada de Detalles del Reposo -->
              <div style="border: 2px solid ${doctorColor}; background-color: #ffffff; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px;">
                  <span style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">
                    Período Prescrito:
                  </span>
                  <span style="font-size: 14px; font-weight: 900; color: #ffffff; background-color: ${doctorColor}; padding: 5px 16px; border-radius: 9999px;">
                    ${daysCount} DÍAS CONTINUOS
                  </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; margin-bottom: 14px;">
                  <div style="background-color: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-weight: 600; color: #64748b; font-size: 11px; display: block; text-transform: uppercase; margin-bottom: 2px;">A partir del:</span>
                    <strong style="color: #0f172a; font-size: 13.5px;">${startDateStr}</strong>
                  </div>
                  <div style="background-color: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-weight: 600; color: #64748b; font-size: 11px; display: block; text-transform: uppercase; margin-bottom: 2px;">Hasta el:</span>
                    <strong style="color: #0f172a; font-size: 13.5px;">${endDateStr}</strong>
                  </div>
                </div>
                <div style="font-size: 12.5px; line-height: 1.55; color: #334155;">
                  <strong style="color: #0f172a;">Diagnóstico Clínico: </strong> ${pDiag || 'Evaluación Médica'}<br/>
                  ${observationsText ? `<div style="margin-top: 8px;"><strong style="color: #0f172a;">Observaciones e Indicaciones: </strong> ${observationsText}</div>` : ''}
                </div>
              </div>

              <!-- Nota Administrativa / Legal -->
              <div style="font-size: 11px; color: #64748b; font-style: italic; line-height: 1.5; text-align: justify; margin-top: 10px;">
                Constancia que se expide a solicitud de la parte interesada para los fines legales, laborales o académicos a que haya lugar en ${datos.clinicaDireccion || 'la localidad'}.
              </div>
            </div>

            <!-- Pie de Página: Datos de Contacto + Firma y Sello -->
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 14px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; width: 100%;">
              <div style="flex: 1; max-width: 58%; font-size: 10px; color: #334155; line-height: 1.45;">
                <div style="font-weight: 700; color: #1e293b;">${footerNotesText}</div>
                ${datos.footerDisclaimer ? `<div style="font-size: 9px; color: #64748b; font-style: italic; margin-top: 3px;">${datos.footerDisclaimer}</div>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; flex-shrink: 0; min-width: 190px; max-width: 250px;">
                <div id="pdf-portrait-sello" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 8px; min-height: 60px; margin-bottom: 4px;"></div>
                <div style="width: 100%; border-top: 1.5px solid ${doctorColor}; padding-top: 4px; font-size: 10.5px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
                  ${datos.signatureTitle || 'Firma y Sello del Médico Tratante'}
                </div>
              </div>
            </div>
          </div>
        `;
      };

      // 4. Plantilla Hoja Carta Entera Vertical para Informe Médico (816x1056 px)
      const renderReportPortraitLayout = () => {
        const reportTitle = datos.reportTitle || 'INFORME MÉDICO';
        const motivoText = datos.motivoConsulta || '';
        const resumenText = datos.resumenClinico || (rpContent && !rpContent.includes('Prescripción') ? rpContent : 'Paciente evaluado clínicamente.');
        const procedimientosText = datos.procedimientos || '';
        const paraclinicosText = datos.estudiosParaclinicos || '';
        const diagText = datos.impresionDiagnostica || pDiag || 'Evaluación médica facultativa.';
        const recomendacionesText = datos.recomendacionesReporte || datos.textoIndicaciones || 'Cumplir indicaciones médicas.';

        return `
          <div style="width: 816px; height: 1056px; max-height: 1056px; padding: 40px 48px; box-sizing: border-box; background-color: ${paperToneColor}; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; color: #0f172a;">
            <div>
              <!-- Membrete Superior Oficial -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 2.5px solid ${doctorColor}; padding-bottom: 12px; margin-bottom: 14px;">
                <div id="pdf-portrait-logo-izq" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 68px; min-height: 68px;"></div>
                <div style="text-align: center; flex: 1; padding: 0 10px;">
                  ${datos.institucion ? `<div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 3px;">${datos.institucion}</div>` : ''}
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 2px 0;">
                    <span style="font-size: 14px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                    <h1 style="margin: 0; color: ${doctorNameColor}; font-family: ${doctorFont}; font-size: 26px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.2;">${docName}</h1>
                    <span style="font-size: 14px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                  </div>
                  <h2 style="margin: 2px 0 4px 0; color: ${doctorColor}; font-size: 14px; font-weight: 700; line-height: 1.2;">${docSpec}</h2>
                  <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #475569; line-height: 1.35;">
                    MPPS: ${docMPPS} · C.I: ${docCI}${docRIF ? ` · ${docRIF.toLowerCase().includes('rif') ? docRIF : `RIF: ${docRIF}`}` : ''}
                  </p>
                </div>
                <div id="pdf-portrait-logo-der" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 68px; min-height: 68px;"></div>
              </div>

              <!-- Título Oficial del Documento -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px;">
                <span style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: ${doctorColor};">
                  📋 ${reportTitle}
                </span>
                <span style="font-size: 11.5px; font-weight: 700; color: #475569; background-color: #f1f5f9; padding: 4px 10px; border-radius: 6px;">
                  📅 Fecha: ${pDate}
                </span>
              </div>

              <!-- Caja de Datos del Paciente -->
              <div style="padding: 10px 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 16px; box-sizing: border-box;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11.5px;">
                  <div style="grid-column: span 2;">
                    <span style="font-weight: 600; color: #64748b;">Paciente: </span>
                    <strong style="color: #0f172a;">${pName}</strong>
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Cédula: </span>
                    <strong style="color: #0f172a;">${pCI}</strong>
                  </div>
                  <div>
                    <span style="font-weight: 600; color: #64748b;">Edad: </span>
                    <strong style="color: #0f172a;">${pAge}</strong>
                  </div>
                </div>
              </div>

              <!-- Secciones Clínicas Enumeradas -->
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 11.5px;">
                ${motivoText ? `
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; margin-bottom: 3px;">1. Motivo de Consulta:</div>
                  <div style="color: #1e293b; line-height: 1.45; white-space: pre-wrap;">${motivoText}</div>
                </div>` : ''}

                ${resumenText ? `
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; margin-bottom: 3px;">2. Resumen Clínico / Antecedentes:</div>
                  <div style="color: #1e293b; line-height: 1.45; white-space: pre-wrap;">${resumenText}</div>
                </div>` : ''}

                ${procedimientosText ? `
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; margin-bottom: 3px;">3. Procedimientos y Examen Físico:</div>
                  <div style="color: #1e293b; line-height: 1.45; white-space: pre-wrap;">${procedimientosText}</div>
                </div>` : ''}

                ${paraclinicosText ? `
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; margin-bottom: 3px;">4. Estudios Paraclínicos:</div>
                  <div style="color: #1e293b; line-height: 1.45; white-space: pre-wrap;">${paraclinicosText}</div>
                </div>` : ''}

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 3px;">5. Impresión Diagnóstica:</div>
                  <div style="color: #14532d; font-weight: 700; line-height: 1.45; white-space: pre-wrap;">${diagText}</div>
                </div>

                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
                  <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; margin-bottom: 3px;">6. Conducta y Recomendaciones Terapéuticas:</div>
                  <div style="color: #1e293b; line-height: 1.45; white-space: pre-wrap;">${recomendacionesText}</div>
                </div>

                ${datos.diasReposo ? `
                <div style="padding: 7px 12px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-weight: 700; color: #92400e; font-size: 11px;">
                  ⚠️ Reposo Médico Prescrito: ${datos.diasReposo} días continuos (Desde: ${datos.fechaInicioReposo || pDate} Hasta: ${datos.fechaFinReposo || 'término'})
                </div>` : ''}
              </div>
            </div>

            <!-- Pie de Página: Datos de Contacto + Firma y Sello -->
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 14px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; width: 100%;">
              <div style="flex: 1; max-width: 58%; font-size: 10px; color: #334155; line-height: 1.45;">
                <div style="font-weight: 700; color: #1e293b;">${footerNotesText}</div>
                ${datos.footerDisclaimer ? `<div style="font-size: 9px; color: #64748b; font-style: italic; margin-top: 3px;">${datos.footerDisclaimer}</div>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; flex-shrink: 0; min-width: 190px; max-width: 250px;">
                <div id="pdf-portrait-sello" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 8px; min-height: 60px; margin-bottom: 4px;"></div>
                <div style="width: 100%; border-top: 1.5px solid ${doctorColor}; padding-top: 4px; font-size: 10.5px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
                  ${datos.signatureTitle || 'Firma y Sello del Médico Especialista'}
                </div>
              </div>
            </div>
          </div>
        `;
      };

      const isLabDocument = (fileNameInput && /examenes|laboratorio|orden_examenes/i.test(fileNameInput)) ||
        (customDatos?.documentType === 'examenes') ||
        (targetElement && targetElement.id && /lab/i.test(targetElement.id));

      if (isRestDoc) {
        elemento.innerHTML = renderRestPortraitLayout();
        mountNativeLogoNode(elemento.querySelector('#pdf-portrait-logo-izq'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-portrait-logo-der'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-portrait-sello'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      } else if (isReportDoc || isHistoryDoc) {
        elemento.innerHTML = renderReportPortraitLayout();
        mountNativeLogoNode(elemento.querySelector('#pdf-portrait-logo-izq'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-portrait-logo-der'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-portrait-sello'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      } else if (isLabDocument) {
        const cleanExams = (rpContent && !rpContent.includes('Prescripción médica')) ? rpContent : '1. Exámenes paraclínicos solicitados.';
        const cleanPrep = (rawIndText && !rawIndText.includes('Cumplir indicaciones')) ? rawIndText : '';
        elemento.innerHTML = `
          ${renderLabHalfLayout('pdf-logo-izq-1', 'pdf-logo-der-1', 'pdf-sello-1', 'ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS', cleanExams, cleanPrep, false)}
          ${renderLabHalfLayout('pdf-logo-izq-2', 'pdf-logo-der-2', 'pdf-sello-2', 'ORDEN DE EXÁMENES Y ESTUDIOS PARACLÍNICOS', cleanExams, cleanPrep, true)}
        `;
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-1'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-1'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-2'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-2'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-1'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-2'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      } else {
        elemento.innerHTML = `
          ${renderHalfLayout('pdf-logo-izq-1', 'pdf-logo-der-1', 'pdf-sello-1', datos.tituloRecipe1 || 'Rp.', rpContent, false)}
          ${renderHalfLayout('pdf-logo-izq-2', 'pdf-logo-der-2', 'pdf-sello-2', datos.tituloRecipe2 || 'INDICACIONES Y POSOLOGÍA MÉDICA', rawIndText, true)}
        `;
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-1'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-1'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-2'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
        mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-2'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-1'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
        mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-2'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      }

      // Wait for fonts and inline SVG layout to finish rendering
      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));

      canvas = await html2canvas(elemento, { 
        scale: 2, 
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: captureW,
        height: captureH,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: captureW,
        windowHeight: captureH,
        backgroundColor: paperToneColor,
      });
    }
    if (!canvas) return false;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    if (isLandscape) {
      pdf.addImage(imgData, 'PNG', 0, 0, 279.4, 215.9);
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, 215.9, 279.4);
    }

    let nombrePaciente = datos.nombrePaciente || 'Carlos Leal';
    let nombreLimpio = nombrePaciente.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
    if (!nombreLimpio) nombreLimpio = 'Carlos Leal';

    let fechaHoy = new Date();
    let dia = String(fechaHoy.getDate()).padStart(2, '0');
    let mes = String(fechaHoy.getMonth() + 1).padStart(2, '0');
    let anio = String(fechaHoy.getFullYear()).slice(-2);
    let nombreArchivo = fileNameInput || `${nombreLimpio} ${dia} ${mes} ${anio}.pdf`;

    triggerPdfDownload(pdf, nombreArchivo);
    return true;
  } catch (error) {
    console.error('Error generando PDF definitivo:', error);
    return false;
  } finally {
    isGeneratingPdfLock = false;
  }
}

export async function exportElementAsPDF(
  element?: HTMLElement | null,
  rawFilename?: string,
  customDatos?: DatosRecipePDF
): Promise<boolean> {
  return generarPDFDefinitivo(customDatos, rawFilename, element);
}

export async function exportMultipleElementsAsPDF(
  elements: (HTMLElement | null)[],
  rawFilename?: string
): Promise<boolean> {
  return generarPDFDefinitivo(undefined, rawFilename, elements[0]);
}

export async function generatePDFBlob(
  targetElement?: HTMLElement | null,
  customDatos?: DatosRecipePDF
): Promise<Blob | null> {
  try {
    const datos = extractDatosFromApp(undefined, undefined, undefined, customDatos);
    let elemento = document.getElementById('lienzo-pdf-oculto');
    if (!elemento) {
      elemento = document.createElement('div');
      elemento.id = 'lienzo-pdf-oculto';
      document.body.appendChild(elemento);
    }

    elemento.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 1056px;
      height: 816px;
      background-color: #ffffff;
      display: flex;
      flex-direction: row;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #000000;
      z-index: -1000;
      box-sizing: border-box;
      overflow: hidden;
    `;

    const doctorColor = datos.primaryColor || '#5A82CA';
    const doctorFont = datos.fuenteNombre || "'Dancing Script', 'Playfair Display', Georgia, serif";
    const doctorNameColor = datos.nombreColor || doctorColor || '#2563eb';
    const docName = datos.nombreMedico || 'Dr. Carlos E. Leal S.';
    const docSpec = datos.especialidad || 'Especialista en Anestesiología y Reanimación';
    const docMPPS = datos.mpps || '94.228';
    const docCI = datos.ci || 'V15489288-1';
    const docRIF = datos.rif || (datos.cm ? (datos.cm.toLowerCase().includes('rif') ? datos.cm : `RIF: ${datos.cm}`) : 'RIF: V15489288-1');

    const pName = datos.nombrePaciente || 'Carlos Leal';
    const pCI = datos.cedulaPaciente || 'S/C';
    const pAge = datos.edadPaciente || '—';
    const pDate = datos.fecha || new Date().toLocaleDateString('es-VE');
    const pPhone = datos.telefonoPaciente || '';
    const pDiag = datos.diagnostico || '';

    const rpContent = datos.textoRp || 'Prescripción médica facultativa.';
    
    let indDietAndRest = datos.dietAndRest || '';
    let indAlarmSigns = datos.alarmSigns || '';
    let indNextAppointment = datos.nextAppointment || '';
    let indPosology = [datos.generalInstructions?.trim(), datos.medicationSchedule?.trim()].filter(Boolean).join('\n\n');

    const rawIndText = datos.textoIndicaciones || '';
    if (!indPosology && rawIndText) {
      let textToParse = rawIndText;
      if (!indDietAndRest && textToParse.includes('RECOMENDACIONES / DIETA Y REPOSO:')) {
        const parts = textToParse.split('RECOMENDACIONES / DIETA Y REPOSO:');
        textToParse = parts[0].trim();
        const rest = parts[1] || '';
        if (!indAlarmSigns && rest.includes('SIGNOS DE ALARMA:')) {
          const subparts = rest.split('SIGNOS DE ALARMA:');
          indDietAndRest = subparts[0].trim();
          const rest2 = subparts[1] || '';
          if (!indNextAppointment && rest2.includes('PRÓXIMA CITA:')) {
            const sub2 = rest2.split('PRÓXIMA CITA:');
            indAlarmSigns = sub2[0].trim();
            indNextAppointment = sub2[1].trim();
          } else {
            indAlarmSigns = rest2.trim();
          }
        } else {
          indDietAndRest = rest.trim();
        }
      }
      indPosology = textToParse || rawIndText;
    }
    if (!indPosology) {
      indPosology = 'Cumplir indicaciones según posología médica.';
    }

    const footerNotesText = `${datos.telefonoMedico ? `Tel: ${datos.telefonoMedico}` : ''}${datos.emailMedico ? ` · ${datos.emailMedico}` : ''}${datos.clinicaDireccion ? ` · ${datos.clinicaDireccion}` : ''}`.trim() || 'Digital Médic - Documento Médico Oficial';

    const renderHalfLayout = (
      logoIzqId: string,
      logoDerId: string,
      selloId: string,
      titleText: string,
      bodyText: string,
      isRightSide: boolean
    ) => `
      <div style="width: 50%; height: 100%; padding: 32px 36px; box-sizing: border-box; ${!isRightSide ? 'border-right: 2px dashed #94a3b8;' : ''} display: flex; flex-direction: column; justify-content: space-between; background-color: #ffffff;">
        <div>
          <!-- Membrete -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid ${doctorColor}; padding-bottom: 10px; margin-bottom: 12px;">
            <div id="${logoIzqId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 56px; min-height: 56px;"></div>
            <div style="text-align: center; flex: 1; padding: 0 6px;">
              ${datos.institucion ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 2px;">${datos.institucion}</div>` : ''}
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 2px 0;">
                <span style="font-size: 12px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
                <h2 style="margin: 0; color: ${doctorNameColor}; font-family: ${doctorFont}; font-size: 22px; font-weight: 700; letter-spacing: 0.01em; line-height: 1.25;">${docName}</h2>
                <span style="font-size: 12px; opacity: 0.9; color: ${doctorNameColor};">∿</span>
              </div>
              <h3 style="margin: 2px 0 3px 0; color: ${doctorColor}; font-size: 12.5px; font-weight: 700; line-height: 1.2;">${docSpec}</h3>
              <p style="margin: 2px 0 0 0; font-size: 10px; font-weight: 600; color: #475569; line-height: 1.3;">
                MPPS: ${docMPPS} · C.I: ${docCI}${docRIF ? ` · ${docRIF.toLowerCase().includes('rif') ? docRIF : `RIF: ${docRIF}`}` : ''}
              </p>
              ${(datos.telefonoMedico || datos.emailMedico || datos.socialHandle) ? `
              <p style="margin: 2px 0 0 0; font-size: 9px; font-weight: 500; color: #64748b; line-height: 1.3;">
                ${[
                  datos.telefonoMedico ? `Tel: ${datos.telefonoMedico}` : '',
                  datos.emailMedico ? datos.emailMedico : '',
                  datos.socialHandle ? datos.socialHandle : ''
                ].filter(Boolean).join(' · ')}
              </p>` : ''}
            </div>
            <div id="${logoDerId}" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 56px; min-height: 56px;"></div>
          </div>

          <!-- Barra del Paciente -->
          <div style="background-color: ${isRightSide ? '#eef2ff' : 'rgba(248, 250, 252, 0.9)'}; border: 1px solid ${isRightSide ? '#c7d2fe' : '#e2e8f0'}; border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px;">
              <div style="flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0;">
                <span style="font-weight: 800; color: #1e293b; shrink: 0;">Paciente:</span>
                <span style="font-weight: 800; color: #0f172a; flex: 1; border-bottom: 1px dashed #cbd5e1; padding-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pName}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; shrink: 0;">
                <span style="font-weight: 800; color: #1e293b;">Edad:</span>
                <span style="font-weight: 700; color: #0f172a;">${pAge}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; shrink: 0;">
                <span style="font-weight: 800; color: #1e293b;">C.I.:</span>
                <span style="font-weight: 700; color: #0f172a;">${pCI}</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 8px; padding-top: 4px; border-top: 1px solid ${isRightSide ? '#c7d2fe' : '#e2e8f0'};">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="font-weight: 800; color: #1e293b;">Fecha:</span>
                <span style="font-weight: 800; color: #0f172a;">${pDate}</span>
              </div>
              ${pDiag ? `
              <div style="flex: 1; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-width: 0;">
                <span style="font-weight: 800; color: #1e293b; shrink: 0;">Diagnóstico:</span>
                <span style="font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pDiag}</span>
              </div>` : ''}
            </div>
          </div>

          <!-- Cuerpo -->
          ${!isRightSide ? `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 20px; font-weight: 900; font-style: italic; font-family: 'Playfair Display', Georgia, serif; color: ${doctorColor};">
                  ${titleText}
                </span>
                <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                  Prescripción Facultativa
                </span>
              </div>
              <div style="font-size: 12.5px; font-weight: 600; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; white-space: pre-wrap; line-height: 1.55; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff; min-height: 195px; box-sizing: border-box;">
                ${bodyText}
              </div>
            </div>
          ` : `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
                <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px; color: ${doctorColor};">
                  ${titleText}
                </span>
                <span style="font-size: 10px; font-weight: 700; color: #475569;">
                  Fecha: ${pDate}
                </span>
              </div>

              <!-- 1. Tarjeta de Posología con 💊 -->
              <div style="padding: 10px 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #0f172a; box-sizing: border-box; min-height: 140px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px; font-size: 11px; font-weight: 800; color: ${doctorColor}; text-transform: uppercase;">
                  <span style="font-size: 12px;">💊</span>
                  <span>Posología e Instrucciones de Medicación:</span>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.5; color: #1e293b;">
                  ${indPosology}
                </div>
              </div>

              <!-- 2. Dieta y Reposo con 🥗 -->
              ${indDietAndRest ? `
              <div style="margin-top: 8px; font-size: 11px; color: #1e293b; background-color: #f8fafc; padding: 7px 10px; border-radius: 8px; border: 1px solid #e2e8f0; box-sizing: border-box;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">🥗 Recomendaciones de Dieta y Reposo:</div>
                <div style="font-weight: 600; color: #334155; line-height: 1.35;">${indDietAndRest}</div>
              </div>` : ''}

              <!-- 3. Signos de Alarma con ⚠️ -->
              ${indAlarmSigns ? `
              <div style="margin-top: 6px; font-size: 11px; color: #991b1b; background-color: #fef2f2; padding: 7px 10px; border-radius: 8px; border: 1px solid #fecaca; box-sizing: border-box;">
                <div style="font-weight: 800; color: #991b1b; margin-bottom: 2px;">⚠️ Signos de Alarma:</div>
                <div style="font-weight: 600; color: #7f1d1d; line-height: 1.35;">${indAlarmSigns}</div>
              </div>` : ''}

              <!-- 4. Próximo Control con 📅 -->
              ${indNextAppointment ? `
              <div style="margin-top: 6px; font-size: 11px; color: #0369a1; background-color: #f0f9ff; padding: 6px 10px; border-radius: 8px; border: 1px solid #bae6fd; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 800; color: #0369a1;">📅 Próximo Control:</span>
                <span style="font-weight: 700; color: #075985;">${indNextAppointment}</span>
              </div>` : ''}
            </div>
          `}
        </div>

        <!-- Pie de página -->
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; width: 100%;">
          <div style="flex: 1; max-width: 58%; font-size: 9.5px; color: #334155; font-family: system-ui, sans-serif; line-height: 1.35;">
            <div style="font-weight: 600; color: #1e293b;">
              ${footerNotesText}
            </div>
            ${datos.footerDisclaimer ? `
            <div style="font-size: 8.5px; color: #64748b; font-style: italic; margin-top: 2px;">
              ${datos.footerDisclaimer}
            </div>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; shrink: 0; min-width: 170px; max-width: 230px;">
            <div id="${selloId}" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 8px; min-height: 52px; margin-bottom: 3px;"></div>
            <div style="width: 100%; border-top: 1px solid ${doctorColor}; padding-top: 3px; font-size: 9.5px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
              ${datos.signatureTitle || 'Firma del médico (a)'}
            </div>
          </div>
        </div>
      </div>
    `;

    elemento.innerHTML = `
      ${renderHalfLayout('blob-logo-izq-1', 'blob-logo-der-1', 'blob-sello-1', datos.tituloRecipe1 || 'Rp.', rpContent, false)}
      ${renderHalfLayout('blob-logo-izq-2', 'blob-logo-der-2', 'blob-sello-2', datos.tituloRecipe2 || 'INDICACIONES Y POSOLOGÍA MÉDICA', rawIndText, true)}
    `;

    mountNativeLogoNode(elemento.querySelector('#blob-logo-izq-1'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
    mountNativeLogoNode(elemento.querySelector('#blob-logo-der-1'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);
    mountNativeLogoNode(elemento.querySelector('#blob-logo-izq-2'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Digital Médic', 68, 135);
    mountNativeLogoNode(elemento.querySelector('#blob-logo-der-2'), datos.logoDer, ANESTHESIOLOGY_LARYNGOSCOPE_SVG, 'Logo Médico', 68, 135);

    mountNativeStampAndSignatureNode(elemento.querySelector('#blob-sello-1'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
    mountNativeStampAndSignatureNode(elemento.querySelector('#blob-sello-2'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(elemento, { 
      scale: 2, 
      useCORS: true,
      windowWidth: 1056,
      logging: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape', 
      unit: 'mm',
      format: 'letter' 
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 279.4, 215.9);
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generando blob PDF:', error);
    return null;
  }
}

export function buildDocumentPdfFilename(
  docType: string = 'Recipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  let nombrePaciente = patientName || 'Carlos Leal';
  let nombreLimpio = nombrePaciente.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  if (!nombreLimpio) nombreLimpio = 'Carlos Leal';

  let fechaHoy = new Date();
  let dia = String(fechaHoy.getDate()).padStart(2, '0');
  let mes = String(fechaHoy.getMonth() + 1).padStart(2, '0');
  let anio = String(fechaHoy.getFullYear()).slice(-2);

  return `${nombreLimpio} ${dia} ${mes} ${anio}.pdf`;
}

export function sanitizeToAsciiFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '').trim();
}

export function showWhatsAppClipAlert(customMessage?: string): void {
  try {
    if (typeof window !== 'undefined') {
      const msg = customMessage || '📎 ¡PDF Descargado! Recuerda tocar el clip (📎) en WhatsApp para adjuntarlo al paciente.';
      window.dispatchEvent(new CustomEvent('app-toast', { detail: msg }));
    }
  } catch (_) {}
}

export const DIGITAL_MEDIC_WHATSAPP_STICKER_FOOTER = 
  `═════════════════════════════\n` +
  `❖ *DIGITAL MÉDIC* ⚕️\n` +
  `_Formatos Médicos Digitales_\n` +
  `🛡️ *Documento Médico Verificado*\n` +
  `═════════════════════════════`;

export function buildWhatsAppPharmacologicalMessage(opts: {
  documentType?: string;
  patientName?: string;
  patientCI?: string;
  dateStr?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  mpps?: string;
  ci?: string;
  rpText?: string;
  indicationsText?: string;
}): string {
  const cleanDoctorName = (opts.doctorName || 'Dr. Carlos E. Leal S.').replace(/^(dr\(a\)\.?|dr\s*\(a\)|dr\.|dra\.|dr|dra)\s*/gi, '').trim();
  return `📋 *INDICACIONES Y TRATAMIENTO MÉDICO* 📋\n\n` +
    `👤 *Paciente:* ${opts.patientName || 'Paciente'}\n` +
    `🆔 *C.I.:* ${opts.patientCI || 'S/C'}\n` +
    `📅 *Fecha:* ${opts.dateStr || new Date().toLocaleDateString('es-VE')}\n` +
    `🩺 *Médico Tratante:* Dr(a). ${cleanDoctorName}\n\n` +
    `💊 *PRESCRIPCIÓN Y POSOLOGÍA:*\n${opts.rpText || opts.indicationsText || 'Ver récipe adjunto.'}\n\n` +
    DIGITAL_MEDIC_WHATSAPP_STICKER_FOOTER;
}

export function buildWhatsAppTreatmentMessage(opts: {
  doctorName?: string;
  documentType?: string;
  patientName?: string;
  treatmentDetails?: string;
}): string {
  const cleanDoctorName = (opts.doctorName || 'Dr. Carlos E. Leal S.').replace(/^(dr\(a\)\.?|dr\s*\(a\)|dr\.|dra\.|dr|dra)\s*/gi, '').trim();
  return `📋 *${(opts.documentType || 'TRATAMIENTO MÉDICO').toUpperCase()}* 📋\n\n` +
    `👤 *Paciente:* ${opts.patientName || 'Paciente'}\n` +
    `🩺 *Médico Tratante:* Dr(a). ${cleanDoctorName}\n\n` +
    `💊 *INDICACIONES:*\n${opts.treatmentDetails || 'Ver documento adjunto.'}\n\n` +
    DIGITAL_MEDIC_WHATSAPP_STICKER_FOOTER;
}

export async function exportAndSendWhatsAppBusiness(options: any): Promise<boolean> {
  const todayStr = new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(new Date());

  // La fecha de emisión siempre debe ser exactamente la del día actual
  const fechaEmision = options.dateStr || todayStr;

  const datos = extractDatosFromApp(options.config, options.recipe, options.indications, {
    nombrePaciente: options.patientName || options.recipe?.patientName,
    telefonoPaciente: options.patientPhone || options.recipe?.patientPhone,
    nombreMedico: options.doctorName || options.config?.doctorName,
    textoRp: options.treatmentDetails || options.recipe?.rp,
    textoIndicaciones: options.indications?.generalInstructions || options.treatmentDetails,
    fecha: fechaEmision
  });

  let phone = (datos.telefonoPaciente || options.patientPhone || options.recipe?.patientPhone || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '58' + phone.substring(1);

  const cleanRp = (options.treatmentDetails || options.recipe?.rp || datos.textoRp || datos.textoIndicaciones || 'Ver documento adjunto.').trim();
  const rawDoctor = datos.nombreMedico || options.doctorName || 'Dr. Carlos Leal';
  const cleanDoctorName = rawDoctor.replace(/^(dr\(a\)\.?|dr\s*\(a\)|dr\.|dra\.|dr|dra)\s*/gi, '').trim();

  const waMessage = 
    `📋 *${(options.documentTitle || 'RÉCIPE MÉDICO Y TRATAMIENTO').toUpperCase()}*\n\n` +
    `👤 *Paciente:* ${datos.nombrePaciente || 'Paciente'}\n` +
    `📅 *Fecha:* ${fechaEmision}\n` +
    `🩺 *Médico Tratante:* Dr(a). ${cleanDoctorName}\n` +
    (datos.diagnostico ? `🔬 *Diagnóstico:* ${datos.diagnostico}\n` : '') +
    `\n💊 *PRESCRIPCIÓN Y POSOLOGÍA MÉDICA:*\n${cleanRp}\n\n` +
    `📎 _*Recordatorio al médico:* Recuerda tocar el botón de adjuntar (clip 📎) en WhatsApp para adjuntar el PDF oficial descargado al paciente._\n\n` +
    DIGITAL_MEDIC_WHATSAPP_STICKER_FOOTER;

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  
  // En PC abre WhatsApp Web directamente en pestaña nueva; en Celulares abre la app nativa de WhatsApp
  const waUrl = isMobile
    ? (phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waMessage)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`)
    : (phone ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waMessage)}` : `https://web.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`);

  if (isMobile) {
    window.location.href = waUrl;
  } else {
    const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = waUrl;
    }
  }

  // Download PDF asynchronously in the background so browser doesn't block the WhatsApp redirection
  generarPDFDefinitivo(datos).then(() => {
    showWhatsAppClipAlert(`📎 ¡PDF Descargado! Recuerda tocar el ícono de clip (📎) en WhatsApp para adjuntar el archivo PDF al paciente.`);
  }).catch((err) => {
    console.warn('[WhatsApp PDF Download Async]:', err);
  });

  return true;
}

/**
 * Utilidad para convertir Data URLs en Blobs binarios reales
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0]?.split(':')[1] || 'image/png';
  const base64Data = parts[1] || '';
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: contentType });
}

/**
 * Exporta un elemento HTML como imagen PNG o JPG en alta resolución
 */
export async function exportElementAsImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  customFilename?: string
): Promise<boolean> {
  if (!element) return false;
  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: element.style.backgroundColor || '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        imageTimeout: 8000,
        ignoreElements: (node) => {
          return (
            node.classList?.contains('no-print') ||
            node.classList?.contains('no-pdf') ||
            node.tagName === 'BUTTON' ||
            false
          );
        },
        onclone: (clonedDoc, clonedElement) => {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.transform = 'none';
          clonedElement.style.margin = '0 auto';

          // 1. Convertir inputs en texto plano para que no salgan bordes punteados ni cursores
          const inputs = Array.from(clonedElement.querySelectorAll<HTMLInputElement>('input'));
          inputs.forEach((input) => {
            const span = clonedDoc.createElement('span');
            span.textContent = input.value || input.placeholder || '';
            span.style.fontFamily = 'inherit';
            span.style.fontSize = 'inherit';
            span.style.fontWeight = 'bold';
            span.style.color = '#0f172a';
            span.style.display = 'inline-block';
            if (input.parentNode) {
              input.parentNode.replaceChild(span, input);
            }
          });

          // 2. Convertir textareas en bloques con saltos de línea
          const textareas = Array.from(clonedElement.querySelectorAll<HTMLTextAreaElement>('textarea'));
          textareas.forEach((textarea) => {
            const div = clonedDoc.createElement('div');
            div.textContent = textarea.value || '';
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordBreak = 'break-word';
            div.style.fontFamily = textarea.style.fontFamily || 'inherit';
            div.style.fontSize = '13.5px';
            div.style.fontWeight = '600';
            div.style.lineHeight = '1.6';
            div.style.color = '#0f172a';
            div.style.minHeight = '120px';
            div.style.padding = '6px 0';
            if (textarea.parentNode) {
              textarea.parentNode.replaceChild(div, textarea);
            }
          });

          // 3. Sanitizar imágenes en el clon
          const imgs = Array.from(clonedElement.querySelectorAll<HTMLImageElement>('img'));
          imgs.forEach((img) => {
            if (img.src) {
              img.src = safeFormatSrcUrl(img.src);
              if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
                img.crossOrigin = 'anonymous';
              } else {
                img.removeAttribute('crossorigin');
              }
            }
          });
        }
      });
    } catch (err1) {
      console.warn('Primer intento html2canvas falló, reintentando con escala 1.5:', err1);
      canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: element.style.backgroundColor || '#ffffff',
        logging: false,
        imageTimeout: 6000,
      });
    }

    if (!canvas) {
      throw new Error('No se pudo generar el canvas de la imagen.');
    }

    const safeName = customFilename 
      ? (customFilename.toLowerCase().endsWith(`.${ext}`) ? customFilename : `${customFilename}.${ext}`)
      : `Foto-Recipe-${Date.now()}.${ext}`;

    return await downloadCanvasAsFile(canvas, safeName, mimeType);
  } catch (err) {
    console.error('Error al exportar imagen del récipe:', err);
    return false;
  }
}

/**
 * Descarga garantizada de un HTMLCanvasElement como archivo PNG o JPG
 */
export async function downloadCanvasAsFile(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string = 'image/png'
): Promise<boolean> {
  if (!canvas) return false;
  try {
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL(mimeType, 0.95);
    } catch (_) {
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch (e) {
        console.error('Error en canvas.toDataURL:', e);
      }
    }

    if (!dataUrl || dataUrl.length < 100 || dataUrl === 'data:,') {
      console.error('Canvas inválido o sin datos');
      return false;
    }

    // Estrategia 1: Descarga con Blob y ObjectURL
    try {
      const blob = dataUrlToBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        URL.revokeObjectURL(url);
      }, 30000);
      return true;
    } catch (blobErr) {
      console.warn('Estrategia ObjectURL falló, probando dataUrl directa:', blobErr);
    }

    // Estrategia 2: Descarga directa vía enlace DataURL
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = dataUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 30000);
    return true;
  } catch (finalErr) {
    console.error('Error al descargar canvas como archivo:', finalErr);
    return false;
  }
}

/**
 * Exporta la hoja horizontal unificada 2 en 1 (Récipe + Indicaciones) como imagen PNG o JPG
 */
export async function exportDualSheetAsImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  customFilename?: string,
  backgroundColor: string = '#ffffff'
): Promise<boolean> {
  if (!element) return false;
  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    const offscreenWrapper = document.createElement('div');
    offscreenWrapper.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: 1056px;
      height: 816px;
      background-color: ${backgroundColor || '#ffffff'};
      opacity: 1;
      z-index: -9999;
      pointer-events: none;
      overflow: hidden;
      box-sizing: border-box;
    `;

    const clonedEl = prepareClonedElementForCanvas(element);
    clonedEl.style.width = '1056px';
    clonedEl.style.height = '816px';
    clonedEl.style.display = 'flex';
    clonedEl.style.flexDirection = 'row';
    clonedEl.style.backgroundColor = backgroundColor || '#ffffff';

    offscreenWrapper.appendChild(clonedEl);
    document.body.appendChild(offscreenWrapper);

    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await html2canvas(offscreenWrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 8000,
        backgroundColor: backgroundColor || '#ffffff',
        onclone: (clonedDoc, clonedWrapper) => {
          const imgs = Array.from(clonedWrapper.querySelectorAll<HTMLImageElement>('img'));
          imgs.forEach((img) => {
            if (img.src) {
              img.src = safeFormatSrcUrl(img.src);
              if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
                img.crossOrigin = 'anonymous';
              }
            }
          });
        }
      });
    } catch (captureErr) {
      console.warn('Primer intento de captura dual falló, reintentando con escala 1.5:', captureErr);
      canvas = await html2canvas(offscreenWrapper, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 6000,
        backgroundColor: backgroundColor || '#ffffff',
      });
    } finally {
      if (offscreenWrapper.parentNode) {
        document.body.removeChild(offscreenWrapper);
      }
    }

    if (!canvas) {
      throw new Error('No se pudo generar el canvas de la imagen.');
    }

    const safeName = customFilename 
      ? (customFilename.toLowerCase().endsWith(`.${ext}`) ? customFilename : `${customFilename}.${ext}`)
      : `Foto-Recipe-${Date.now()}.${ext}`;

    return await downloadCanvasAsFile(canvas, safeName, mimeType);
  } catch (err) {
    console.error('Error al exportar dual sheet como imagen:', err);
    return false;
  }
}

export async function sharePDFViaWebShare(
  element?: HTMLElement | null,
  rawFilename?: string,
  shareTitle?: string,
  shareText?: string,
  patientPhone?: string,
  customDatos?: DatosRecipePDF
): Promise<{ success: boolean; method: 'webshare' | 'download_whatsapp'; filename: string }> {
  const success = await generarPDFDefinitivo(customDatos, rawFilename);
  showWhatsAppClipAlert('📎 Se ha descargado el PDF oficial. Por favor adjúntelo en el chat.');
  return { 
    success, 
    method: 'download_whatsapp', 
    filename: rawFilename || 'Carlos Leal 19 10 26.pdf'
  };
}

export async function validateDoctorFormatForExport(config: any): Promise<{ valid: boolean; message?: string }> {
  return { valid: true };
}