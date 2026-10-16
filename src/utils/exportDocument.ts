import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Interface de datos aceptada por la lógica del usuario
export interface DatosRecipePDF {
  nombreMedico?: string;
  especialidad?: string;
  mpps?: string;
  cm?: string;
  clinicaDireccion?: string;
  nombrePaciente?: string;
  cedulaPaciente?: string;
  edadPaciente?: string;
  fecha?: string;
  telefonoPaciente?: string;
  textoRp?: string;
  textoIndicaciones?: string;
  selloBase64?: string;
}

/**
 * Extrae y formatea el objeto `datos` leyendo la configuración del médico,
 * el récipe y las indicaciones presentes en la aplicación o localStorage.
 */
export function extractDatosFromApp(
  config?: any,
  recipe?: any,
  indications?: any,
  customOpts?: Partial<DatosRecipePDF>
): DatosRecipePDF {
  let docConfig = config;
  if (!docConfig && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('digital_medic_doctor_config_v2');
      if (stored) docConfig = JSON.parse(stored);
    } catch (_) {}
  }

  let curRecipe = recipe;
  if (!curRecipe && typeof localStorage !== 'undefined') {
    try {
      const storedEco = localStorage.getItem('digital_medic_user_ecosystem_v2');
      if (storedEco) {
        const parsed = JSON.parse(storedEco);
        if (parsed.recipes && parsed.recipes.length > 0) {
          curRecipe = parsed.recipes[0];
        }
      }
    } catch (_) {}
  }

  let curIndications = indications;
  if (!curIndications && typeof localStorage !== 'undefined') {
    try {
      const storedEco = localStorage.getItem('digital_medic_user_ecosystem_v2');
      if (storedEco) {
        const parsed = JSON.parse(storedEco);
        if (parsed.indications) curIndications = parsed.indications;
      }
    } catch (_) {}
  }

  const nombreMedico = customOpts?.nombreMedico || docConfig?.doctorName || 'Dr. Carlos Leal';
  const especialidad = customOpts?.especialidad || docConfig?.specialty || 'Especialista';
  const mpps = customOpts?.mpps || docConfig?.mpps || '----';
  const cm = customOpts?.cm || docConfig?.collegeNumber || docConfig?.ci || '----';
  const clinicaDireccion = customOpts?.clinicaDireccion || docConfig?.address || docConfig?.clinicAddress || docConfig?.institution || '';

  const nombrePaciente = customOpts?.nombrePaciente || curRecipe?.patientName || 'Carlos leal';
  const cedulaPaciente = customOpts?.cedulaPaciente || curRecipe?.patientCI || '';
  const edadPaciente = customOpts?.edadPaciente || curRecipe?.patientAge || '';
  const fecha = customOpts?.fecha || curRecipe?.date || new Date().toLocaleDateString('es-VE');
  const telefonoPaciente = customOpts?.telefonoPaciente || curRecipe?.patientPhone || '';

  const textoRp = customOpts?.textoRp || curRecipe?.rp || '';
  const textoIndicaciones = customOpts?.textoIndicaciones || curIndications?.medicationSchedule || curRecipe?.indicationsNotes || '';
  const selloBase64 = customOpts?.selloBase64 || docConfig?.selloDigitalImg || docConfig?.signatureImg || '';

  return {
    nombreMedico,
    especialidad,
    mpps,
    cm,
    clinicaDireccion,
    nombrePaciente,
    cedulaPaciente,
    edadPaciente,
    fecha,
    telefonoPaciente,
    textoRp,
    textoIndicaciones,
    selloBase64,
  };
}

