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

  return asciiClean || 'Documento_Medico';
}

/**
 * Genera un Blob PDF real a partir de un elemento HTML utilizando html2canvas + jsPDF.
 * - Resolución nítida en 2x (calidad de imprenta 200-300 DPI)
 * - Dimensiones exactas de hoja Carta (Letter: 215.9 x 279.4 mm)
 * - Soporte para documentos de 1 o múltiples páginas
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
    // 1. Capturar el elemento en canvas con alta resolución y fondos blancos
    const canvas = await html2canvas(element, {
      scale: 2, // 2x para nitidez profesional sin pixelado en textos y sellos
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      onclone: (_clonedDoc, clonedElement) => {
        // En el clon: normalizar zoom/transform a 100% para que no se exporte encogido
        clonedElement.style.transform = 'none';
        clonedElement.style.zoom = '1';
        clonedElement.style.margin = '0 auto';
        clonedElement.style.boxShadow = 'none';

        // Ocultar botones o elementos de interfaz marcados como no-print
        clonedElement.querySelectorAll('.no-print').forEach((el: any) => {
          el.style.display = 'none';
        });

        // Asegurar que inputs y textareas muestren su contenido claramente
        clonedElement.querySelectorAll('input').forEach((inputEl: any) => {
          if (inputEl.value) {
            inputEl.setAttribute('value', inputEl.value);
          }
        });
        clonedElement.querySelectorAll('textarea').forEach((ta: any) => {
          if (ta.value) {
            ta.textContent = ta.value;
          }
          ta.style.overflow = 'hidden';
          ta.style.resize = 'none';
        });
      },
    });

    // 2. Preparar el documento PDF en formato Carta (Letter)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Comprobar si es un documento explícitamente multi-página (Historia Clínica)
    const isMultiPageDocument = element.classList.contains('clinical-history-container') ||
      element.closest('.clinical-history-container') !== null;

    if (!isMultiPageDocument) {
      // DOCUMENTOS DE 1 SOLA HOJA (Récipe individual, Récipe 4 en 1, Informe Médico, Constancia de Reposo, Indicaciones)
      // Ajuste proporcional exacto (scale-to-fit) para que NUNCA se divida en 2 hojas ni se corte el pie de página
      const margin = 4; // Margen de seguridad de 4mm para bordes e impresión física
      const printableWidth = pageWidth - (margin * 2);
      const printableHeight = pageHeight - (margin * 2);

      const scaleWidth = printableWidth / canvas.width;
      const scaleHeight = printableHeight / canvas.height;
      const fitScale = Math.min(scaleWidth, scaleHeight);

      const finalWidth = canvas.width * fitScale;
      const finalHeight = canvas.height * fitScale;

      // Centrado exacto en la hoja carta
      const posX = margin + (printableWidth - finalWidth) / 2;
      const posY = margin + (printableHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');
      return pdf.output('blob');
    } else {
      // Documento multi-página extenso (ej: Historia Clínica con varios folios)
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

      return pdf.output('blob');
    }

    return pdf.output('blob');
  } catch (err) {
    console.error('[PDF Export Error]:', err);
    return null;
  }
}

/**
 * Función principal para exportar y DESCARGAR DIRECTAMENTE el PDF al dispositivo.
 * - Genera un archivo .pdf real y descarga automática en la carpeta de descargas del usuario.
 * - NO ejecuta window.print() (evitando el error "error running doc" en móviles e iframes).
 * - Totalmente compatible con celulares (Android / iPhone) y computadoras.
 */
export async function exportElementAsPDF(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf'
): Promise<boolean> {
  try {
    const baseFilename = sanitizeToAsciiFilename(rawFilename);
    const finalFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

    const blob = await generatePDFBlob(element);
    if (!blob) {
      // Si por alguna razón de entorno html2canvas no responde, intentar fallback seguro
      return fallbackNativePrintDownload(rawFilename);
    }

    // Disparar la descarga directa del archivo PDF
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = blobUrl;
    downloadLink.download = finalFilename;
    downloadLink.setAttribute('target', '_blank');

    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      try {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      } catch (_) {}
    }, 4000);

    return true;
  } catch (err) {
    console.error('[PDF Export Download Error]:', err);
    return fallbackNativePrintDownload(rawFilename);
  }
}

/**
 * Comparte el archivo PDF real utilizando la API Web Share nativa del sistema (Android / iOS / Navegadores modernos).
 * Permite adjuntar directamente el archivo .pdf a WhatsApp, Gmail o cualquier app del teléfono.
 */
export async function sharePDFViaWebShare(
  element: HTMLElement | null,
  rawFilename: string = 'Documento_Medico.pdf',
  shareTitle: string = 'Documento Médico Oficial',
  shareText: string = 'Hola, te envío un documento'
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
    }
  } catch (err) {
    console.warn('[WebShare API PDF Share Error]:', err);
  }
  return false;
}

/**
 * Fallback seguro únicamente en caso de falla extrema
 */
function fallbackNativePrintDownload(rawFilename: string): boolean {
  try {
    const originalTitle = document.title;
    const baseFilename = sanitizeToAsciiFilename(rawFilename);
    document.title = baseFilename;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
    return true;
  } catch (e) {
    console.error('[Print Fallback Failed]:', e);
    return false;
  }
}

/**
 * Descarga el documento como imagen PNG o JPEG de alta resolución
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
    }, 2000);

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
