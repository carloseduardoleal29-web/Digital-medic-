import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Sanitiza cualquier nombre de archivo a caracteres ASCII puros:
 * Elimina acentos/tildes (é -> e, ñ -> n, etc.), espacios y símbolos especiales
 * que provocan errores de Unicode o de codificación en navegadores y gestores de descarga.
 */
export function sanitizeToAsciiFilename(filename: string, defaultName: string = 'Documento_Medico'): string {
  if (!filename || typeof filename !== 'string') return defaultName;

  // Quitar extensión si ya existe
  const base = filename.replace(/\.pdf$/i, '');

  // Normalizar Unicode y eliminar marcas diacríticas / acentos
  const asciiClean = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Caracteres seguros únicamente
    .replace(/_+/g, '_') // Colapsar guiones bajos repetidos
    .replace(/^_+|_+$/g, ''); // Quitar guiones al inicio o final

  return asciiClean || defaultName;
}

/**
 * Prepara un clon del elemento para html2canvas asegurando que
 * todos los inputs, textareas y selects mantengan sus valores editados.
 */
function prepareClonedElement(clonedElement: HTMLElement) {
  // Ajustar transformaciones y sombras para que no alteren las proporciones del canvas
  clonedElement.style.transform = 'none';
  clonedElement.style.zoom = '1';
  clonedElement.style.margin = '0 auto';
  clonedElement.style.boxShadow = 'none';

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

  // Estandarizar documentos de hoja carta a 816 x 1056 px (8.5 x 11 pulgadas exactas a 96 DPI)
  const isLetterDoc =
    clonedElement.classList.contains('recipe-4en1-container') ||
    clonedElement.classList.contains('report-sheet-container') ||
    clonedElement.classList.contains('indications-container') ||
    clonedElement.classList.contains('rest-container') ||
    clonedElement.classList.contains('recipe-single-container');

  if (isLetterDoc) {
    clonedElement.style.width = '816px';
    clonedElement.style.minWidth = '816px';
    clonedElement.style.maxWidth = '816px';
    clonedElement.style.height = '1056px';
    clonedElement.style.minHeight = '1056px';
    clonedElement.style.maxHeight = '1056px';
    clonedElement.style.boxSizing = 'border-box';
    clonedElement.style.display = 'block';
  }
}

/**
 * Genera un Blob PDF de alta nitidez y velocidad.
 */
export async function generatePDFBlob(
  targetElement: HTMLElement | null
): Promise<Blob | null> {
  const element = targetElement || document.querySelector<HTMLElement>(
    '.print-container, .recipe-4en1-container, .recipe-single-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
  );

  if (!element) {
    console.error('[PDF Export] No se encontró el elemento contenedor para exportar.');
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x para nitidez cristalina en impresión
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      onclone: (_clonedDoc, clonedElement) => {
        prepareClonedElement(clonedElement);
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const isMultiPageDocument =
      element.classList.contains('clinical-history-container') ||
      element.closest('.clinical-history-container') !== null;

    if (!isMultiPageDocument) {
      // Documentos de 1 hoja carta (Récipes, Informe, Reposo, Indicaciones)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    } else {
      // Documento multi-página
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    return pdf.output('blob');
  } catch (err) {
    console.error('[PDF Blob Generation Error]:', err);
    return null;
  }
}

/**
 * Función ultra eficiente para descargar el PDF DIRECTAMENTE al dispositivo.
 * Inicia la descarga automática de forma instantánea sin abrir pestañas innecesarias ni recargar la página.
 */
export async function exportElementAsPDF(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf'
): Promise<boolean> {
  const target = element || document.querySelector<HTMLElement>(
    '.print-container, .recipe-4en1-container, .recipe-single-container, .report-sheet-container, .indications-container, .rest-container, .clinical-history-container'
  );

  if (!target) {
    console.error('[PDF Export] No se encontró el elemento objetivo para descargar.');
    return false;
  }

  try {
    const baseFilename = sanitizeToAsciiFilename(rawFilename);
    const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      onclone: (_clonedDoc, clonedElement) => {
        prepareClonedElement(clonedElement);
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const isMultiPageDocument =
      target.classList.contains('clinical-history-container') ||
      target.closest('.clinical-history-container') !== null;

    if (!isMultiPageDocument) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    } else {
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    // Convertir a Blob e invocar la descarga directa por elemento <a> nativo
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (_) {}
    }, 1000);

    return true;
  } catch (err) {
    console.error('[PDF Export Download Error]:', err);
    // Fallback secundario si html2canvas falla: guardar mediante jsPDF directo
    try {
      const baseFilename = sanitizeToAsciiFilename(rawFilename);
      const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;
      const fallbackPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      fallbackPdf.save(finalFilename);
      return true;
    } catch (_) {
      return false;
    }
  }
}

/**
 * Comparte el archivo PDF real utilizando la API Web Share nativa del sistema (Android / iOS / Navegadores modernos).
 */
export async function sharePDFViaWebShare(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf',
  shareTitle: string = 'Documento Médico Oficial',
  shareText: string = 'Hola, le envío su documento médico oficial.'
): Promise<boolean> {
  try {
    const baseFilename = sanitizeToAsciiFilename(rawFilename);
    const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

    const blob = await generatePDFBlob(element);
    if (!blob) return false;

    const pdfFile = new File([blob], finalFilename, { type: 'application/pdf' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: shareTitle,
        text: shareText,
      });
      return true;
    } else {
      // Fallback: Descargar el PDF directamente
      return await exportElementAsPDF(element, finalFilename);
    }
  } catch (err) {
    console.warn('[WebShare API PDF Share Error]:', err);
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