// ==========================================
// 1. GENERADOR DE PDF BÁSICO (SOLO PARA RESPALDO / FALLBACK)
// ==========================================
export function construirDocumentoPDF(datos: DatosRecipePDF) {
  const jsPDFClass = (window as any).jspdf ? (window as any).jspdf.jsPDF : jsPDF;
  const doc = new jsPDFClass({ orientation: "landscape", unit: "mm", format: "letter" });

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(139.7, 8, 139.7, 208);
  doc.setLineDashPattern([], 0);

  const dibujarMitad = (offsetX: number, tituloSeccion: string, contenidoTexto: string = "") => {
    const centroX = offsetX + 69.85;
    const margenIzq = offsetX + 10;
    const margenDer = offsetX + 129.7;
    const anchoUtil = 119.7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(12, 45, 87);
    doc.text((datos.nombreMedico || "Dr. Nombre Apellido").toUpperCase(), centroX, 16, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    doc.text(datos.especialidad || "Especialista", centroX, 21.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`M.P.P.S.: ${datos.mpps || "----"}   |   C.M.: ${datos.cm || "----"}`, centroX, 26.5, { align: "center" });
    
    if (datos.clinicaDireccion) {
      doc.setFontSize(8);
      doc.text(datos.clinicaDireccion, centroX, 31, { align: "center" });
    }

    doc.setDrawColor(12, 45, 87);
    doc.setLineWidth(0.6);
    doc.line(margenIzq, 34, margenDer, 34);
    doc.setLineWidth(0.2);
    doc.line(margenIzq, 35.2, margenDer, 35.2);

    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Paciente:", margenIzq, 42);
    doc.setFont("helvetica", "normal");
    doc.text(datos.nombrePaciente || "________________________", margenIzq + 17, 42);

    doc.setFont("helvetica", "bold");
    doc.text("C.I.:", margenIzq, 48);
    doc.setFont("helvetica", "normal");
    doc.text(datos.cedulaPaciente || "____________", margenIzq + 8, 48);

    doc.setFont("helvetica", "bold");
    doc.text("Edad:", margenIzq + 45, 48);
    doc.setFont("helvetica", "normal");
    doc.text(datos.edadPaciente ? `${datos.edadPaciente}` : "____", margenIzq + 56, 48);

    const fechaHoy = datos.fecha || new Date().toLocaleDateString("es-VE");
    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", margenDer - 32, 48);
    doc.setFont("helvetica", "normal");
    doc.text(fechaHoy, margenDer, 48, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margenIzq, 52, margenDer, 52);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(12, 45, 87);
    doc.text(tituloSeccion, margenIzq, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    const lineas = doc.splitTextToSize(contenidoTexto || "", anchoUtil);
    doc.text(lineas, margenIzq, 67);

    if (datos.selloBase64) {
      try {
        doc.addImage(datos.selloBase64, "PNG", centroX - 22, 160, 44, 22);
      } catch (e) {
        console.warn("No se pudo insertar imagen de sello:", e);
      }
    }

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(centroX - 30, 185, centroX + 30, 185);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text("Firma y Sello del Médico", centroX, 190, { align: "center" });

    doc.setDrawColor(220, 220, 220);
    doc.line(margenIzq, 196, margenDer, 196);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text("Generado digitalmente con Digital Medic — C.E. Leal Studio", centroX, 202, { align: "center" });
  };

  dibujarMitad(0, "Rp./", datos.textoRp);
  dibujarMitad(139.7, "INDICACIONES:", datos.textoIndicaciones);

  return doc;
}

// ==========================================
// 2. CONSTRUCTOR DE MENSAJE DE WHATSAPP: ESTRICTAMENTE LOS FÁRMACOS DEL RÉCIPE
// ==========================================
export function buildWhatsAppPharmacologicalMessage(options: {
  patientName?: string;
  patientCI?: string;
  dateStr?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  mpps?: string;
  ci?: string;
  rpText?: string;
  indicationsText?: string;
  documentType?: string;
}): string {
  const patient = (options.patientName || 'Carlos leal').trim();
  const doctor = (options.doctorName || 'Dr. Carlos Leal').trim();
  const specialty = (options.doctorSpecialty || 'Médico').trim();
  const date = options.dateStr || new Date().toLocaleDateString('es-VE');
  
  // Limpieza estricta de fármacos prescritos
  const rawRp = (options.rpText || '').trim();
  const rawIndications = (options.indicationsText || '').trim();

  let msg = `*RÉCIPE MÉDICO OFICIAL* 🩺\n`;
  msg += `*Médico Tratante:* Dr(a). ${doctor} (${specialty})\n`;
  msg += `*Paciente:* ${patient}`;
  if (options.patientCI) {
    msg += ` | *C.I:* ${options.patientCI}`;
  }
  msg += ` | *Fecha:* ${date}\n\n`;

  msg += `*💊 FÁRMACOS Y TRATAMIENTO PRESCRITO (Rp.):*\n`;
  if (rawRp) {
    msg += `${rawRp}\n\n`;
  } else {
    msg += `(Consulte la lista detallada de fármacos en el archivo PDF del récipe adjunto)\n\n`;
  }

  if (rawIndications && rawIndications !== rawRp) {
    msg += `*📋 INDICACIONES MÉDICAS:*\n`;
    msg += `${rawIndications}\n\n`;
  }

  msg += `📎 Se ha descargado el archivo PDF oficial en su dispositivo. Por favor, pulse el clip en este chat y adjúntelo para su validez\n\n`;
  msg += `_¡Deseándole una pronta recuperación!_ ✨`;

  return msg;
}

export function buildWhatsAppTreatmentMessage(params: any): string {
  return buildWhatsAppPharmacologicalMessage({
    doctorName: params.doctorName,
    doctorSpecialty: params.doctorSpecialty,
    patientName: params.patientName,
    patientCI: params.patientCI,
    dateStr: params.dateStr,
    rpText: params.treatmentDetails || params.rpText,
    indicationsText: params.indicationsText,
  });
}

// ==========================================
// 3. CAPTURA DE ALTA DEFINICIÓN DEL FORMATO REAL DEL MÉDICO CON HTML2CANVAS
// ==========================================
function findActivePrintElement(explicitElement?: HTMLElement | null): HTMLElement | null {
  if (explicitElement && typeof explicitElement.getBoundingClientRect === 'function') {
    return explicitElement;
  }
  if (typeof document === 'undefined') return null;

  const selectors = [
    '#recipe-quarter-print-container',
    '#recipe-single-print-container',
    '#recipe-4copies-print-sheet',
    '#recipe-4en1-print-sheet',
    '#dual-recipe-print-container',
    '#report-print-container',
    '#indications-print-container',
    '#rest-print-container',
    '#history-print-container',
    '.recipe-single-card',
    '.recipe-single-container',
    '.dual-recipe-sheet',
    '.dual-recipe-container',
    '.recipe-4en1-container',
    '.report-sheet-container',
    '.indications-container',
    '.rest-container',
    '.clinical-history-container',
    '.print-container'
  ];

  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && el.offsetParent !== null) { // visible
      return el;
    }
  }

  return document.querySelector<HTMLElement>('.print-container');
}

