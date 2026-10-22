import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  DIGITAL_MEDIC_OFFICIAL_LOGO_SVG 
} from '../data/defaultAssets';

export interface DatosRecipePDF {
  nombreMedico?: string;
  especialidad?: string;
  mpps?: string;
  cm?: string;
  institucion?: string;
  clinicaDireccion?: string;
  telefonoMedico?: string;
  emailMedico?: string;
  logoIzq?: string;
  logoDer?: string;
  primaryColor?: string;
  marcaAgua?: string;
  watermarkOpacity?: number;
  watermarkRotation?: number;
  selloBase64?: string;
  firmaBase64?: string;
  signatureTitle?: string;

  nombrePaciente?: string;
  cedulaPaciente?: string;
  edadPaciente?: string;
  fecha?: string;
  telefonoPaciente?: string;
  diagnostico?: string;

  // Récipe 1 (Mitad Izquierda)
  textoRp?: string;
  tituloRecipe1?: string;

  // Récipe 2 o Indicaciones (Mitad Derecha)
  textoIndicaciones?: string;
  textoRecipe2?: string;
  tituloRecipe2?: string;
}

export function safeFormatSrcUrl(src: string): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('data:image/svg+xml;utf8,')) {
    const rawSvg = trimmed.replace('data:image/svg+xml;utf8,', '');
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
  }
  if (trimmed.startsWith('data:image/svg+xml;utf-8,')) {
    const rawSvg = trimmed.replace('data:image/svg+xml;utf-8,', '');
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
  }
  return trimmed;
}

