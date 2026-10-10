import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Sanitiza cualquier nombre de archivo a caracteres ASCII puros:
 * Elimina acentos/tildes (é -> e, ñ -> n, etc.), espacios y símbolos especiales
 * que provocan errores de Unicode o de codificación en navegadores y gestores de descarga.
 */
/**
 * Sanitiza un nombre de archivo para la descarga PDF:
 * Mantiene espacios, acentos y puntos para una lectura perfecta según requerimiento del usuario,
 * y elimina únicamente caracteres prohibidos por los sistemas de archivos (/ \ ? % * : | " < >).
 */
export function sanitizeToAsciiFilename(filename: string, defaultName: string = 'Documento_Medico.pdf'): string {
  if (!filename || typeof filename !== 'string') return defaultName;

  // Quitar extensión si ya existe
  const base = filename.replace(/\.pdf$/i, '');

  const clean = base
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return clean ? `${clean}.pdf` : defaultName;
}

/**
 * Genera el nombre de archivo PDF estándar solicitado por el médico:
 * Formato: [Nombre del Paciente]. [Fecha] [Tipo de Documento].pdf
 * Ejemplo: Carlos leal. 20-10-26 récipe.pdf
 */
export function buildDocumentPdfFilename(
  docType: string = 'récipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  // Limpiar nombre del paciente manteniendo espacios y mayúsculas/minúsculas originales
  const rawPatient = (patientName || 'Paciente').trim();
  const safePatient = rawPatient
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Paciente';

  // Fecha en formato seguro para el sistema de archivos (reemplaza / por -)
  const rawDate = dateStr || new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  const safeDate = rawDate
    .replace(/[/\\:]/g, '-')
    .replace(/[^0-9.-]/g, '')
    .trim() || 'Fecha';

  // Formatear el tipo de documento en español limpio
  let rawType = (docType || 'récipe').toLowerCase().trim();
  let safeType = 'récipe';

  if (rawType.includes('2en1') || rawType.includes('dual')) {
    safeType = 'récipe e indicaciones';
  } else if (rawType.includes('indication') || rawType.includes('indicaciones')) {
    safeType = 'indicaciones';
  } else if (rawType.includes('report') || rawType.includes('informe')) {
    safeType = 'informe médico';
  } else if (rawType.includes('rest') || rawType.includes('reposo')) {
    safeType = 'reposo médico';
  } else if (rawType.includes('historia') || rawType.includes('clinical')) {
    safeType = 'historia clínica';
  } else if (rawType.includes('recipe') || rawType.includes('récipe')) {
    safeType = 'récipe';
  } else {
    safeType = rawType.replace(/[/\\?%*:|"<>]/g, '').trim();
  }

  return `${safePatient}. ${safeDate} ${safeType}.pdf`;
}

/**
 * Prepara un clon del elemento para html2canvas asegurando que
 * todos los inputs, textareas y selects mantengan sus valores editados
 * y que los tamaños y transformaciones de pantalla no deformen la hoja carta.
 */
function prepareClonedElement(clonedElement: HTMLElement) {
  // Reset offsets, zoom and transforms on the element
  clonedElement.style.transform = 'none';
  clonedElement.style.zoom = '1';
  clonedElement.style.margin = '0 auto';
  clonedElement.style.boxShadow = 'none';
  clonedElement.style.position = 'relative';
  clonedElement.style.top = '0px';
  clonedElement.style.left = '0px';
  clonedElement.style.opacity = '1';
  clonedElement.style.visibility = 'visible';
  clonedElement.style.backgroundColor = clonedElement.style.backgroundColor || '#ffffff';

  // Ocultar botones o elementos de interfaz marcados como no-print
  clonedElement.querySelectorAll('.no-print').forEach((el: any) => {
    el.style.display = 'none';
  });

  // Asegurar que inputs y textareas muestren su contenido claramente
  clonedElement.querySelectorAll('input').forEach((inputEl: HTMLInputElement) => {
    if (inputEl.value) {
      inputEl.setAttribute('value', inputEl.value);
    }
  });

  clonedElement.querySelectorAll('textarea').forEach((ta: HTMLTextAreaElement) => {
    if (ta.value) {
      ta.textContent = ta.value;
    }
    ta.style.overflow = 'hidden';
    ta.style.resize = 'none';
  });

  // Convert raw SVG data URLs into safe base64 data URLs to prevent html2canvas blank taint errors
  clonedElement.querySelectorAll('img').forEach((img: HTMLImageElement) => {
    img.style.maxHeight = 'none';
    img.style.visibility = 'visible';
    img.style.opacity = '1';

    if (img.src && img.src.startsWith('data:image/svg+xml')) {
      if (img.src.includes('utf8,') || img.src.includes('<svg')) {
        try {
          const rawSvg = img.src.replace(/^data:image\/svg\+xml;?(utf8)?,?/, '');
          const decoded = rawSvg.startsWith('%') ? decodeURIComponent(rawSvg) : rawSvg;
          const base64Svg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(decoded)));
          img.src = base64Svg;
        } catch (e) {
          try {
            const rawSvg = img.src.replace(/^data:image\/svg\+xml;?(utf8)?,?/, '');
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(rawSvg)));
          } catch (_) {}
        }
      }
    }
  });

  // Estandarizar documentos de hoja carta a 816 x 1056 px (8.5 x 11 pulgadas exactas a 96 DPI)
  const isLetterDoc =
    clonedElement.classList.contains('dual-recipe-container') ||
    clonedElement.classList.contains('dual-recipe-sheet') ||
    clonedElement.classList.contains('recipe-4en1-container') ||
    clonedElement.classList.contains('recipe-4en1-sheet') ||
    clonedElement.classList.contains('report-sheet-container') ||
    clonedElement.classList.contains('indications-container') ||
    clonedElement.classList.contains('rest-container') ||
    clonedElement.classList.contains('recipe-single-container') ||
    clonedElement.classList.contains('recipe-single-card') ||
    clonedElement.classList.contains('print-container');

  const innerLetterDoc = clonedElement.querySelector<HTMLElement>(
    '.dual-recipe-container, .dual-recipe-sheet, .recipe-4en1-container, .recipe-4en1-sheet, .report-sheet-container, .indications-container, .rest-container, .recipe-single-container, .recipe-single-card, .print-container'
  );

  const targetDoc = isLetterDoc ? clonedElement : innerLetterDoc;

  if (targetDoc) {
    targetDoc.style.width = '816px';
    targetDoc.style.minWidth = '816px';
    targetDoc.style.maxWidth = '816px';
    targetDoc.style.height = '1056px';
    targetDoc.style.minHeight = '1056px';
    targetDoc.style.maxHeight = '1056px';
    targetDoc.style.overflow = 'hidden';
    targetDoc.style.boxSizing = 'border-box';
    targetDoc.style.display = 'block';
    targetDoc.style.margin = '0 auto';
    targetDoc.style.transform = 'none';
    targetDoc.style.zoom = '1';
  }
}

