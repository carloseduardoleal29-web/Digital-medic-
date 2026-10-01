/**
 * Shared document styling utilities for paper textures, frame borders, and font presets.
 */

export function getDocumentBorderStyle(
  borderStyle: string | undefined, 
  color: string = '#2563eb'
): string {
  switch (borderStyle) {
    case 'doble':
      return `4px double ${color}`;
    case 'fino':
      return `1px solid ${color}88`;
    case 'ninguno':
      return 'none';
    case 'elegante':
      return `3px double ${color}`;
    case 'ornamentado':
      return `3px solid ${color}`;
    case 'guilloche':
      return `4px ridge ${color}`;
    case 'marco-clinico':
      return `3px inset ${color}`;
    case 'solido':
    default:
      return `2px solid ${color}`;
  }
}

export function getPaperTextureClass(texture: string | undefined): string {
  switch (texture) {
    case 'verjurado':
      return 'texture-verjurado';
    case 'seguridad':
      return 'texture-seguridad';
    case 'lino':
      return 'texture-lino';
    case 'milimetrado':
      return 'texture-milimetrado';
    case 'filigrana':
      return 'texture-filigrana';
    case 'lisa':
    default:
      return 'texture-lisa';
  }
}