export function mountNativeLogoNode(
  container: HTMLElement | null,
  rawLogoVal: string | undefined,
  defaultSvg: string,
  altText: string,
  maxHeightPx: number = 64,
  maxWidthPx: number = 130
): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.minWidth = '48px';
  container.style.height = `${maxHeightPx}px`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  let val = (rawLogoVal && rawLogoVal.trim()) ? rawLogoVal.trim() : defaultSvg;
  if (!val) return;

  // Si es un bloque <svg...> </svg> crudo, usar innerHTML directamente en el contenedor
  if (val.toLowerCase().startsWith('<svg')) {
    container.innerHTML = val;
    return;
  }

  // Si viene una etiqueta completa <img src="..." />
  if (val.toLowerCase().startsWith('<img')) {
    const srcMatch = val.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      val = srcMatch[1].trim();
    }
  }

  // Crear elemento de imagen nativo del DOM con document.createElement('img')
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
  const nombreMedico = customOpts?.nombreMedico || docConfig?.doctorName || 'Dr. Carlos E. Leal S.';
  const especialidad = customOpts?.especialidad || docConfig?.specialty || 'Especialista en Anestesiología y Reanimación';
  const mpps = customOpts?.mpps || docConfig?.mpps || '94.228';
  const cm = customOpts?.cm || docConfig?.collegeNumber || docConfig?.ci || 'V15489288-1';
  const institucion = customOpts?.institucion || docConfig?.institution || '';
  const clinicaDireccion = customOpts?.clinicaDireccion || docConfig?.address || docConfig?.clinicAddress || '';
  const telefonoMedico = customOpts?.telefonoMedico || docConfig?.phone || '';
  const emailMedico = customOpts?.emailMedico || docConfig?.email || '';

  const logoIzq = customOpts?.logoIzq !== undefined ? customOpts.logoIzq : (docConfig?.logoIzq || DIGITAL_MEDIC_OFFICIAL_LOGO_SVG);
  const logoDer = customOpts?.logoDer !== undefined ? customOpts.logoDer : (docConfig?.logoDer || '');
  const marcaAgua = customOpts?.marcaAgua || docConfig?.marcaAgua || '';

  const selloBase64 = customOpts?.selloBase64 || docConfig?.selloImg || docConfig?.selloDigitalImg || '';
  const firmaBase64 = customOpts?.firmaBase64 || docConfig?.firmaImg || docConfig?.signatureImg || '';
  const signatureTitle = customOpts?.signatureTitle || docConfig?.signatureTitle || 'Firma y Sello del Médico Tratante';

  const nombrePaciente = customOpts?.nombrePaciente || curRecipe?.patientName || curIndications?.patientName || 'Carlos Leal';
  const cedulaPaciente = customOpts?.cedulaPaciente || curRecipe?.patientCI || curIndications?.patientCI || 'V-00.000.000';
  const edadPaciente = customOpts?.edadPaciente || curRecipe?.patientAge || curIndications?.patientAge || '—';
  const fecha = customOpts?.fecha || curRecipe?.date || curIndications?.date || new Date().toLocaleDateString('es-VE');
  const telefonoPaciente = customOpts?.telefonoPaciente || curRecipe?.patientPhone || curIndications?.patientPhone || '';
  const diagnostico = customOpts?.diagnostico || curRecipe?.diagnosis || curIndications?.diagnosis || '';

  const textoRp = customOpts?.textoRp || curRecipe?.rp || 'Prescripción médica facultativa.';

  let textoIndicaciones = customOpts?.textoIndicaciones || '';
  if (!textoIndicaciones && curIndications) {
    const parts = [
      curIndications.generalInstructions ? `INDICACIONES Y DOSIFICACIÓN:\n${curIndications.generalInstructions}` : '',
      curIndications.dietAndRest ? `RECOMENDACIONES / DIETA Y REPOSO:\n${curIndications.dietAndRest}` : '',
      curIndications.alarmSigns ? `SIGNOS DE ALARMA:\n${curIndications.alarmSigns}` : '',
      curIndications.nextAppointment ? `PRÓXIMA CITA: ${curIndications.nextAppointment}` : '',
    ].filter(Boolean);
    if (parts.length > 0) {
      textoIndicaciones = parts.join('\n\n');
    }
  }
  if (!textoIndicaciones && curRecipe?.indicationsNotes) {
    textoIndicaciones = curRecipe.indicationsNotes;
  }
  if (!textoIndicaciones && curRecipe2?.rp) {
    textoIndicaciones = curRecipe2.rp;
  }
  if (!textoIndicaciones) {
    textoIndicaciones = 'Cumplir las indicaciones según la posología especificada.';
  }

  return {
    nombreMedico,
    especialidad,
    mpps,
    cm,
    institucion,
    clinicaDireccion,
    telefonoMedico,
    emailMedico,
    logoIzq,
    logoDer,
    primaryColor,
    marcaAgua,
    selloBase64,
    firmaBase64,
    signatureTitle,
    nombrePaciente,
    cedulaPaciente,
    edadPaciente,
    fecha,
    telefonoPaciente,
    diagnostico,
    textoRp,
    textoIndicaciones,
  };
}

/**
 * Prepara y clona de forma idéntica un elemento DOM de la pantalla de la app (vista previa)
 * reemplazando inputs/textareas por textos planos estructurados y removiendo botones/herramientas no imprimibles.
 */