/**
 * Convierte el elemento DOM del médico exactamente como se ve en pantalla
 * a un documento jsPDF con resolución nítida y proporciones oficiales de hoja carta.
 */
async function renderElementToJsPDF(targetEl: HTMLElement): Promise<jsPDF> {
  // Asegurar captura con dimensiones de hoja médica limpia y reemplazo de inputs por texto puro
  const canvas = await html2canvas(targetEl, {
    scale: 2.5, // 2.5x resolución para impresión médica ultra nítida
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc, clonedEl) => {
      // 1. Ocultar botones y elementos de interfaz de usuario
      const noPrints = clonedEl.querySelectorAll('.no-print, button, .pwa-floating-btn-container');
      noPrints.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // 2. Establecer ancho estable para evitar que la vista móvil comprima la hoja del PDF
      const isQuarter = clonedEl.classList.contains('recipe-size-quarter') || clonedEl.id.includes('quarter');
      const isDual = clonedEl.classList.contains('dual-recipe-container') || clonedEl.id.includes('dual');
      
      if (isQuarter) {
        clonedEl.style.width = '420px';
        clonedEl.style.maxWidth = '420px';
      } else if (isDual) {
        clonedEl.style.width = '900px';
        clonedEl.style.maxWidth = '900px';
      } else {
        clonedEl.style.width = '800px';
        clonedEl.style.maxWidth = '800px';
      }

      clonedEl.style.margin = '0 auto';
      clonedEl.style.boxShadow = 'none';
      clonedEl.style.borderRadius = '0px';

      // 3. Reemplazar inputs y textareas por texto limpio para que no salgan bordes de formulario en el PDF
      const inputs = clonedEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
      inputs.forEach((inp) => {
        const val = inp.value || inp.getAttribute('value') || '';
        const div = clonedDoc.createElement('div');
        const comp = window.getComputedStyle(inp);
        div.style.fontFamily = comp.fontFamily;
        div.style.fontSize = comp.fontSize;
        div.style.fontWeight = comp.fontWeight;
        div.style.color = comp.color || '#0f172a';
        div.style.lineHeight = comp.lineHeight;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.border = 'none';
        div.style.background = 'transparent';
        div.style.padding = '0';
        div.style.margin = '0';
        div.textContent = val;
        inp.parentNode?.replaceChild(div, inp);
      });
    }
  });

  const isLandscape = canvas.width > canvas.height * 1.15;
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = isLandscape ? 279.4 : 215.9;
  const pageHeight = isLandscape ? 215.9 : 279.4;

  const marginX = 8;
  const marginY = 8;
  const maxW = pageWidth - marginX * 2;
  const maxH = pageHeight - marginY * 2;

  const aspect = canvas.width / canvas.height;
  let renderW = maxW;
  let renderH = renderW / aspect;

  if (renderH > maxH) {
    renderH = maxH;
    renderW = renderH * aspect;
  }

  const posX = (pageWidth - renderW) / 2;
  const posY = (pageHeight - renderH) / 2;

  const imgData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imgData, 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');

  return pdf;
}