/**
 * Crea un contenedor fuera de pantalla garantizado para capturar el elemento
 * a resolución 100% fiel (816px x 1056px) libre de interferencias de zoom de pantalla o modales.
 */
function createCleanOffscreenCaptureNode(sourceElement: HTMLElement): { container: HTMLElement; targetNode: HTMLElement; cleanup: () => void } {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '816px';
  container.style.minHeight = '1056px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.visibility = 'visible';
  container.style.transform = 'none';
  container.style.zoom = '1';
  container.style.overflow = 'visible';
  container.style.display = 'block';

  // Clonar el nodo
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.classList.remove('hidden');
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.style.transform = 'none';
  clone.style.zoom = '1';
  clone.style.margin = '0 auto';
  clone.style.width = '816px';
  clone.style.maxWidth = '816px';
  clone.style.boxSizing = 'border-box';

  // Asegurar que todos los elementos hijos ocultos sean visibles en el clon
  clone.querySelectorAll('.hidden').forEach((el) => {
    el.classList.remove('hidden');
    (el as HTMLElement).style.display = 'block';
    (el as HTMLElement).style.visibility = 'visible';
  });

  // Sincronizar inputs y textareas
  const originalInputs = sourceElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  const cloneInputs = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  originalInputs.forEach((orig, i) => {
    if (cloneInputs[i]) {
      cloneInputs[i].value = orig.value;
      if (orig instanceof HTMLTextAreaElement) {
        cloneInputs[i].textContent = orig.value;
      }
    }
  });

  prepareClonedElement(clone);
  container.appendChild(clone);
  document.body.appendChild(container);

  return {
    container,
    targetNode: clone,
    cleanup: () => {
      try {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      } catch (_) {}
    }
  };
}