export function prepareClonedElementForCanvas(sourceEl: HTMLElement): HTMLElement {
  const clone = sourceEl.cloneNode(true) as HTMLElement;

  // 1. Remover botones de herramientas, badges de edición, iconos flotantes y elementos no-print
  const noPrintEls = clone.querySelectorAll('.no-print, button, svg.lucide-camera, [title*="editar"], [title*="Haga clic"], [title*="Arrastre"], .no-pdf');
  noPrintEls.forEach((el) => el.remove());

  // 2. Sincronizar e inyectar valores reales de los campos <input> del médico a texto plano <span>
  const origInputs = Array.from(sourceEl.querySelectorAll('input'));
  const cloneInputs = Array.from(clone.querySelectorAll('input'));
  origInputs.forEach((origInput, idx) => {
    const cloneInput = cloneInputs[idx];
    if (!cloneInput) return;

    const val = origInput.value !== undefined && origInput.value !== null ? origInput.value : (origInput.getAttribute('value') || '');
    const span = document.createElement('span');
    span.textContent = val;

    span.style.cssText = cloneInput.style.cssText;
    span.style.display = 'inline-block';
    span.style.minWidth = '16px';
    span.style.color = '#0f172a';
    span.style.fontWeight = 'bold';

    if (cloneInput.className.includes('border-b') || cloneInput.className.includes('border-dashed')) {
      span.style.borderBottom = '1px dashed #cbd5e1';
      span.style.paddingBottom = '1px';
    } else {
      span.style.border = 'none';
    }

    cloneInput.parentNode?.replaceChild(span, cloneInput);
  });

  // 3. Sincronizar e inyectar valores reales de los campos <textarea> del médico a texto plano <div>
  const origTextareas = Array.from(sourceEl.querySelectorAll('textarea'));
  const cloneTextareas = Array.from(clone.querySelectorAll('textarea'));
  origTextareas.forEach((origTa, idx) => {
    const cloneTa = cloneTextareas[idx];
    if (!cloneTa) return;

    const val = origTa.value !== undefined && origTa.value !== null ? origTa.value : (origTa.textContent || '');
    const div = document.createElement('div');
    div.textContent = val;

    div.style.cssText = cloneTa.style.cssText;
    div.style.whiteSpace = 'pre-wrap';
    div.style.display = 'block';
    div.style.width = '100%';
    div.style.height = 'auto';
    div.style.border = 'none';
    div.style.background = 'transparent';
    div.style.color = '#0f172a';
    div.style.wordBreak = 'break-word';

    cloneTa.parentNode?.replaceChild(div, cloneTa);
  });

  // 4. Limpiar atributos contenteditable y cajas de enfoque
  const editables = clone.querySelectorAll('[contenteditable]');
  editables.forEach((el) => {
    el.removeAttribute('contenteditable');
    (el as HTMLElement).style.outline = 'none';
    (el as HTMLElement).style.border = 'none';
  });

  // 5. Formatear URLs de imágenes de forma segura
  const imgs = clone.querySelectorAll('img');
  imgs.forEach((img) => {
    if (img.src) {
      img.src = safeFormatSrcUrl(img.src);
    }
  });

  // 6. Resetear sombras y márgenes externos para ajuste perfecto en hoja
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.position = 'relative';
  clone.style.width = '100%';
  clone.style.height = '100%';
  clone.style.boxSizing = 'border-box';

  return clone;
}

export async function saveOrOpenPdfFile(pdf: jsPDF, filename: string): Promise<boolean> {
  // Strategy 1: Standard jsPDF pdf.save()
  try {
    pdf.save(filename);
    return true;
  } catch (err1) {
    console.warn('pdf.save() failed, attempting blob anchor fallback:', err1);
  }

  // Strategy 2: Blob URL via created <a> element with download attribute
  try {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 10000);
    return true;
  } catch (err2) {
    console.warn('Blob anchor download failed, attempting window.open fallback:', err2);
  }

  // Strategy 3: Direct window.open or window.location for mobile browsers
  try {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const newWin = window.open(blobUrl, '_blank');
    if (!newWin) {
      window.location.href = blobUrl;
    }
    return true;
  } catch (err3) {
    console.error('All PDF download strategies failed:', err3);
    return false;
  }
}

/**
 * Función principal para generar el PDF Horizontal Carta definitivo a partir del Molde Oculto
 */