// ==========================================
// 4. DESCARGA OFICIAL DE PDF RESPETANDO 100% EL FORMATO VISUAL DEL MÉDICO
// ==========================================
export async function exportElementAsPDF(
  element?: HTMLElement | null,
  rawFilename?: string,
  customDatos?: DatosRecipePDF
): Promise<boolean> {
  try {
    const targetEl = findActivePrintElement(element);
    const filename = rawFilename || `Recipe_${Date.now()}.pdf`;

    if (targetEl) {
      const pdf = await renderElementToJsPDF(targetEl);
      pdf.save(filename);
      return true;
    }

    // Si por alguna razón no hay DOM, usar fallback estructurado
    const datos = customDatos || extractDatosFromApp();
    const doc = construirDocumentoPDF(datos);
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('[Digital Medic] Error al renderizar PDF con formato real:', err);
    try {
      const datos = customDatos || extractDatosFromApp();
      const doc = construirDocumentoPDF(datos);
      doc.save(rawFilename || 'Recipe.pdf');
      return true;
    } catch (_) {
      return false;
    }
  }
}

export async function exportMultipleElementsAsPDF(
  elements: (HTMLElement | null)[],
  rawFilename?: string
): Promise<boolean> {
  const firstValid = elements.find((el) => el !== null);
  return exportElementAsPDF(firstValid, rawFilename);
}

export async function generatePDFBlob(
  targetElement?: HTMLElement | null,
  customDatos?: DatosRecipePDF
): Promise<Blob | null> {
  try {
    const targetEl = findActivePrintElement(targetElement);
    if (targetEl) {
      const pdf = await renderElementToJsPDF(targetEl);
      return pdf.output('blob');
    }
    const datos = customDatos || extractDatosFromApp();
    const doc = construirDocumentoPDF(datos);
    return doc.output('blob');
  } catch (e) {
    console.error('[Digital Medic] Error al generar Blob con formato real:', e);
    try {
      const datos = customDatos || extractDatosFromApp();
      const doc = construirDocumentoPDF(datos);
      return doc.output('blob');
    } catch (_) {
      return null;
    }
  }
}

export async function generateMultiplePDFBlob(
  elements: (HTMLElement | null)[]
): Promise<Blob | null> {
  const firstValid = elements.find((el) => el !== null);
  return generatePDFBlob(firstValid);
}

export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (_) {}
  }, 1200);
}

