import html2pdf from 'html2pdf.js';

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

export function extractDatosFromApp(
  config?: any,
  recipe?: any,
  indications?: any,
  customOpts?: Partial<DatosRecipePDF>
): DatosRecipePDF {
  let docConfig = config;
  if (!docConfig && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('digital_medic_doctor_config_v2') || localStorage.getItem('digital_medic_current_config');
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
      if (!curRecipe) {
        const storedRec = localStorage.getItem('digital_medic_recipes_v2');
        if (storedRec) {
          const parsedRecs = JSON.parse(storedRec);
          if (parsedRecs.length > 0) curRecipe = parsedRecs[0];
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

  const nombreMedico = customOpts?.nombreMedico || docConfig?.doctorName || 'Dr. Carlos Leal';
  const especialidad = customOpts?.especialidad || docConfig?.specialty || 'Especialista';
  const mpps = customOpts?.mpps || docConfig?.mpps || '----';
  const cm = customOpts?.cm || docConfig?.collegeNumber || docConfig?.ci || '----';
  const clinicaDireccion = customOpts?.clinicaDireccion || docConfig?.address || docConfig?.clinicAddress || docConfig?.institution || '';

  const nombrePaciente = customOpts?.nombrePaciente || curIndications?.patientName || curRecipe?.patientName || 'Carlos Pérez';
  const cedulaPaciente = customOpts?.cedulaPaciente || curIndications?.patientCI || curRecipe?.patientCI || '';
  const edadPaciente = customOpts?.edadPaciente || curIndications?.patientAge || curRecipe?.patientAge || '';
  const fecha = customOpts?.fecha || curIndications?.date || curRecipe?.date || new Date().toLocaleDateString('es-VE');
  const telefonoPaciente = customOpts?.telefonoPaciente || curIndications?.patientPhone || curRecipe?.patientPhone || '';

  const textoRp = customOpts?.textoRp || curRecipe?.rp || curIndications?.medicationSchedule || '';
  const textoIndicaciones = customOpts?.textoIndicaciones || curIndications?.generalInstructions || curIndications?.dietAndRest || curIndications?.medicationSchedule || '';
  const selloBase64 = customOpts?.selloBase64 || docConfig?.selloImg || docConfig?.selloDigitalImg || docConfig?.signatureImg || '';

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
// 1. CONSTRUCTOR DE MENSAJE DE WHATSAPP
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
  const patient = (options.patientName || 'Carlos Pérez').trim();
  const doctor = (options.doctorName || 'Dr. Carlos Leal').trim();
  const specialty = (options.doctorSpecialty || 'Médico').trim();
  const date = options.dateStr || new Date().toLocaleDateString('es-VE');
  
  const rawRp = (options.rpText || '').trim();
  const rawIndications = (options.indicationsText || '').trim();

  let msg = `*RÉCIPE Y TRATAMIENTO MÉDICO OFICIAL* 🩺\n`;
  msg += `*Médico Tratante:* Dr(a). ${doctor} (${specialty})\n`;
  msg += `*Paciente:* ${patient}`;
  if (options.patientCI) {
    msg += ` | *C.I:* ${options.patientCI}`;
  }
  msg += ` | *Fecha:* ${date}\n\n`;

  msg += `*💊 FÁRMACOS Y TRATAMIENTO (Rp.):*\n`;
  if (rawRp) {
    msg += `${rawRp}\n\n`;
  } else {
    msg += `(Ver archivo PDF adjunto)\n\n`;
  }

  if (rawIndications && rawIndications !== rawRp) {
    msg += `*📋 INDICACIONES Y RECOMENDACIONES:*\n`;
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
// 2. DESCARGA DE PDF USANDO html2pdf.js CON #recibo-medico
// ==========================================
export async function exportElementAsPDF(
  element?: HTMLElement | null,
  rawFilename?: string,
  customDatos?: DatosRecipePDF
): Promise<boolean> {
  try {
    const datos = customDatos || extractDatosFromApp();
    const filename = rawFilename || buildDocumentPdfFilename('Récipe', datos.nombrePaciente, datos.fecha);

    let targetEl: HTMLElement | null = element || 
                   document.querySelector<HTMLElement>('#recipe-medico') ||
                   document.querySelector<HTMLElement>('#recibo-medico') || 
                   document.querySelector<HTMLElement>('.print-container') || 
                   document.querySelector<HTMLElement>('#indications-print-container') ||
                   document.querySelector<HTMLElement>('#recipe-quarter-print-container') ||
                   document.querySelector<HTMLElement>('#recipe-single-print-container');

    if (!targetEl && typeof document !== 'undefined') {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.width = '816px';
      fallbackDiv.style.backgroundColor = '#ffffff';
      fallbackDiv.style.padding = '32px';
      fallbackDiv.id = 'recibo-medico';
      fallbackDiv.className = 'print-container recipe-single-container';
      targetEl = fallbackDiv;
      targetEl.innerHTML = `
        <div style="border: 2px solid #1e3a8a; border-radius: 16px; padding: 24px; background: #fff;">
          <h2 style="color: #1e3a8a; text-align: center; margin: 0; font-size: 22px; font-weight: 900;">${(datos.nombreMedico || 'Dr. Carlos Leal').toUpperCase()}</h2>
          <p style="text-align: center; color: #475569; font-weight: 700; font-size: 14px; margin: 4px 0;">${datos.especialidad || 'Médico Especialista'} · MPPS: ${datos.mpps || '----'}</p>
          <hr style="border: 1px solid #1e3a8a; margin: 16px 0;" />
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; background: #f8fafc; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px;">
            <div><strong>Paciente:</strong> ${datos.nombrePaciente || 'Carlos Pérez'}</div>
            <div><strong>C.I.:</strong> ${datos.cedulaPaciente || 'V-00.000.000'}</div>
            <div><strong>Fecha:</strong> ${datos.fecha || new Date().toLocaleDateString('es-VE')}</div>
          </div>
          <div style="margin-bottom: 24px;">
            <h3 style="color: #1e3a8a; font-size: 14px; font-weight: 800; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Rp. / Tratamiento / Indicaciones</h3>
            <div style="font-size: 14px; color: #0f172a; white-space: pre-wrap; line-height: 1.6;">${datos.textoRp || datos.textoIndicaciones || 'Tratamiento prescrito...'}</div>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            ${datos.selloBase64 ? `<img src="${datos.selloBase64}" style="max-height: 70px; margin-bottom: 4px;" alt="Sello y Firma" />` : ''}
            <div style="border-top: 1px solid #475569; width: 200px; margin: 10px auto 4px auto;"></div>
            <p style="font-size: 11px; font-weight: 700; color: #475569; margin: 0;">Firma y Sello del Médico</p>
          </div>
          <div style="text-align: center; margin-top: 24px; font-size: 10px; color: #94a3b8;">
            Fecha de emisión: ${datos.fecha || new Date().toLocaleDateString('es-VE')} — Generado con Digital Medic
          </div>
        </div>
      `;
      document.body.appendChild(targetEl);
    }

    const getPdfRunner = () => {
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        return (window as any).html2pdf;
      }
      if (typeof html2pdf === 'function') return html2pdf;
      if ((html2pdf as any)?.default) return (html2pdf as any).default;
      return html2pdf;
    };

    const sanitizeClonedDocForPdf = (clonedDoc: Document) => {
      // 1. Remove all elements with .no-print
      clonedDoc.querySelectorAll('.no-print').forEach((el) => el.remove());

      // 2. Convert all textareas to high-fidelity readable pre-wrap text divs so no medications are cut off
      clonedDoc.querySelectorAll('textarea').forEach((ta) => {
        const div = clonedDoc.createElement('div');
        div.style.whiteSpace = 'pre-wrap';
        div.style.fontFamily = ta.style.fontFamily || 'inherit';
        div.style.fontSize = ta.style.fontSize || '13px';
        div.style.lineHeight = ta.style.lineHeight || '1.6';
        div.style.color = '#0f172a';
        div.style.fontWeight = '600';
        div.style.padding = '4px 0';
        div.style.width = '100%';
        div.textContent = ta.value || '';
        ta.parentNode?.replaceChild(div, ta);
      });
    };

    const isLandscape = targetEl?.id === 'recipe-indications-dual-sheet';

    const opt = {
      margin:       4,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        onclone: sanitizeClonedDocForPdf
      },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: isLandscape ? 'landscape' : 'portrait' }
    };

    const runner = getPdfRunner();
    await runner().from(targetEl).set(opt).save();

    if (targetEl && targetEl.parentNode === document.body && !element && !document.querySelector('#recipe-medico') && !document.querySelector('#recibo-medico')) {
      try { document.body.removeChild(targetEl); } catch (_) {}
    }

    return true;
  } catch (err) {
    console.error('[Digital Medic] html2pdf error:', err);
    window.print();
    return true;
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
    const datos = customDatos || extractDatosFromApp();
    let targetEl = targetElement || 
                   document.querySelector('#recipe-medico') || 
                   document.querySelector('#recibo-medico') || 
                   document.querySelector('[data-testid="recibo-medico"]') ||
                   document.querySelector('.print-container');
    if (!targetEl) return null;
    const isLandscape = targetEl?.id === 'recipe-indications-dual-sheet';
    const opt = {
      margin: 4,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        onclone: (clonedDoc: Document) => {
          clonedDoc.querySelectorAll('.no-print').forEach((el) => el.remove());
          clonedDoc.querySelectorAll('textarea').forEach((ta) => {
            const div = clonedDoc.createElement('div');
            div.style.whiteSpace = 'pre-wrap';
            div.style.fontFamily = ta.style.fontFamily || 'inherit';
            div.style.fontSize = ta.style.fontSize || '13px';
            div.style.lineHeight = ta.style.lineHeight || '1.6';
            div.style.color = '#0f172a';
            div.style.fontWeight = '600';
            div.style.padding = '4px 0';
            div.style.width = '100%';
            div.textContent = ta.value || '';
            ta.parentNode?.replaceChild(div, ta);
          });
        }
      },
      jsPDF: { unit: 'mm', format: 'letter', orientation: isLandscape ? 'landscape' : 'portrait' }
    };
    const getPdfRunner = () => {
      if (typeof window !== 'undefined' && (window as any).html2pdf) return (window as any).html2pdf;
      if (typeof html2pdf === 'function') return html2pdf;
      if ((html2pdf as any)?.default) return (html2pdf as any).default;
      return html2pdf;
    };
    const runner = getPdfRunner();
    const pdfWorker = runner().from(targetEl).set(opt).outputPdf('blob');
    return await pdfWorker;
  } catch (e) {
    console.error('[Digital Medic] generatePDFBlob error:', e);
    return null;
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
// 3. WHATSAPP & CLIP SHARING
// ==========================================
export async function compartirPDFAdjuntoWhatsApp(datos: DatosRecipePDF, targetElement?: HTMLElement | null) {
  const cleanPatient = (datos.nombrePaciente || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
  const nombreArchivo = buildDocumentPdfFilename('Récipe', datos.nombrePaciente, datos.fecha);

  try {
    await exportElementAsPDF(targetElement, nombreArchivo, datos);
  } catch (err) {
    console.warn('WhatsApp PDF export warning:', err);
  }

  showWhatsAppClipAlert('📎 Se ha descargado el archivo PDF oficial en su dispositivo. Por favor, pulse el clip en este chat y adjúntelo para su validez.');
  enviarWhatsAppDirectoNumero(datos, false);
}

export function enviarWhatsAppDirectoNumero(datos: DatosRecipePDF, descargarTambien = false) {
  if (descargarTambien) {
    const filename = buildDocumentPdfFilename('Récipe', datos.nombrePaciente, datos.fecha);
    exportElementAsPDF(null, filename, datos).catch(console.warn);
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
  docType: string = 'Récipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  const cleanP = (patientName || 'Carlos Pérez').trim();
  const cleanD = (docType || 'Récipe').trim();
  const cleanDate = (dateStr || new Date().toLocaleDateString('es-VE')).replace(/[/\\?%*:|"<>]/g, '-');
  return `${cleanD} - ${cleanP} - ${cleanDate}.pdf`.replace(/\s+/g, ' ');
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
    filename: rawFilename || buildDocumentPdfFilename('Récipe', datos.nombrePaciente, datos.fecha)
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
    textoIndicaciones: options.indications?.generalInstructions || options.indications?.medicationSchedule || options.indicationsNotes,
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
      window.dispatchEvent(new CustomEvent('whatsapp-clip-reminder', { detail: { message: msg } }));
    }
  } catch (_) {}
}