/**
 * Renderiza el canvas capturado a un documento PDF jsPDF
 * con márgenes seguros de 4.5 mm para que NUNCA se recorte ningún borde ni pie de página.
 */
function renderCanvasToLetterPDF(canvas: HTMLCanvasElement, isMultiPage: boolean = false): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  if (!isMultiPage) {
    // Margen seguro de 4.5 mm para que ninguna impresora física corte encabezados ni firmas
    const margin = 4.5;
    const contentWidth = pageWidth - (margin * 2); // 206.9 mm
    const contentHeight = pageHeight - (margin * 2); // 270.4 mm

    const imgRatio = canvas.width / canvas.height;
    const contentRatio = contentWidth / contentHeight;

    let renderW = contentWidth;
    let renderH = contentHeight;

    if (imgRatio > contentRatio) {
      renderW = contentWidth;
      renderH = contentWidth / imgRatio;
    } else {
      renderH = contentHeight;
      renderW = contentHeight * imgRatio;
    }

    const offsetX = margin + ((contentWidth - renderW) / 2);
    const offsetY = margin + ((contentHeight - renderH) / 2);

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
  } else {
    // Documento multi-página (Historia Clínica)
    const margin = 4;
    const contentWidth = pageWidth - (margin * 2);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 5) {
      position = -(imgHeight - heightLeft) + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);
    }
  }

  return pdf;
}

/**
 * Genera un Blob PDF de alta nitidez y velocidad, con protección contra recorte.
 * - Si hay múltiples récipes activos, genera 1 página completa por cada récipe.
 * - Si es informe médico, reposo o indicaciones, genera exactamente 1 página carta limpia sin desbordarse a la 2da hoja.
 */
export async function generatePDFBlob(
  targetElement: HTMLElement | null
): Promise<Blob | null> {
  // Priorizar el elemento enviado directamente
  let element = targetElement;

  // Si no hay elemento o no está montado en el DOM, buscar el contenedor activo correspondiente por especificidad
  if (!element || !document.body.contains(element)) {
    // Si estamos en la página de indicaciones (detectable por su ID o clase específica),
    // debemos priorizar ese contenedor sobre otros en la página.
    const isIndicationsPage = !!document.getElementById('indications-print-container');
    
    if (isIndicationsPage) {
      element = document.getElementById('indications-print-container');
    } else {
      const selector = '#recipe-4en1-print-sheet, #report-print-container, #rest-print-container, #clinical-history-print-container, .indications-container, .report-sheet-container, .rest-container, .clinical-history-container, .recipe-4en1-container, .recipe-single-card';
      element = document.querySelector<HTMLElement>(selector);
    }
  }

  if (!element) {
    console.error('[PDF Export] No se encontró el elemento contenedor para exportar.');
    return null;
  }

  // Usar nodo offscreen limpio para evitar problemas de zoom o display:none
  const captureObj = createCleanOffscreenCaptureNode(element);

  try {
    // Procesar multi-páginas únicamente si el elemento objetivo es explícitamente una hoja de récipes 4en1 con sub-hojas individuales
    const is4en1RecipeSheet =
      captureObj.targetNode.id === 'recipe-4en1-print-sheet' ||
      captureObj.targetNode.classList.contains('recipe-4en1-container') ||
      captureObj.targetNode.classList.contains('recipe-4en1-sheet');

    const subSheets = is4en1RecipeSheet
      ? captureObj.targetNode.querySelectorAll<HTMLElement>('.recipe-individual-sheet')
      : null;
    if (subSheets && subSheets.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
      const margin = 4.5;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      for (let i = 0; i < subSheets.length; i++) {
        const sheet = subSheets[i];
        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 8000,
        });

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          if (i > 0) pdf.addPage();
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const imgRatio = canvas.width / canvas.height;
          const contentRatio = contentWidth / contentHeight;

          let renderW = contentWidth;
          let renderH = contentHeight;

          if (imgRatio > contentRatio) {
            renderW = contentWidth;
            renderH = contentWidth / imgRatio;
          } else {
            renderH = contentHeight;
            renderW = contentHeight * imgRatio;
          }

          const offsetX = margin + ((contentWidth - renderW) / 2);
          const offsetY = margin + ((contentHeight - renderH) / 2);

          pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
        }
      }

      return pdf.output('blob');
    }

    const canvas = await html2canvas(captureObj.targetNode, {
      scale: 2, // 2x para nitidez cristalina en impresión
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 1600,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 8000,
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas renderizado vacío');
    }

    const isMultiPageDocument =
      element.classList.contains('clinical-history-container') ||
      element.closest('.clinical-history-container') !== null;

    const pdf = renderCanvasToLetterPDF(canvas, isMultiPageDocument);
    return pdf.output('blob');
  } catch (err) {
    console.error('[PDF Blob Generation Error]:', err);
    return null;
  } finally {
    captureObj.cleanup();
  }
}