// ==========================================
// 5. ENVIAR POR WHATSAPP CON DESCARGA DEL PDF Y RECORDATORIO VISUAL DEL CLIP 📎
// ==========================================
export async function compartirPDFAdjuntoWhatsApp(datos: DatosRecipePDF, targetElement?: HTMLElement | null) {
  const cleanPatient = (datos.nombrePaciente || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
  const nombreArchivo = `Recipe_${cleanPatient}.pdf`;

  // a) Disparar la descarga automática del PDF oficial del récipe al dispositivo
  try {
    const targetEl = findActivePrintElement(targetElement);
    await exportElementAsPDF(targetEl, nombreArchivo, datos);
  } catch (_) {
    const doc = construirDocumentoPDF(datos);
    doc.save(nombreArchivo);
  }

  // b) Notificación explicativa en pantalla
  showWhatsAppClipAlert('📎 Se ha descargado el archivo PDF oficial en su dispositivo. Por favor, pulse el clip en este chat y adjúntelo para su validez.');

  // c) Abrir la API de WhatsApp copiando el mensaje al portapapeles
  enviarWhatsAppDirectoNumero(datos, false);
}

export function enviarWhatsAppDirectoNumero(datos: DatosRecipePDF, descargarTambien = false) {
  if (descargarTambien) {
    const cleanPatient = (datos.nombrePaciente || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
    exportElementAsPDF(null, `Recipe_${cleanPatient}.pdf`, datos).catch(console.warn);
  }

  let telefono = (datos.telefonoPaciente || "").replace(/\D/g, "");
  if (telefono.startsWith("0")) {
    telefono = "58" + telefono.substring(1);
  } else if (telefono.length === 10 && (telefono.startsWith("41") || telefono.startsWith("42"))) {
    telefono = "58" + telefono;
  }

  const mensaje = buildWhatsAppPharmacologicalMessage({
    patientName: datos.nombrePaciente,
    patientCI: datos.cedulaPaciente,
    dateStr: datos.fecha,
    doctorName: datos.nombreMedico,
    doctorSpecialty: datos.especialidad,
    mpps: datos.mpps,
    ci: datos.cm,
    rpText: datos.textoRp,
    indicationsText: datos.textoIndicaciones,
  });

  // Copiar al portapapeles el mensaje
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mensaje).catch(() => {});
    }
  } catch (_) {}

  const urlWhatsApp = telefono 
    ? `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  if (isMobile) {
    window.location.href = urlWhatsApp;
  } else {
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  }
}

export function buildDocumentPdfFilename(
  docType: string = 'récipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  const cleanP = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanD = (docType || 'Documento').replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanD}_${cleanP}.pdf`;
}

export function sanitizeToAsciiFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '').trim();
}

export async function sharePDFViaWebShare(
  element?: HTMLElement | null,
  rawFilename?: string,
  shareTitle?: string,
  shareText?: string,
  patientPhone?: string,
  customDatos?: DatosRecipePDF
): Promise<{ success: boolean; method: 'webshare' | 'download_whatsapp'; filename: string }> {
  const datos = customDatos || extractDatosFromApp(undefined, undefined, undefined, {
    telefonoPaciente: patientPhone,
    nombrePaciente: shareTitle ? shareTitle.split('-')[1]?.trim() : undefined
  });
  await compartirPDFAdjuntoWhatsApp(datos, element);
  return { 
    success: true, 
    method: 'download_whatsapp', 
    filename: rawFilename || `Recipe_${(datos.nombrePaciente || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf` 
  };
}

export async function sharePDFToWhatsAppNative(
  element?: HTMLElement | null,
  patientName?: string,
  documentTitle?: string,
  customMessage?: string,
  dateStr?: string,
  patientPhone?: string
): Promise<boolean> {
  const datos = extractDatosFromApp(undefined, undefined, undefined, {
    nombrePaciente: patientName,
    telefonoPaciente: patientPhone,
    fecha: dateStr,
    textoRp: customMessage
  });
  await compartirPDFAdjuntoWhatsApp(datos, element);
  return true;
}

export async function exportAndSendWhatsAppBusiness(options: any): Promise<boolean> {
  const datos = extractDatosFromApp(options.config, options.recipe, options.indications, {
    nombrePaciente: options.patientName,
    telefonoPaciente: options.patientPhone,
    nombreMedico: options.doctorName,
    textoRp: options.recipe?.rp || options.treatmentDetails,
    textoIndicaciones: options.indications?.medicationSchedule || options.indicationsNotes,
    fecha: options.dateStr
  });
  await compartirPDFAdjuntoWhatsApp(datos, options.element);
  return true;
}

export function showWhatsAppClipAlert(customMessage?: string): void {
  try {
    if (typeof window !== 'undefined') {
      const msg = customMessage || '📎 ¡PDF Descargado! Recuerda tocar el clip (📎) en WhatsApp para adjuntarlo al paciente.';
      window.dispatchEvent(new CustomEvent('app-toast', { detail: msg }));
      // Also broadcast custom event for clip modal
      window.dispatchEvent(new CustomEvent('whatsapp-clip-reminder', { detail: { message: msg } }));
    }
  } catch (_) {}
}
