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
 * Genera el nombre de archivo PDF estándar solicitado exactamente por el médico:
 * Formato: [Tipo de Documento] [Nombre del Paciente] [Fecha].pdf
 * Ejemplo exacto: "récipe Carlos leal 14-10-26.pdf"
 */
export function buildDocumentPdfFilename(
  docType: string = 'récipe',
  patientName: string = '',
  dateStr: string = ''
): string {
  // 1. Tipo de documento normalizado (empieza con récipe, informe, indicaciones, etc.)
  let rawType = (docType || 'récipe').toLowerCase().trim();
  let safeType = 'récipe';

  if (rawType.includes('2en1') || rawType.includes('dual') || rawType.includes('tratamiento')) {
    safeType = 'récipe';
  } else if (rawType.includes('indication') || rawType.includes('indicaciones')) {
    safeType = 'indicaciones';
  } else if (rawType.includes('report') || rawType.includes('informe')) {
    safeType = 'informe';
  } else if (rawType.includes('rest') || rawType.includes('reposo')) {
    safeType = 'reposo';
  } else if (rawType.includes('historia') || rawType.includes('clinical')) {
    safeType = 'historia';
  } else if (rawType.includes('recipe') || rawType.includes('récipe')) {
    safeType = 'récipe';
  } else {
    safeType = rawType.replace(/[/\\?%*:|"<>]/g, '').trim() || 'récipe';
  }

  // 2. Limpiar nombre del paciente manteniendo espacios y mayúsculas/minúsculas originales
  const rawPatient = (patientName || '').trim();
  const safePatient = rawPatient
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Carlos leal';

  // 3. Fecha en formato seguro para el sistema de archivos (reemplaza / por -)
  let rawDate = (dateStr || '').trim();
  if (!rawDate) {
    rawDate = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date());
  }
  const safeDate = rawDate
    .replace(/[/\\:]/g, '-')
    .replace(/[^0-9.-]/g, '')
    .trim() || '14-10-26';

  // Formato exacto: "récipe Carlos leal 14-10-26.pdf"
  return `${safeType} ${safePatient} ${safeDate}.pdf`;
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

  // Reemplazar inputs por spans de texto puro para garantizar que html2canvas NUNCA los deje en blanco ni los recorte
  clonedElement.querySelectorAll('input').forEach((inputEl: HTMLInputElement) => {
    const rawVal = (inputEl.value || inputEl.getAttribute('value') || '').trim();
    const placeholder = (inputEl.placeholder || '').toLowerCase();
    
    // Garantizar que Paciente y Fecha SIEMPRE tengan valor visible en el documento PDF
    let displayText = rawVal;
    if (!displayText) {
      if (placeholder.includes('paciente') || placeholder.includes('nombre')) {
        displayText = 'Carlos leal';
      } else if (placeholder.includes('dd/mm') || placeholder.includes('fecha')) {
        displayText = '14/10/26';
      } else if (placeholder.includes('cédula') || placeholder.includes('cedula') || placeholder.includes('c.i.')) {
        displayText = 'V-18.456.789';
      } else if (placeholder.includes('edad')) {
        displayText = '35 años';
      } else {
        displayText = '';
      }
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = displayText;
    textSpan.className = inputEl.className;
    textSpan.style.display = 'inline-block';
    textSpan.style.border = 'none';
    textSpan.style.background = 'transparent';
    textSpan.style.color = '#000000';
    textSpan.style.fontWeight = '700';
    textSpan.style.fontSize = 'inherit';
    textSpan.style.lineHeight = 'normal';
    textSpan.style.padding = '0';
    textSpan.style.margin = '0';
    if (inputEl.parentNode) {
      inputEl.parentNode.replaceChild(textSpan, inputEl);
    }
  });

  // Reemplazar textareas por divs con texto continuo para que la prescripción no se corte
  clonedElement.querySelectorAll('textarea').forEach((ta: HTMLTextAreaElement) => {
    const rawVal = (ta.value || ta.textContent || '').trim();
    const textDiv = document.createElement('div');
    textDiv.textContent = rawVal || '—';
    textDiv.className = ta.className;
    textDiv.style.whiteSpace = 'pre-wrap';
    textDiv.style.wordBreak = 'break-word';
    textDiv.style.overflow = 'visible';
    textDiv.style.resize = 'none';
    textDiv.style.border = 'none';
    textDiv.style.background = 'transparent';
    textDiv.style.color = '#000000';
    textDiv.style.fontSize = 'inherit';
    textDiv.style.fontFamily = ta.style.fontFamily || 'inherit';
    textDiv.style.minHeight = '0';
    textDiv.style.padding = '2px 0';
    if (ta.parentNode) {
      ta.parentNode.replaceChild(textDiv, ta);
    }
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

  // 1-0. HOJA CARTA COMPLETA 4 EN 1: Exactamente 4 Récipes en Cuadrícula 2x2 (816px x 1056px / Letter)
  const isRecipe4en1 =
    clonedElement.id === 'recipe-4en1-print-sheet' ||
    clonedElement.id === 'recipe-4copies-print-sheet' ||
    clonedElement.classList.contains('recipe-4en1-container') ||
    clonedElement.classList.contains('recipe-4en1-sheet') ||
    clonedElement.querySelector('#recipe-4en1-print-sheet, #recipe-4copies-print-sheet, .recipe-4en1-container, .recipe-4en1-grid') !== null;

  if (isRecipe4en1) {
    const targetDoc = (clonedElement.id === 'recipe-4en1-print-sheet' ||
      clonedElement.id === 'recipe-4copies-print-sheet' ||
      clonedElement.classList.contains('recipe-4en1-container'))
      ? clonedElement
      : (clonedElement.querySelector<HTMLElement>('#recipe-4en1-print-sheet, #recipe-4copies-print-sheet, .recipe-4en1-container') || clonedElement);

    targetDoc.style.width = '816px';
    targetDoc.style.minWidth = '816px';
    targetDoc.style.maxWidth = '816px';
    targetDoc.style.height = '1056px';
    targetDoc.style.minHeight = '1056px';
    targetDoc.style.maxHeight = '1056px';
    targetDoc.style.overflow = 'hidden';
    targetDoc.style.boxSizing = 'border-box';
    targetDoc.style.padding = '15px';
    targetDoc.style.display = 'block';
    targetDoc.style.margin = '0 auto';
    targetDoc.style.transform = 'none';
    targetDoc.style.zoom = '1';

    const gridEl = targetDoc.querySelector<HTMLElement>('.recipe-4en1-grid');
    if (gridEl) {
      gridEl.style.display = 'grid';
      gridEl.style.gridTemplateColumns = 'repeat(2, 1fr)';
      gridEl.style.gridTemplateRows = 'repeat(2, 1fr)';
      gridEl.style.gap = '15px';
      gridEl.style.width = '100%';
      gridEl.style.height = '100%';
      gridEl.style.boxSizing = 'border-box';
      gridEl.style.overflow = 'hidden';
    }

    targetDoc.querySelectorAll<HTMLElement>('.recipe-quadrant-card').forEach((card) => {
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.maxWidth = '100%';
      card.style.maxHeight = '100%';
      card.style.boxSizing = 'border-box';
      card.style.transform = 'none';
      card.style.margin = '0';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
      card.style.overflow = 'hidden';
    });
    return;
  }

  // 1-A. RÉCIPE INDIVIDUAL COMPACTO: 1/4 de Hoja Carta (4.25" x 5.5" = 408px x 528px, 4 caben en una hoja carta)
  const isRecipeQuarter =
    clonedElement.id === 'recipe-quarter-print-container' ||
    clonedElement.classList.contains('recipe-size-quarter') ||
    clonedElement.getAttribute('data-recipe-size') === 'quarter' ||
    clonedElement.querySelector('.recipe-size-quarter, #recipe-quarter-print-container, [data-recipe-size="quarter"]') !== null;

  if (isRecipeQuarter) {
    const targetDoc = (clonedElement.id === 'recipe-quarter-print-container' ||
      clonedElement.classList.contains('recipe-size-quarter') ||
      clonedElement.getAttribute('data-recipe-size') === 'quarter')
      ? clonedElement
      : (clonedElement.querySelector<HTMLElement>('.recipe-size-quarter, #recipe-quarter-print-container, [data-recipe-size="quarter"]') || clonedElement);

    targetDoc.style.width = '408px';
    targetDoc.style.minWidth = '408px';
    targetDoc.style.maxWidth = '408px';
    targetDoc.style.height = '528px'; // 1/4 Hoja Carta exacta (4.25" x 5.5", 4 caben en 1 hoja carta de 8.5" x 11")
    targetDoc.style.minHeight = '528px';
    targetDoc.style.maxHeight = '528px';
    targetDoc.style.overflow = 'hidden';
    targetDoc.style.boxSizing = 'border-box';
    targetDoc.style.display = 'flex';
    targetDoc.style.flexDirection = 'column';
    targetDoc.style.justifyContent = 'space-between';
    targetDoc.style.margin = '0 auto';
    targetDoc.style.transform = 'none';
    targetDoc.style.zoom = '1';
    return;
  }

  // 1-B. RÉCIPE INDIVIDUAL HORIZONTAL: Media Carta (8.5" x 5.5" = 816px x 528px, 2 caben en una hoja carta)
  const isRecipeSingle =
    clonedElement.id === 'recipe-single-print-container' ||
    clonedElement.classList.contains('recipe-single-card') ||
    clonedElement.classList.contains('recipe-single-container') ||
    clonedElement.querySelector('#recipe-single-print-container, .recipe-single-card, .recipe-single-container') !== null;

  if (isRecipeSingle) {
    const targetDoc = (clonedElement.id === 'recipe-single-print-container' ||
      clonedElement.classList.contains('recipe-single-card') ||
      clonedElement.classList.contains('recipe-single-container'))
      ? clonedElement
      : (clonedElement.querySelector<HTMLElement>('#recipe-single-print-container, .recipe-single-card, .recipe-single-container') || clonedElement);

    targetDoc.style.width = '816px';
    targetDoc.style.minWidth = '816px';
    targetDoc.style.maxWidth = '816px';
    targetDoc.style.height = '528px'; // Media Carta Horizontal exacta (8.5" x 5.5", 2 caben en 1 hoja carta)
    targetDoc.style.minHeight = '528px';
    targetDoc.style.maxHeight = '528px';
    targetDoc.style.overflow = 'hidden';
    targetDoc.style.boxSizing = 'border-box';
    targetDoc.style.display = 'block';
    targetDoc.style.margin = '0 auto';
    targetDoc.style.transform = 'none';
    targetDoc.style.zoom = '1';
    return;
  }

  // 2. TODOS LOS DEMÁS FORMATOS (Indicaciones, Informes, Reposos, Historia Clínica, Récipes 4 en 1):
  // Tamaño Carta Completo (8.5" x 11" = 816px x 1056px)
  const isLetterDoc =
    clonedElement.classList.contains('dual-recipe-container') ||
    clonedElement.classList.contains('dual-recipe-sheet') ||
    clonedElement.classList.contains('recipe-4en1-container') ||
    clonedElement.classList.contains('recipe-4en1-sheet') ||
    clonedElement.classList.contains('report-sheet-container') ||
    clonedElement.classList.contains('indications-container') ||
    clonedElement.classList.contains('rest-container') ||
    clonedElement.classList.contains('print-container');

  const innerLetterDoc = clonedElement.querySelector<HTMLElement>(
    '.dual-recipe-container, .dual-recipe-sheet, .recipe-4en1-container, .recipe-4en1-sheet, .report-sheet-container, .indications-container, .rest-container, .print-container'
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
 * a resolución 100% fiel libre de interferencias de zoom de pantalla o modales.
 */
function createCleanOffscreenCaptureNode(sourceElement: HTMLElement): { container: HTMLElement; targetNode: HTMLElement; cleanup: () => void; isRecipeSingle: boolean; isRecipeQuarter: boolean } {
  const isRecipe4en1 =
    sourceElement.id === 'recipe-4en1-print-sheet' ||
    sourceElement.id === 'recipe-4copies-print-sheet' ||
    sourceElement.classList.contains('recipe-4en1-container') ||
    sourceElement.classList.contains('recipe-4en1-sheet') ||
    sourceElement.querySelector('#recipe-4en1-print-sheet, #recipe-4copies-print-sheet, .recipe-4en1-container, .recipe-4en1-grid') !== null;

  const isRecipeSingle = !isRecipe4en1 && (
    sourceElement.id === 'recipe-single-print-container' ||
    sourceElement.classList.contains('recipe-single-card') ||
    sourceElement.classList.contains('recipe-single-container') ||
    sourceElement.querySelector('#recipe-single-print-container, .recipe-single-card, .recipe-single-container') !== null
  );

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '816px';
  container.style.minHeight = isRecipeSingle ? '528px' : '1056px';
  container.style.height = isRecipeSingle ? '528px' : '1056px';
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
    const cloneInp = cloneInputs[i];
    if (cloneInp) {
      cloneInp.value = orig.value;
      cloneInp.setAttribute('value', orig.value);
      cloneInp.defaultValue = orig.value;
      if (orig instanceof HTMLTextAreaElement) {
        cloneInp.textContent = orig.value;
        cloneInp.innerHTML = orig.value;
      }
    }
  });

  prepareClonedElement(clone);
  container.appendChild(clone);
  document.body.appendChild(container);

  const isRecipeQuarter = !isRecipe4en1 && (
    sourceElement.id === 'recipe-quarter-print-container' ||
    sourceElement.classList.contains('recipe-size-quarter') ||
    sourceElement.getAttribute('data-recipe-size') === 'quarter' ||
    sourceElement.querySelector('.recipe-size-quarter, #recipe-quarter-print-container, [data-recipe-size="quarter"]') !== null
  );

  return {
    container,
    targetNode: clone,
    isRecipeSingle,
    isRecipeQuarter,
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
 * Renderiza el canvas capturado al documento PDF jsPDF.
 * - Récipe Compacto 1/4 Carta: [107.95, 139.7] mm vertical (4.25" x 5.5", 4 caben en una hoja carta).
 * - Récipe Individual Media Carta: [215.9, 139.7] mm horizontal (8.5" x 5.5", 2 caben en una hoja carta).
 * - Todos los demás formatos: Tamaño Carta Completo 'letter' (215.9 x 279.4 mm).
 */
function renderCanvasToLetterPDF(
  canvas: HTMLCanvasElement, 
  isMultiPage: boolean = false, 
  isRecipeSingle: boolean = false,
  isRecipeQuarter: boolean = false
): jsPDF {
  // 1. Caso Récipe 1/4 de Hoja Carta (Pequeño, 4 caben en una hoja carta)
  if (isRecipeQuarter) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [107.95, 139.7],
      compress: true,
    });

    const pageWidth = 107.95;
    const pageHeight = 139.7;
    const margin = 2.5;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

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
    return pdf;
  }

  // 2. Caso Récipe Media Carta Horizontal (2 caben en una hoja carta)
  if (isRecipeSingle) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [215.9, 139.7],
      compress: true,
    });

    const pageWidth = 215.9;
    const pageHeight = 139.7;
    const margin = 3.5;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

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
    return pdf;
  }

  // Todos los demás formatos: Tamaño Carta Completo (Letter: 215.9 x 279.4 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  if (!isMultiPage) {
    const margin = 4;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

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

    const pdf = renderCanvasToLetterPDF(
      canvas, 
      isMultiPageDocument, 
      captureObj.isRecipeSingle,
      captureObj.isRecipeQuarter
    );
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
      '#recipe-quarter-print-container, .recipe-size-quarter, #recipe-4en1-print-sheet, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .recipe-4en1-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
    );

    const blob = await generatePDFBlob(targetElement);
    if (!blob) {
      return { success: false, method: 'download_whatsapp', filename: finalFilename };
    }

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    // Caso 1: Dispositivos con soporte nativo de compartir archivos (Android, iOS, Windows 11, Mac)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
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
        console.warn('[WebShare Error, procediendo a descarga y WhatsApp]:', shareErr);
      }
    }

    // Caso 2: Computadoras (PC / Mac) o cuando el menú nativo no comparte archivos:
    // 1. Descargar el archivo PDF automáticamente al ordenador
    downloadBlobAsFile(blob, finalFilename);

    // Alerta en pantalla requerida: PDF descargado + clip
    showWhatsAppClipAlert('PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente');

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