/**
 * Descarga directamente un Blob como archivo en el disco del usuario con el nombre exacto.
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    } catch (_) {}
  }, 1200);
}

/**
 * Genera un PDF multi-página combinando múltiples elementos (por ejemplo, Récipe + Indicaciones en un solo PDF).
 */
export async function generateMultiplePDFBlob(
  elements: (HTMLElement | null)[]
): Promise<Blob | null> {
  const validElements = elements.filter((el): el is HTMLElement => Boolean(el));
  if (validElements.length === 0) {
    console.error('[PDF Export] No hay elementos válidos para exportar.');
    return null;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
  const margin = 4.5;
  const contentWidth = pageWidth - (margin * 2); // 206.9 mm
  const contentHeight = pageHeight - (margin * 2); // 270.4 mm

  for (let i = 0; i < validElements.length; i++) {
    const el = validElements[i];
    const captureObj = createCleanOffscreenCaptureNode(el);

    try {
      const canvas = await html2canvas(captureObj.targetNode, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: 1600,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 8000,
      });

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgRatio = canvas.width / canvas.height;
        const contentRatio = contentWidth / contentHeight;

        let renderW = contentWidth;
        let renderH = contentHeight;

        if (imgRatio > contentRatio) {
          renderW = contentWidth;
          renderH = contentWidth / imgRatio;
        } else {
          renderH = contentHeight;
          renderW = contentHeight * imgRatio;
        }

        const offsetX = margin + ((contentWidth - renderW) / 2);
        const offsetY = margin + ((contentHeight - renderH) / 2);

        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
      }
    } finally {
      captureObj.cleanup();
    }
  }

  return pdf.output('blob');
}

/**
 * Exporta y descarga directamente múltiples elementos como un solo PDF de varias páginas.
 */
export async function exportMultipleElementsAsPDF(
  elements: (HTMLElement | null)[],
  rawFilename: string = 'Tratamiento_Medico.pdf'
): Promise<boolean> {
  const baseFilename = sanitizeToAsciiFilename(rawFilename);
  const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

  try {
    const blob = await generateMultiplePDFBlob(elements);
    if (!blob) {
      throw new Error('No se pudo generar el Blob multi-página');
    }
    downloadBlobAsFile(blob, finalFilename);
    return true;
  } catch (err) {
    console.error('[PDF Export Multi Error]:', err);
    return false;
  }
}

/**
 * Función ultra eficiente para descargar el PDF DIRECTAMENTE al dispositivo.
 * Inicia la descarga automática de forma instantánea garantizando nombre con paciente y fecha.
 */
export async function exportElementAsPDF(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf'
): Promise<boolean> {
  const baseFilename = sanitizeToAsciiFilename(rawFilename);
  const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

  try {
    const blob = await generatePDFBlob(element);
    if (!blob) {
      throw new Error('No se pudo generar el Blob del PDF');
    }

    downloadBlobAsFile(blob, finalFilename);
    return true;
  } catch (err) {
    console.error('[PDF Export Download Error]:', err);
    try {
      window.print();
      return true;
    } catch (_) {
      return false;
    }
  }
}

/**
 * Comparte el archivo PDF real utilizando la API Web Share nativa del sistema (Android / iOS / Celular).
 * En computadoras de escritorio (PC/Mac) donde navigator.share no admite WhatsApp con archivos adjuntos:
 * Descarga automáticamente el archivo PDF al ordenador y abre WhatsApp Web para adjuntarlo en 1 clic.
 */
