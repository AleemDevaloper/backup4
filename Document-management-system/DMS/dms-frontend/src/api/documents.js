import { apiRequest } from './client';

function appendIfPresent(formData, key, value) {
  if (value === undefined) return;

  if (value === null || value === '') {
    formData.append(key, '');
    return;
  }

  if (Array.isArray(value)) {
    formData.append(key, value.join(','));
    return;
  }

  formData.append(key, value);
}

function toDocumentFormData(data = {}) {
  const formData = new FormData();

  appendIfPresent(formData, 'name', data.name);
  appendIfPresent(formData, 'description', data.description);
  appendIfPresent(formData, 'folderName', data.folderName);
  appendIfPresent(formData, 'tags', data.tags);
  appendIfPresent(formData, 'isFavorite', data.isFavorite);
  appendIfPresent(formData, 'isPinned', data.isPinned);
  appendIfPresent(formData, 'isShared', data.isShared);
  appendIfPresent(formData, 'inTrash', data.inTrash);
  appendIfPresent(formData, 'publicShareExpiresAt', data.publicShareExpiresAt);
  appendIfPresent(formData, 'allowPublicDownload', data.allowPublicDownload);

  if (data.file instanceof File) {
    formData.append('file', data.file);
  }

  return formData;
}

export async function listDocuments(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return apiRequest(`/api/v1/documents${query.toString() ? `?${query.toString()}` : ''}`);
}

export async function getDocument(id) {
  const res = await apiRequest(`/api/v1/documents/${id}`);
  return res.data;
}

export async function createDocument(data) {
  const res = await apiRequest('/api/v1/documents', {
    method: 'POST',
    body: toDocumentFormData(data),
  });

  return res.data;
}

export async function updateDocumentRequest(id, data) {
  const formData = toDocumentFormData(data);
  formData.append('_method', 'PATCH');

  const res = await apiRequest(`/api/v1/documents/${id}`, {
    method: 'POST',
    body: formData,
  });

  return res.data;
}

export async function deleteDocumentRequest(id, force = false) {
  return apiRequest(`/api/v1/documents/${id}${force ? '?force=1' : ''}`, {
    method: 'DELETE',
  });
}

export async function restoreDocumentRequest(id) {
  const res = await apiRequest(`/api/v1/documents/${id}/restore`, { method: 'POST' });
  return res.data;
}

export async function bulkDocuments(action, ids) {
  return apiRequest('/api/v1/documents/bulk', {
    method: 'POST',
    body: { action, ids },
  });
}

export async function shareDocumentRequest(id, payload) {
  const res = await apiRequest(`/api/v1/documents/${id}/share`, {
    method: 'POST',
    body: payload,
  });

  return res.data;
}

function getDownloadFilenameFromHeaders(headers, fallback = 'document-file') {
  const disposition = headers.get('content-disposition') || '';
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || fallback;
}

export async function downloadDocument(id, fallbackName = 'document-file') {
  const { blob, headers } = await apiRequest(`/api/v1/documents/download/${id}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getDownloadFilenameFromHeaders(headers, fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