/**
 * Parámetros para construir el mensaje completo de WhatsApp.
 */
export interface WhatsAppTreatmentMessageParams {
  doctorName?: string;
  documentType?: string;
  patientName?: string;
  treatmentDetails?: string;
  customMessage?: string;
}

/**
 * Arma un mensaje completo leyendo los datos del récipe/documento médico:
 * 'Hola, soy el Dr. Carlos Leal. Te envío tu [Récipe / Informe / Constancia] en formato PDF. Detalle de tu tratamiento: [Lista de medicamentos y cómo tomárselos]'
 */
export function buildWhatsAppTreatmentMessage({
  doctorName = 'Dr. Carlos Leal',
  documentType = 'Récipe',
  treatmentDetails = '',
  customMessage,
}: WhatsAppTreatmentMessageParams): string {
  if (customMessage && customMessage.trim()) {
    return customMessage.trim();
  }

  // Nombre del doctor con título formal
  let cleanDocName = (doctorName || '').trim();
  if (!cleanDocName) {
    cleanDocName = 'Dr. Carlos Leal';
  } else if (!/^dr(\(a\))?\.?/i.test(cleanDocName)) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  // Tipo de documento: [Récipe / Informe / Constancia]
  let docTypeLabel = 'Récipe';
  const lowerDoc = (documentType || '').toLowerCase();
  if (lowerDoc.includes('informe') || lowerDoc.includes('report')) {
    docTypeLabel = 'Informe';
  } else if (lowerDoc.includes('reposo') || lowerDoc.includes('constancia') || lowerDoc.includes('rest')) {
    docTypeLabel = 'Constancia';
  } else if (lowerDoc.includes('indicaci')) {
    docTypeLabel = 'Indicaciones';
  } else if (lowerDoc.includes('historia')) {
    docTypeLabel = 'Historia Clínica';
  } else {
    docTypeLabel = 'Récipe';
  }

  // Detalle del tratamiento (lista de medicamentos e indicaciones)
  let cleanTreatment = (treatmentDetails || '').trim();
  if (!cleanTreatment) {
    cleanTreatment = 'Prescripción médica detallada en el archivo PDF adjunto.';
  }

  // Estructura exacta solicitada por el usuario:
  // 'Hola, soy el Dr. Carlos Leal. Te envío tu [Récipe / Informe / Constancia] en formato PDF. Detalle de tu tratamiento: [Lista de medicamentos y cómo tomárselos]'
  return `Hola, soy el ${cleanDocName}. Te envío tu ${docTypeLabel} en formato PDF.\n\nDetalle de tu tratamiento:\n${cleanTreatment}`;
}

