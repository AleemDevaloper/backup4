export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'webp', 'txt'];

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileExtension = (filename = '') => {
  const segments = filename.split('.');
  return segments.length > 1 ? segments.pop().toLowerCase() : '';
};

export const normalizeDocumentType = (type = '') => {
  const normalized = type.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'image'].includes(normalized)) return 'IMG';
  if (normalized === 'pdf') return 'PDF';
  if (['doc', 'docx'].includes(normalized)) return 'DOC';
  if (['xls', 'xlsx', 'csv'].includes(normalized)) return 'SHEET';
  if (['ppt', 'pptx'].includes(normalized)) return 'SLIDE';
  if (normalized === 'txt') return 'TXT';
  return normalized ? normalized.toUpperCase() : 'FILE';
};

export const getTypeTheme = (type = '') => {
  const normalized = normalizeDocumentType(type);
  if (normalized === 'PDF') return 'danger';
  if (normalized === 'IMG') return 'success';
  if (normalized === 'DOC') return 'primary';
  if (normalized === 'SHEET') return 'warning';
  return 'secondary';
};

export const isImage = (type = '') => ['IMG', 'IMAGE'].includes(normalizeDocumentType(type));
export const isPdf = (type = '') => normalizeDocumentType(type) === 'PDF';
export const isDocument = (type = '') => ['DOC', 'TXT', 'SHEET', 'SLIDE'].includes(normalizeDocumentType(type));

export const validateFiles = (files) => {
  const accepted = [];
  const rejected = [];

  Array.from(files || []).forEach((file) => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      rejected.push(`${file.name}: unsupported file type`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      rejected.push(`${file.name}: exceeds 15 MB limit`);
      return;
    }

    accepted.push(file);
  });

  return { accepted, rejected };
};

export const getPreviewPlaceholder = (doc) => {
  const type = normalizeDocumentType(doc.type);
  if (type === 'PDF') return 'PDF preview is ready for review.';
  if (type === 'IMG') return 'Image preview is ready.';
  if (type === 'DOC') return 'Document preview shows a text summary.';
  if (type === 'SHEET') return 'Spreadsheet preview includes key worksheet details.';
  return 'Preview is available for this document.';
};