export async function generarPDFDefinitivo(
  customDatos?: Partial<DatosRecipePDF>,
  fileNameInput?: string,
  targetElement?: HTMLElement | null
): Promise<boolean> {
  if (isGeneratingPdfLock) return false;
  isGeneratingPdfLock = true;

  try {
    const datos = extractDatosFromApp(undefined, undefined, undefined, customDatos);

    let elemento = (targetElement && (targetElement.id === 'hidden-pdf-landscape-mold' || targetElement.id === 'lienzo-pdf-oculto'))
      ? targetElement
      : (document.getElementById('hidden-pdf-landscape-mold') || document.getElementById('lienzo-pdf-oculto'));
    if (!elemento) {
      elemento = document.createElement('div');
      elemento.id = 'hidden-pdf-landscape-mold';
      document.body.appendChild(elemento);
    }

    // Estilos CSS del molde de captura horizontal (1056x816px Landscape Letter, fixed detrás de la página)
    elemento.style.position = 'fixed';
    elemento.style.left = '0px';
    elemento.style.top = '0px';
    elemento.style.width = '1056px';
    elemento.style.minWidth = '1056px';
    elemento.style.maxWidth = '1056px';
    elemento.style.height = '816px';
    elemento.style.minHeight = '816px';
    elemento.style.maxHeight = '816px';
    elemento.style.backgroundColor = '#ffffff';
    elemento.style.zIndex = '-9999';
    elemento.style.pointerEvents = 'none';
    elemento.style.overflow = 'hidden';
    elemento.style.boxSizing = 'border-box';
    elemento.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    elemento.style.color = '#000000';
    if (!elemento.style.display || elemento.style.display === 'none') {
      elemento.style.display = 'flex';
      elemento.style.flexDirection = 'row';
    }

    // Si el elemento es #hidden-pdf-landscape-mold y ya contiene nodos clonados con getComputedStyle desde App.tsx
    if (elemento.id === 'hidden-pdf-landscape-mold' && elemento.children.length > 0 && (targetElement === elemento || targetElement?.id === 'hidden-pdf-landscape-mold')) {
      // Molde pre-clonado con réplica visual exacta listo para html2canvas
    } else {
      // Intentar ubicar el nodo DOM activo en pantalla que el médico estuvo editando en la vista previa
      const activeEl = (targetElement && targetElement !== elemento) ? targetElement : (
        document.getElementById('recipe-medico') || 
        document.getElementById('recibo-medico') || 
        document.querySelector('.recipe-single-container') ||
        document.querySelector('.print-container')
      );

      if (activeEl && activeEl instanceof HTMLElement && activeEl !== elemento) {
        elemento.innerHTML = '';

      const leftHalf = document.createElement('div');
      leftHalf.style.cssText = 'width: 50%; height: 100%; box-sizing: border-box; border-right: 1px dashed #cbd5e1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background-color: #ffffff;';

      const rightHalf = document.createElement('div');
      rightHalf.style.cssText = 'width: 50%; height: 100%; box-sizing: border-box; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background-color: #ffffff;';

      const leftClone = prepareClonedElementForCanvas(activeEl);
      leftHalf.appendChild(leftClone);

      const indicationsEl = document.getElementById('indicaciones-medicas') || document.querySelector('.indications-container');
      if (indicationsEl && indicationsEl instanceof HTMLElement && indicationsEl !== activeEl) {
        const rightClone = prepareClonedElementForCanvas(indicationsEl);
        rightHalf.appendChild(rightClone);
      } else {
        const rightClone = prepareClonedElementForCanvas(activeEl);
        rightHalf.appendChild(rightClone);
      }

      elemento.appendChild(leftHalf);
      elemento.appendChild(rightHalf);
    } else {
      // Plantilla espejo estructurada cuando no hay nodo DOM visible
      const doctorColor = datos.primaryColor || '#5A82CA';
      const docName = datos.nombreMedico || 'Dr. Carlos E. Leal S.';
      const docSpec = datos.especialidad || 'Especialista en Anestesiología y Reanimación';
      const docMPPS = datos.mpps || '94.228';
      const docRIF = datos.cm ? (datos.cm.toLowerCase().includes('rif') || datos.cm.toLowerCase().includes('c.i.') ? datos.cm : `RIF: ${datos.cm}`) : 'RIF: V15489288-1';

      const pName = datos.nombrePaciente || 'Carlos Leal';
      const pCI = datos.cedulaPaciente || 'S/C';
      const pAge = datos.edadPaciente || '—';
      const pDate = datos.fecha || new Date().toLocaleDateString('es-VE');
      const pPhone = datos.telefonoPaciente || '';
      const pDiag = datos.diagnostico || '';

      const rpContent = datos.textoRp || 'Prescripción médica facultativa.';
      const indContent = datos.textoIndicaciones || 'Cumplir indicaciones según posología.';
      const footerNotesText = `${datos.telefonoMedico ? `Tel: ${datos.telefonoMedico}` : ''}${datos.emailMedico ? ` · ${datos.emailMedico}` : ''}${datos.clinicaDireccion ? ` · ${datos.clinicaDireccion}` : ''}`.trim() || 'Digital Médic - Documento Médico Oficial';

      const renderHalfLayout = (
        logoIzqId: string,
        logoDerId: string,
        selloId: string,
        titleText: string,
        bodyText: string,
        isRightSide: boolean
      ) => `
        <div style="width: 50%; height: 100%; padding: 32px 36px; box-sizing: border-box; ${!isRightSide ? 'border-right: 1px dashed #cbd5e1;' : ''} display: flex; flex-direction: column; justify-content: space-between; background-color: #ffffff;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid ${doctorColor}; padding-bottom: 10px; margin-bottom: 14px;">
              <div id="${logoIzqId}" style="display: flex; align-items: center; justify-content: center; shrink: 0; min-width: 50px; min-height: 50px;"></div>
              <div style="text-align: center; flex: 1; padding: 0 8px;">
                ${datos.institucion ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 2px;">${datos.institucion}</div>` : ''}
                <h2 style="margin: 0; color: ${doctorColor}; font-size: 22px; font-weight: 900; letter-spacing: -0.3px; line-height: 1.2;">${docName}</h2>
                <h3 style="margin: 3px 0 2px 0; color: #2563eb; font-size: 14px; font-weight: 700;">${docSpec}</h3>
                <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #475569;">MPPS: ${docMPPS} | ${docRIF}</p>
              </div>
              <div id="${logoDerId}" style="display: flex; align-items: center; justify-content: center; shrink: 0; min-width: 50px; min-height: 50px;"></div>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); font-size: 12px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
                <div style="flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Paciente:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pName}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">C.I. / Doc:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pCI}</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Edad:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pAge}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Teléfono:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pPhone || '—'}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Fecha:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; text-align: right; padding-bottom: 1px;">${pDate}</span>
                </div>
              </div>
              ${pDiag ? `
              <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px; margin-top: 6px; border-top: 1px solid #e2e8f0;">
                <span style="font-weight: 800; color: #1e293b; shrink: 0;">Dx / Diagnóstico:</span>
                <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pDiag}</span>
              </div>` : ''}
            </div>

            <div style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="${!isRightSide ? `font-size: 24px; font-weight: 900; font-style: italic; font-family: 'Playfair Display', Georgia, serif; color: ${doctorColor};` : `font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${doctorColor};`}">
                  ${titleText}
                </span>
              </div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; min-height: 240px; box-sizing: border-box;">
                ${bodyText}
              </div>
            </div>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; width: 100%;">
            <div style="flex: 1; max-width: 58%; font-size: 10px; color: #334155; font-family: system-ui, sans-serif; line-height: 1.4;">
              <div style="font-size: 9.5px; color: #334155; font-weight: 500;">
                ${footerNotesText}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; shrink: 0; min-width: 180px; max-width: 260px;">
              <div id="${selloId}" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 8px; min-height: 55px; margin-bottom: 4px;"></div>
              <div style="width: 100%; border-top: 1px solid ${doctorColor}; padding-top: 4px; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
                ${datos.signatureTitle || 'Firma y Sello del Médico Tratante'}
              </div>
            </div>
          </div>
        </div>
      `;

      elemento.innerHTML = `
        ${renderHalfLayout('pdf-logo-izq-1', 'pdf-logo-der-1', 'pdf-sello-1', datos.tituloRecipe1 || 'Rp.', rpContent, false)}
        ${renderHalfLayout('pdf-logo-izq-2', 'pdf-logo-der-2', 'pdf-sello-2', datos.tituloRecipe2 || 'INDICACIONES Y POSOLOGÍA MÉDICA', indContent, true)}
      `;

      mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-1'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Logo Médico');
      mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-1'), datos.logoDer, '', 'Logo Secundario');
      mountNativeLogoNode(elemento.querySelector('#pdf-logo-izq-2'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Logo Médico');
      mountNativeLogoNode(elemento.querySelector('#pdf-logo-der-2'), datos.logoDer, '', 'Logo Secundario');

      mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-1'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      mountNativeStampAndSignatureNode(elemento.querySelector('#pdf-sello-2'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
    }
  }

    // Esperar 500ms para que el DOM termine de "pintar" los datos y las imágenes
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Renderizar lienzo con html2canvas y jsPDF (useCORS: true, allowTaint: false)
    const canvas = await html2canvas(elemento, { 
      scale: 2, 
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 1056,
      height: 816,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1056,
      windowHeight: 816
    });
    
    let imgData: string;
    try {
      imgData = canvas.toDataURL('image/png');
    } catch (dataUrlErr) {
      console.warn('canvas.toDataURL PNG failed, attempting JPEG fallback:', dataUrlErr);
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    }
    
    const pdf = new jsPDF({
      orientation: 'landscape', 
      unit: 'mm',
      format: 'letter' 
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 279.4, 215.9);

    // LÓGICA OBLIGATORIA DE NOMBRE DE ARCHIVO DINÁMICO (SIN GUIONES)
    let nombrePaciente = datos.nombrePaciente || "Carlos Leal";
    let nombreLimpio = nombrePaciente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (!nombreLimpio) nombreLimpio = "Carlos Leal";

    let fechaHoy = new Date();
    let dia = String(fechaHoy.getDate()).padStart(2, '0');
    let mes = String(fechaHoy.getMonth() + 1).padStart(2, '0');
    let anio = String(fechaHoy.getFullYear()).slice(-2);

    let nombreArchivo = fileNameInput || `${nombreLimpio} ${dia} ${mes} ${anio}.pdf`;
    if (!nombreArchivo.endsWith('.pdf')) nombreArchivo += '.pdf';

    return await saveOrOpenPdfFile(pdf, nombreArchivo);
  } catch (error) {
    console.error('Error generando PDF definitivo:', error);
    return false;
  } finally {
    isGeneratingPdfLock = false;
  }
}

/**
 * Wrapper de exportación principal
 */
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

    const activeEl = targetElement || 
      document.getElementById('recipe-medico') || 
      document.getElementById('recibo-medico') || 
      document.querySelector('.recipe-single-container') ||
      document.querySelector('.print-container');

    if (activeEl && activeEl instanceof HTMLElement) {
      elemento.innerHTML = '';

      const leftHalf = document.createElement('div');
      leftHalf.style.cssText = 'width: 50%; height: 100%; box-sizing: border-box; border-right: 1px dashed #cbd5e1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background-color: #ffffff;';

      const rightHalf = document.createElement('div');
      rightHalf.style.cssText = 'width: 50%; height: 100%; box-sizing: border-box; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background-color: #ffffff;';

      const leftClone = prepareClonedElementForCanvas(activeEl);
      leftHalf.appendChild(leftClone);

      const indicationsEl = document.getElementById('indicaciones-medicas') || document.querySelector('.indications-container');
      if (indicationsEl && indicationsEl instanceof HTMLElement && indicationsEl !== activeEl) {
        const rightClone = prepareClonedElementForCanvas(indicationsEl);
        rightHalf.appendChild(rightClone);
      } else {
        const rightClone = prepareClonedElementForCanvas(activeEl);
        rightHalf.appendChild(rightClone);
      }

      elemento.appendChild(leftHalf);
      elemento.appendChild(rightHalf);
    } else {
      const doctorColor = datos.primaryColor || '#5A82CA';
      const docName = datos.nombreMedico || 'Dr. Carlos E. Leal S.';
      const docSpec = datos.especialidad || 'Especialista en Anestesiología y Reanimación';
      const docMPPS = datos.mpps || '94.228';
      const docRIF = datos.cm ? (datos.cm.toLowerCase().includes('rif') || datos.cm.toLowerCase().includes('c.i.') ? datos.cm : `RIF: ${datos.cm}`) : 'RIF: V15489288-1';

      const pName = datos.nombrePaciente || 'Carlos Leal';
      const pCI = datos.cedulaPaciente || 'S/C';
      const pAge = datos.edadPaciente || '—';
      const pDate = datos.fecha || new Date().toLocaleDateString('es-VE');
      const pPhone = datos.telefonoPaciente || '';
      const pDiag = datos.diagnostico || '';

      const rpContent = datos.textoRp || 'Prescripción médica facultativa.';
      const indContent = datos.textoIndicaciones || 'Cumplir indicaciones según posología.';
      const footerNotesText = `${datos.telefonoMedico ? `Tel: ${datos.telefonoMedico}` : ''}${datos.emailMedico ? ` · ${datos.emailMedico}` : ''}${datos.clinicaDireccion ? ` · ${datos.clinicaDireccion}` : ''}`.trim() || 'Digital Médic - Documento Médico Oficial';

      const renderHalfLayout = (
        logoIzqId: string,
        logoDerId: string,
        selloId: string,
        titleText: string,
        bodyText: string,
        isRightSide: boolean
      ) => `
        <div style="width: 50%; height: 100%; padding: 32px 36px; box-sizing: border-box; ${!isRightSide ? 'border-right: 1px dashed #cbd5e1;' : ''} display: flex; flex-direction: column; justify-content: space-between; background-color: #ffffff;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 2px solid ${doctorColor}; padding-bottom: 10px; margin-bottom: 14px;">
              <div id="${logoIzqId}" style="display: flex; align-items: center; justify-content: center; shrink: 0; min-width: 50px; min-height: 50px;"></div>
              <div style="text-align: center; flex: 1; padding: 0 8px;">
                ${datos.institucion ? `<div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${doctorColor}; letter-spacing: 0.5px; margin-bottom: 2px;">${datos.institucion}</div>` : ''}
                <h2 style="margin: 0; color: ${doctorColor}; font-size: 22px; font-weight: 900; letter-spacing: -0.3px; line-height: 1.2;">${docName}</h2>
                <h3 style="margin: 3px 0 2px 0; color: #2563eb; font-size: 14px; font-weight: 700;">${docSpec}</h3>
                <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #475569;">MPPS: ${docMPPS} | ${docRIF}</p>
              </div>
              <div id="${logoDerId}" style="display: flex; align-items: center; justify-content: center; shrink: 0; min-width: 50px; min-height: 50px;"></div>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); font-size: 12px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
                <div style="flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Paciente:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pName}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">C.I. / Doc:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pCI}</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Edad:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pAge}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Teléfono:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pPhone || '—'}</span>
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 4px; min-width: 0;">
                  <span style="font-weight: 800; color: #1e293b; shrink: 0;">Fecha:</span>
                  <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; text-align: right; padding-bottom: 1px;">${pDate}</span>
                </div>
              </div>
              ${pDiag ? `
              <div style="display: flex; align-items: center; gap: 6px; padding-top: 6px; margin-top: 6px; border-top: 1px solid #e2e8f0;">
                <span style="font-weight: 800; color: #1e293b; shrink: 0;">Dx / Diagnóstico:</span>
                <span style="font-weight: 700; color: #0f172a; border-bottom: 1px dashed #cbd5e1; flex: 1; padding-bottom: 1px;">${pDiag}</span>
              </div>` : ''}
            </div>

            <div style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="${!isRightSide ? `font-size: 24px; font-weight: 900; font-style: italic; font-family: 'Playfair Display', Georgia, serif; color: ${doctorColor};` : `font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${doctorColor};`}">
                  ${titleText}
                </span>
              </div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; min-height: 240px; box-sizing: border-box;">
                ${bodyText}
              </div>
            </div>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; width: 100%;">
            <div style="flex: 1; max-width: 58%; font-size: 10px; color: #334155; font-family: system-ui, sans-serif; line-height: 1.4;">
              <div style="font-size: 9.5px; color: #334155; font-weight: 500;">
                ${footerNotesText}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; text-align: center; shrink: 0; min-width: 180px; max-width: 260px;">
              <div id="${selloId}" style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 8px; min-height: 55px; margin-bottom: 4px;"></div>
              <div style="width: 100%; border-top: 1px solid ${doctorColor}; padding-top: 4px; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.3px;">
                ${datos.signatureTitle || 'Firma y Sello del Médico Tratante'}
              </div>
            </div>
          </div>
        </div>
      `;

      elemento.innerHTML = `
        ${renderHalfLayout('blob-logo-izq-1', 'blob-logo-der-1', 'blob-sello-1', datos.tituloRecipe1 || 'Rp.', rpContent, false)}
        ${renderHalfLayout('blob-logo-izq-2', 'blob-logo-der-2', 'blob-sello-2', datos.tituloRecipe2 || 'INDICACIONES Y POSOLOGÍA MÉDICA', indContent, true)}
      `;

      mountNativeLogoNode(elemento.querySelector('#blob-logo-izq-1'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Logo Médico');
      mountNativeLogoNode(elemento.querySelector('#blob-logo-der-1'), datos.logoDer, '', 'Logo Secundario');
      mountNativeLogoNode(elemento.querySelector('#blob-logo-izq-2'), datos.logoIzq, DIGITAL_MEDIC_OFFICIAL_LOGO_SVG, 'Logo Médico');
      mountNativeLogoNode(elemento.querySelector('#blob-logo-der-2'), datos.logoDer, '', 'Logo Secundario');

      mountNativeStampAndSignatureNode(elemento.querySelector('#blob-sello-1'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
      mountNativeStampAndSignatureNode(elemento.querySelector('#blob-sello-2'), datos.selloBase64, datos.firmaBase64, 'Firma y Sello');
    }
    // Esperar 500ms para que el DOM termine de "pintar" los datos y las imágenes
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(elemento, { 
      scale: 2, 
      useCORS: true,
      allowTaint: false,
      windowWidth: 1056,
      logging: false
    });
    
    let imgData: string;
    try {
      imgData = canvas.toDataURL('image/png');
    } catch (_) {
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    }

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
  return `📋 *INDICACIONES Y TRATAMIENTO MÉDICO* 📋\n\n` +
    `👤 *Paciente:* ${opts.patientName || 'Paciente'}\n` +
    `🆔 *C.I.:* ${opts.patientCI || 'S/C'}\n` +
    `📅 *Fecha:* ${opts.dateStr || new Date().toLocaleDateString('es-VE')}\n` +
    `🩺 *Médico Tratante:* ${opts.doctorName || 'Dr. Carlos E. Leal S.'}\n\n` +
    `💊 *PRESCRIPCIÓN Y POSOLOGÍA:*\n${opts.rpText || opts.indicationsText || 'Ver récipe adjunto.'}\n\n` +
    ` Digital Médic`;
}

export function buildWhatsAppTreatmentMessage(opts: {
  doctorName?: string;
  documentType?: string;
  patientName?: string;
  treatmentDetails?: string;
}): string {
  return `📋 *${(opts.documentType || 'TRATAMIENTO MÉDICO').toUpperCase()}* 📋\n\n` +
    `👤 *Paciente:* ${opts.patientName || 'Paciente'}\n` +
    `🩺 *Médico:* ${opts.doctorName || 'Dr. Carlos E. Leal S.'}\n\n` +
    `💊 *INDICACIONES:*\n${opts.treatmentDetails || 'Ver documento adjunto.'}\n\n` +
    ` Digital Médic`;
}

export async function exportAndSendWhatsAppBusiness(options: any): Promise<boolean> {
  const datos = extractDatosFromApp(options.config, options.recipe, options.indications, {
    nombrePaciente: options.patientName,
    telefonoPaciente: options.patientPhone,
    nombreMedico: options.doctorName,
    textoRp: options.treatmentDetails || options.recipe?.rp,
    fecha: options.dateStr
  });
  await generarPDFDefinitivo(datos);
  showWhatsAppClipAlert('📎 Se ha descargado el PDF horizontal. Adjúntalo en el chat de WhatsApp.');
  
  let phone = (datos.telefonoPaciente || '').replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '58' + phone.substring(1);
  const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}` : `https://api.whatsapp.com/send`;
  window.open(waUrl, '_blank');
  return true;
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
