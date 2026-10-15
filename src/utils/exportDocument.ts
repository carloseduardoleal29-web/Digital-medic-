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
// 1. GENERADOR DEL PDF FORMATO RÉCIPE DOBLE (Rp. + Indicaciones)
// ==========================================
export function construirDocumentoPDF(datos: DatosRecipePDF) {
  const jsPDFClass = (window as any).jspdf ? (window as any).jspdf.jsPDF : jsPDF;
  // Formato Carta Horizontal (279.4 mm ancho x 215.9 mm alto)
  const doc = new jsPDFClass({ orientation: "landscape", unit: "mm", format: "letter" });

  // Línea punteada central de corte (X = 139.7 mm)
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(139.7, 8, 139.7, 208);
  doc.setLineDashPattern([], 0); // Restaurar línea sólida

  // Función interna que dibuja cada mitad (offsetX = 0 para Rp, offsetX = 139.7 para Indicaciones)
  const dibujarMitad = (offsetX: number, tituloSeccion: string, contenidoTexto: string = "") => {
    const centroX = offsetX + 69.85;
    const margenIzq = offsetX + 10;
    const margenDer = offsetX + 129.7;
    const anchoUtil = 119.7;

    // --- ENCABEZADO MÉDICO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(12, 45, 87); // Azul médico institucional
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

    // Doble línea elegante de membrete
    doc.setDrawColor(12, 45, 87);
    doc.setLineWidth(0.6);
    doc.line(margenIzq, 34, margenDer, 34);
    doc.setLineWidth(0.2);
    doc.line(margenIzq, 35.2, margenDer, 35.2);

    // --- DATOS DEL PACIENTE ---
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

    // Línea separadora paciente / cuerpo
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margenIzq, 52, margenDer, 52);

    // --- TÍTULO DE SECCIÓN (Rp. o Indicaciones) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(12, 45, 87);
    doc.text(tituloSeccion, margenIzq, 60);

    // --- CONTENIDO DEL RÉCIPE O INDICACIONES ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    const lineas = doc.splitTextToSize(contenidoTexto || "", anchoUtil);
    doc.text(lineas, margenIzq, 67);

    // --- FIRMA Y SELLO HÚMEDO DIGITAL ---
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

    // --- PIE DE PÁGINA Y MARCA DE AGUA ---
    doc.setDrawColor(220, 220, 220);
    doc.line(margenIzq, 196, margenDer, 196);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text("Generado digitalmente con Digital Medic — C.E. Leal Studio", centroX, 202, { align: "center" });
  };

  // Dibujar lado izquierdo (Rp.) y lado derecho (Indicaciones)
  dibujarMitad(0, "Rp./", datos.textoRp);
  dibujarMitad(139.7, "INDICACIONES:", datos.textoIndicaciones);

  return doc;
}

// ==========================================
// 2. BOTÓN 1: COMPARTIR ARCHIVO PDF ADJUNTO POR WHATSAPP
// ==========================================
export async function compartirPDFAdjuntoWhatsApp(datos: DatosRecipePDF) {
  const doc = construirDocumentoPDF(datos);
  const nombreLimpio = (datos.nombrePaciente || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
  const nombreArchivo = `Recipe_${nombreLimpio}.pdf`;

  const pdfBlob = doc.output("blob");
  const archivoPDF = new File([pdfBlob], nombreArchivo, { type: "application/pdf" });

  // Si está en teléfono (Android / iPhone), abre el selector nativo con el PDF ya adjunto
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [archivoPDF] })) {
    try {
      await navigator.share({
        files: [archivoPDF],
        title: `Récipe Médico - ${datos.nombrePaciente || ""}`,
        text: `Hola ${datos.nombrePaciente || ""}, le envío su récipe e indicaciones médicas en formato PDF.`
      });
      return;
    } catch (err) {
      console.log("Menú nativo cerrado o cancelado:", err);
    }
  }

  // Si está en PC o dentro del iframe de AI Studio, descarga el PDF y abre WhatsApp directo
  doc.save(nombreArchivo);
  enviarWhatsAppDirectoNumero(datos, false);
}