export async function sharePDFViaWebShare(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf',
  shareTitle: string = 'Documento Médico Oficial',
  shareText: string = 'Hola, le envío su documento médico oficial en PDF adjunto.',
  patientPhone?: string
): Promise<{ success: boolean; method: 'webshare' | 'download_whatsapp'; filename: string }> {
  const baseFilename = sanitizeToAsciiFilename(rawFilename);
  const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

  try {
    const targetElement = element || document.querySelector<HTMLElement>(
      '#recipe-4en1-print-sheet, .recipe-4en1-container, .print-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
    );

    const blob = await generatePDFBlob(targetElement);
    if (!blob) {
      return { success: false, method: 'download_whatsapp', filename: finalFilename };
    }

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    // Caso 1: Celulares (Android / iOS) con soporte nativo de navigator.share con archivos
    if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const pdfFile = new File([blob], finalFilename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: shareTitle,
            text: shareText,
          });
          return { success: true, method: 'webshare', filename: finalFilename };
        }
      } catch (shareErr: any) {
        if (shareErr && shareErr.name === 'AbortError') {
          // El usuario cerró el diálogo sin compartir
          return { success: false, method: 'webshare', filename: finalFilename };
        }
        console.warn('[WebShare Mobile Error, procediendo a descarga y WhatsApp]:', shareErr);
      }
    }

    // Caso 2: Computadoras (PC / Mac) o cuando el menú nativo no comparte archivos:
    // 1. Descargar el archivo PDF automáticamente al ordenador
    downloadBlobAsFile(blob, finalFilename);

    // 2. Abrir WhatsApp con el texto preparado de inmediato
    const cleanDigits = (patientPhone || '').replace(/\D/g, '');
    const encodedText = encodeURIComponent(shareText);
    const targetUrl = cleanDigits.length > 6
      ? `https://wa.me/${cleanDigits}?text=${encodedText}`
      : (isMobile ? `https://wa.me/?text=${encodedText}` : `https://web.whatsapp.com/send?text=${encodedText}`);

    try {
      if (isMobile) {
        // En móviles, la navegación directa siempre abre WhatsApp sin ser bloqueada por popups
        window.location.href = targetUrl;
      } else {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 300);
      }
    } catch (_) {
      try {
        window.open(targetUrl, '_blank');
      } catch (openErr) {
        console.warn('Could not open WhatsApp window:', openErr);
      }
    }

    return { success: true, method: 'download_whatsapp', filename: finalFilename };
  } catch (err: any) {
    console.warn('[WebShare API PDF Share Error]:', err);
    return { success: false, method: 'download_whatsapp', filename: finalFilename };
  }
}

/**
 * Genera el PDF y abre el menú nativo del teléfono (Web Share API) para compartirlo directamente en WhatsApp.
 */
export async function sharePDFToWhatsAppNative(
  element: HTMLElement | null,
  patientName: string = 'Paciente',
  documentTitle: string = 'Récipe Médico',
  customMessage?: string,
  dateStr?: string,
  patientPhone?: string
): Promise<boolean> {
  try {
    const fileName = buildDocumentPdfFilename(documentTitle, patientName, dateStr);
    const message = customMessage || `Hola ${patientName || 'paciente'}, le envío su ${documentTitle} oficial en formato PDF adjunto.`;

    const res = await sharePDFViaWebShare(
      element,
      fileName,
      `${documentTitle} - ${patientName || 'Paciente'}`,
      message,
      patientPhone
    );
    return res.success;
  } catch (err) {
    console.error('Error al compartir PDF a WhatsApp:', err);
    return false;
  }
}

/**
 * Descarga el documento como imagen PNG o JPEG
 */
export async function downloadElementAsImage(
  element: HTMLElement | null,
  filename: string,
  format: 'jpeg' | 'png' = 'png',
  quality = 0.95
): Promise<boolean> {
  const target = element || document.querySelector<HTMLElement>(
    '.print-container, .recipe-4en1-container, .recipe-single-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
  );

  if (!target) return false;

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const safeName = `${sanitizeToAsciiFilename(filename)}.${ext}`;

    const dataUrl = canvas.toDataURL(mime, quality);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch (_) {}
    }, 1000);

    return true;
  } catch (err) {
    console.error('Error al exportar imagen:', err);
    return false;
  }
}

export async function getElementImageBlob(
  element: HTMLElement | null,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<Blob | null> {
  const target = element || document.querySelector<HTMLElement>(
    '.print-container, .recipe-4en1-container, .recipe-single-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
  );

  if (!target) return null;

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.95
      );
    });
  } catch (err) {
    console.error('Error al generar blob de imagen:', err);
    return null;
  }
}