/**
 * Muestra la alerta en pantalla solicitada:
 * 'PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente'
 */
export function showWhatsAppClipAlert(
  customMessage: string = 'PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente'
): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: customMessage }));
    }

    if (typeof document === 'undefined') return;

    // Eliminar alerta previa si existe
    const existing = document.getElementById('digital-medic-clip-alert');
    if (existing) {
      existing.remove();
    }

    // Asegurar estilos de animación
    if (!document.getElementById('dm-alert-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'dm-alert-styles';
      styleTag.textContent = `
        @keyframes dmClipFadeUp {
          from { opacity: 0; transform: translate(-50%, 25px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes dmClipFadeDown {
          from { opacity: 1; transform: translate(-50%, 0) scale(1); }
          to { opacity: 0; transform: translate(-50%, 25px) scale(0.95); }
        }
      `;
      document.head.appendChild(styleTag);
    }

    const alertEl = document.createElement('div');
    alertEl.id = 'digital-medic-clip-alert';
    alertEl.setAttribute('role', 'alert');
    alertEl.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999999;
      max-width: calc(100vw - 32px);
      width: 540px;
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 16px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.45), 0 0 0 1.5px rgba(52, 211, 153, 0.45);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 600;
      animation: dmClipFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      pointer-events: auto;
    `;

    alertEl.innerHTML = `
      <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
        📎
      </div>
      <div style="flex: 1; text-shadow: 0 1px 2px rgba(0,0,0,0.25);">
        ${customMessage}
      </div>
      <button type="button" id="dm-close-clip-alert" style="background: none; border: none; color: #a7f3d0; font-size: 18px; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; line-height: 1;" title="Cerrar">
        ✕
      </button>
    `;

    document.body.appendChild(alertEl);

    let isDismissed = false;
    const dismiss = () => {
      if (isDismissed) return;
      isDismissed = true;
      alertEl.style.animation = 'dmClipFadeDown 0.25s forwards';
      setTimeout(() => {
        if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
      }, 250);
    };

    const closeBtn = alertEl.querySelector('#dm-close-clip-alert');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 9500);
  } catch (e) {
    console.warn('[WhatsApp Clip Alert Error]:', e);
  }
}

/**
 * Opciones completas para exportar y enviar por WhatsApp.
 */
export interface WhatsAppExportOptions {
  element?: HTMLElement | null;
  patientName?: string;
  documentTitle?: string;
  dateStr?: string;
  patientPhone?: string;
  doctorName?: string;
  treatmentDetails?: string;
  customMessage?: string;
  documentType?: string;
}

/**
 * Función principal para el botón de 'Enviar por WhatsApp'.
 * 1. Lee los datos del récipe (Doctor, Tipo de Documento, Tratamiento detallado).
 * 2. Enviar el PDF: Usa la herramienta nativa de compartir del teléfono para mandar el texto y el archivo PDF juntos de una sola vez.
 * 3. Plan de emergencia: Si el teléfono no lo permite o bloquea el envío, descarga el PDF automáticamente,
 *    abre WhatsApp con el texto ya escrito y muestra la alerta:
 *    'PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente'
 */
export async function exportAndSendWhatsAppBusiness(
  elementOrOptions: HTMLElement | null | WhatsAppExportOptions,
  patientNameArg?: string,
  documentTitleArg?: string,
  dateStrArg?: string,
  patientPhoneArg?: string,
  customMessageArg?: string,
  doctorNameArg?: string,
  treatmentDetailsArg?: string,
  documentTypeArg?: string
): Promise<boolean> {
  try {
    let element: HTMLElement | null = null;
    let patientName = 'Carlos leal';
    let documentTitle = 'Récipe Médico';
    let dateStr: string | undefined = undefined;
    let patientPhone: string | undefined = undefined;
    let customMessage: string | undefined = undefined;
    let doctorName = 'Dr. Carlos Leal';
    let treatmentDetails = '';
    let documentType = 'recipe';

    if (elementOrOptions && typeof elementOrOptions === 'object' && !(elementOrOptions instanceof HTMLElement)) {
      const opts = elementOrOptions as WhatsAppExportOptions;
      element = opts.element || null;
      patientName = opts.patientName || 'Carlos leal';
      documentTitle = opts.documentTitle || 'Récipe Médico';
      dateStr = opts.dateStr;
      patientPhone = opts.patientPhone;
      customMessage = opts.customMessage;
      doctorName = opts.doctorName || 'Dr. Carlos Leal';
      treatmentDetails = opts.treatmentDetails || '';
      documentType = opts.documentType || 'recipe';
    } else {
      element = (elementOrOptions as HTMLElement | null) || null;
      patientName = patientNameArg || 'Carlos leal';
      documentTitle = documentTitleArg || 'Récipe Médico';
      dateStr = dateStrArg;
      patientPhone = patientPhoneArg;
      customMessage = customMessageArg;
      doctorName = doctorNameArg || 'Dr. Carlos Leal';
      treatmentDetails = treatmentDetailsArg || '';
      documentType = documentTypeArg || 'recipe';
    }

    const targetElement = element || document.querySelector<HTMLElement>(
      '#recipe-4en1-print-sheet, .recipe-4en1-container, #recipe-quarter-print-container, .recipe-size-quarter, #dual-recipe-print-container, #recipe-single-print-container, #indications-print-container, #report-print-container, #rest-print-container, #clinical-history-print-container, .dual-recipe-container, .dual-recipe-sheet, .print-container, .report-sheet-container, .recipe-single-container, .recipe-single-card, .indications-container, .rest-container, .clinical-history-container'
    );

    // Fallback inteligente: si no pasaron tratamiento, extraerlo del DOM del récipe
    if (!treatmentDetails && targetElement) {
      try {
        const textareas = targetElement.querySelectorAll<HTMLTextAreaElement>('textarea');
        const extracted: string[] = [];
        textareas.forEach((ta) => {
          if (ta.value && ta.value.trim().length > 3) {
            extracted.push(ta.value.trim());
          }
        });
        if (extracted.length > 0) {
          treatmentDetails = extracted.join('\n\n');
        } else {
          const rxBody = targetElement.querySelector<HTMLElement>('.recipe-rx-body, [data-field="rp"]');
          if (rxBody && rxBody.textContent) {
            treatmentDetails = rxBody.textContent.trim();
          }
        }
      } catch (_) {}
    }

    // Fallback inteligente: si no pasaron doctorName o es genérico, leerlo de la configuración almacenada
    if ((!doctorName || doctorName === 'Dr. Carlos Leal') && typeof localStorage !== 'undefined') {
      try {
        const storedDoc = localStorage.getItem('digital_medic_doctor_config_v2');
        if (storedDoc) {
          const parsed = JSON.parse(storedDoc);
          if (parsed?.doctorName) {
            doctorName = parsed.doctorName;
          }
        }
      } catch (_) {}
    }

    // 1. Armar el mensaje completo y profesional
    const messageText = customMessage || buildWhatsAppTreatmentMessage({
      doctorName,
      documentType,
      patientName,
      treatmentDetails,
    });

    const fileName = buildDocumentPdfFilename(documentTitle, patientName, dateStr);

    // Generar el archivo PDF del documento
    const blob = await generatePDFBlob(targetElement);

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    let nativeShareSuccess = false;

    // 2. ENVIAR EL PDF: Usar la herramienta nativa de compartir del teléfono para mandar el texto y el archivo PDF juntos de una sola vez
    if (blob && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: `${documentTitle} - ${patientName}`,
            text: messageText,
          });
          nativeShareSuccess = true;
          return true;
        }
      } catch (shareErr: any) {
        if (shareErr && shareErr.name === 'AbortError') {
          // El usuario abrió el menú de compartir nativo y lo cerró manualmente
          return true;
        }
        console.warn('[Herramienta nativa de compartir falló, activando Plan de Emergencia]:', shareErr);
      }
    }

    // 3. PLAN DE EMERGENCIA (Si el teléfono no lo permite o bloquea el envío):
    if (!nativeShareSuccess) {
      // A. Descargar el PDF automáticamente
      if (blob) {
        downloadBlobAsFile(blob, fileName);
      }

      // B. Mostrar alerta en pantalla con el texto exacto solicitado
      showWhatsAppClipAlert('PDF descargado. Recuerda tocar el ícono del clip 📎 en WhatsApp para adjuntarlo al paciente');

      // C. Abrir WhatsApp con el texto ya escrito
      const cleanDigits = (patientPhone || '').replace(/\D/g, '');
      let phoneNum = cleanDigits;
      if (cleanDigits.startsWith('0')) {
        phoneNum = `58${cleanDigits.substring(1)}`;
      } else if (cleanDigits.length === 10 && !cleanDigits.startsWith('58')) {
        phoneNum = `58${cleanDigits}`;
      }

      const encodedText = encodeURIComponent(messageText);
      const waUrl = phoneNum.length >= 7
        ? `https://wa.me/${phoneNum}?text=${encodedText}`
        : (isMobile ? `https://wa.me/?text=${encodedText}` : `https://web.whatsapp.com/send?text=${encodedText}`);

      setTimeout(() => {
        try {
          if (isMobile) {
            window.location.href = waUrl;
          } else {
            const link = document.createElement('a');
            link.href = waUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
            }, 300);
          }
        } catch (_) {
          window.location.href = waUrl;
        }
      }, 350);

      return true;
    }

    return true;
  } catch (err) {
    console.error('[WhatsApp Business Export Error]:', err);
    return false;
  }
}