// ==========================================
// 3. BOTÓN 2: ENVIAR AL NÚMERO DE TELÉFONO DEL PACIENTE + DESCARGAR PDF
// ==========================================
export function enviarWhatsAppDirectoNumero(datos: DatosRecipePDF, descargarTambien = true) {
  if (descargarTambien) {
    const doc = construirDocumentoPDF(datos);
    const nombreLimpio = (datos.nombrePaciente || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Recipe_${nombreLimpio}.pdf`);
  }

  // Formatear número venezolano (0412/0414/0424/0416 -> 58412...)
  let telefono = (datos.telefonoPaciente || "").replace(/\D/g, "");
  if (telefono.startsWith("0")) {
    telefono = "58" + telefono.substring(1);
  } else if (telefono.length === 10 && (telefono.startsWith("41") || telefono.startsWith("42"))) {
    telefono = "58" + telefono;
  }

  const mensaje = 
    `*RÉCIPE E INDICACIONES MÉDICAS*\n` +
    `*${datos.nombreMedico || ""}* (${datos.especialidad || ""})\n` +
    `----------------------------------\n` +
    `*Paciente:* ${datos.nombrePaciente || "N/A"}\n` +
    `*C.I.:* ${datos.cedulaPaciente || "N/A"} | *Fecha:* ${new Date().toLocaleDateString("es-VE")}\n\n` +
    `*Rp./ (Medicamentos):*\n${datos.textoRp || "Sin medicamentos"}\n\n` +
    `*INDICACIONES:*\n${datos.textoIndicaciones || "Sin indicaciones"}\n` +
    `----------------------------------\n` +
    `_Documento generado con Digital Medic - C.E. Leal Studio_`;

  const urlWhatsApp = telefono 
    ? `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  window.open(urlWhatsApp, "_blank");
}

// ==========================================
// FUNCIONES COMPATIBLES PARA LA APLICACIÓN
// ==========================================

export function buildDocumentPdfFilename(
  docType: string = 'récipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  const cleanP = (patientName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
  return `Recipe_${cleanP}.pdf`;
}

export function sanitizeToAsciiFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '').trim();
}

export async function exportElementAsPDF(
  element?: HTMLElement | null,
  rawFilename?: string,
  customDatos?: DatosRecipePDF
): Promise<boolean> {
  try {
    const datos = customDatos || extractDatosFromApp(undefined, undefined, undefined, {
      nombrePaciente: rawFilename ? rawFilename.replace(/^Recipe_/i, '').replace(/\.pdf$/i, '') : undefined
    });
    const doc = construirDocumentoPDF(datos);
    const filename = rawFilename || `Recipe_${(datos.nombrePaciente || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Error al exportar PDF con jsPDF nativo:', err);
    return false;
  }
}

export async function exportMultipleElementsAsPDF(
  elements: (HTMLElement | null)[],
  rawFilename?: string
): Promise<boolean> {
  return exportElementAsPDF(null, rawFilename);
}

export async function generatePDFBlob(
  targetElement?: HTMLElement | null,
  customDatos?: DatosRecipePDF
): Promise<Blob | null> {
  try {
    const datos = customDatos || extractDatosFromApp();
    const doc = construirDocumentoPDF(datos);
    return doc.output('blob');
  } catch (e) {
    console.error('Error al generar Blob PDF:', e);
    return null;
  }
}

export async function generateMultiplePDFBlob(
  elements: (HTMLElement | null)[]
): Promise<Blob | null> {
  return generatePDFBlob();
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
  await compartirPDFAdjuntoWhatsApp(datos);
  return { success: true, method: 'webshare', filename: `Recipe_${(datos.nombrePaciente || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_')}.pdf` };
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
    fecha: dateStr
  });
  await compartirPDFAdjuntoWhatsApp(datos);
  return true;
}

export async function exportAndSendWhatsAppBusiness(options: any): Promise<boolean> {
  const datos = extractDatosFromApp(options.config, options.recipe, options.indications, {
    nombrePaciente: options.patientName,
    telefonoPaciente: options.patientPhone,
    nombreMedico: options.doctorName,
    textoRp: options.recipe?.rp || options.treatmentDetails,
    textoIndicaciones: options.indications?.medicationSchedule || options.treatmentDetails,
    fecha: options.dateStr
  });
  await compartirPDFAdjuntoWhatsApp(datos);
  return true;
}

export function buildWhatsAppTreatmentMessage(params: any): string {
  const datos = extractDatosFromApp(undefined, undefined, undefined, {
    nombreMedico: params.doctorName,
    nombrePaciente: params.patientName,
    textoRp: params.treatmentDetails,
    especialidad: params.doctorSpecialty,
    mpps: params.mpps,
    cm: params.ci
  });
  return (
    `*RÉCIPE E INDICACIONES MÉDICAS*\n` +
    `*${datos.nombreMedico || ""}* (${datos.especialidad || ""})\n` +
    `----------------------------------\n` +
    `*Paciente:* ${datos.nombrePaciente || "N/A"}\n` +
    `*C.I.:* ${datos.cedulaPaciente || "N/A"} | *Fecha:* ${datos.fecha || new Date().toLocaleDateString("es-VE")}\n\n` +
    `*Rp./ (Medicamentos):*\n${datos.textoRp || "Sin medicamentos"}\n\n` +
    `*INDICACIONES:*\n${datos.textoIndicaciones || "Sin indicaciones"}\n` +
    `----------------------------------\n` +
    `_Documento generado con Digital Medic - C.E. Leal Studio_`
  );
}

export function showWhatsAppClipAlert(customMessage?: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: customMessage || 'PDF generado exitosamente.' }));
    }
  } catch (_) {}
}
