import { ImageSourcePropType } from 'react-native';
import images from '../assets/images';

function extensionFromName(name?: string | null): string {
  if (!name) return '';
  const base = name.split('?')[0]?.split('/').pop() ?? name;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot + 1).toLowerCase();
}

function normalizeFileType(raw?: string | null): string {
  const t = (raw ?? '').toLowerCase().trim().replace(/^\./, '');
  if (!t) return '';
  if (t.includes('pdf')) return 'pdf';
  if (t.includes('spreadsheet') || t.includes('excel')) return 'xlsx';
  if (t.includes('word') || t.includes('document')) return 'doc';
  if (t.includes('image') || t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  return t;
}

function isImageExtension(ext: string): boolean {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'image'].includes(
    ext,
  );
}

function iconForExtension(ext: string): ImageSourcePropType {
  if (isImageExtension(ext)) {
    return images.gallery;
  }

  switch (ext) {
    case 'pdf':
      return images.helpdesk.pdf;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return images.helpdesk.xlsx;
    case 'doc':
    case 'docx':
    case 'txt':
      return images.helpdesk.docs;
    default:
      return images.helpdesk.docs;
  }
}

export function getPrescriptionFileDisplay(params: {
  fileName?: string | null;
  fileType?: string | null;
  fileUrl?: string | null;
}): { fileName: string; icon: ImageSourcePropType } {
  const fileName =
    params.fileName?.trim() ||
    params.fileUrl?.split('/').pop()?.split('?')[0] ||
    'Prescription file';

  const ext =
    extensionFromName(params.fileName) ||
    extensionFromName(params.fileUrl) ||
    normalizeFileType(params.fileType);

  return {
    fileName,
    icon: iconForExtension(ext),
  };
}
