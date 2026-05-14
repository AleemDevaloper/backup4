import React, { useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowUpFromBracket,
  faBolt,
  faCheckSquare,
  faClockRotateLeft,
  faCompress,
  faDownload,
  faExpand,
  faEye,
  faFileAlt,
  faFilter,
  faFolderOpen,
  faGrip,
  faLink,
  faList,
  faMagnifyingGlass,
  faMinus,
  faPen,
  faPlus,
  faShareNodes,
  faSquare,
  faStar,
  faTag,
  faThumbTack,
  faTrash,
  faTrashArrowUp,
  faUpDownLeftRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { useUpload } from '../../hooks/useUpload';
import { downloadDocument } from '../../api/documents';
import {
  formatBytes,
  getPreviewPlaceholder,
  getTypeTheme,
  isImage,
  isPdf,
  normalizeDocumentType,
} from '../../utils/fileHelpers';
import { formatDate, formatDateTime } from '../../utils/formatDate';

const categoryConfig = {
  my: { label: 'My Documents', empty: 'No personal documents match this view.' },
  shared: { label: 'Shared with Me', empty: 'Nothing has been shared into this workspace yet.' },
  favorites: { label: 'Favorites', empty: 'Favorite documents will appear here.' },
  trash: { label: 'Trash', empty: 'Trash is empty right now.' },
};

const sortOptions = [
  { value: 'modified-desc', label: 'Latest modified' },
  { value: 'modified-asc', label: 'Oldest modified' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'size-desc', label: 'Largest size' },
  { value: 'size-asc', label: 'Smallest size' },
];

const defaultFilters = {
  type: 'all',
  dateFrom: '',
  dateTo: '',
  minSize: '',
  maxSize: '',
};

const highlightMatch = (text, query) => {
  if (!query.trim()) return text;

  const parts = String(text).split(new RegExp(`(${query})`, 'ig'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part
  );
};

const SkeletonCard = () => (
  <div className="documents-card documents-card--skeleton">
    <div className="documents-skeleton documents-skeleton--sm mb-3" />
    <div className="documents-skeleton documents-skeleton--lg mb-2" />
    <div className="documents-skeleton documents-skeleton--md mb-4" />
    <div className="documents-skeleton documents-skeleton--sm" />
  </div>
);

const DocumentsWorkspace = () => {
  const {
    currentCategory,
    currentFolder,
    currentUser,
    documents,
    documentsMeta,
    documentsLoading,
    folders,
    selectedDocument,
    searchQuery,
    setCurrentFolder,
    setCurrentCategory,
    setSearchQuery,
    setSelectedDocument,
    viewMode,
    setViewMode,
    moveToTrash,
    restoreDocument,
    restoreAllDocuments,
    deleteDocument,
    renameDocument,
    toggleFavorite,
    togglePinned,
    shareDocument,
    addDocumentTag,
    moveDocumentToFolder,
    runBulkAction,
    pushRecentSearch,
  } = useApp();
  const { uploadFiles, uploading, queue, errors, cancelUpload, togglePauseUpload, resetUploadState } = useUpload();
  const fileInputRef = useRef(null);
  const [sortBy, setSortBy] = useState('modified-desc');
  const [filters, setFilters] = useState(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [shareValue, setShareValue] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [linkExpiryDays, setLinkExpiryDays] = useState(7);
  const [allowPublicDownload, setAllowPublicDownload] = useState(true);
  const [detailsTab, setDetailsTab] = useState('details');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inlineName, setInlineName] = useState('');
  const [draggingDocumentId, setDraggingDocumentId] = useState(null);

  const categoryDocuments = useMemo(() => {
    let baseDocuments = documents;

    if (currentCategory === 'shared') baseDocuments = documents.filter((doc) => doc.isShared && !doc.isTrash);
    else if (currentCategory === 'favorites') baseDocuments = documents.filter((doc) => doc.isFavorite && !doc.isTrash);
    else if (currentCategory === 'trash') baseDocuments = documents.filter((doc) => doc.isTrash);
    else baseDocuments = documents.filter((doc) => !doc.isTrash && (!currentUser || doc.ownerId === currentUser.id));

    if (!currentFolder) return baseDocuments;
    return baseDocuments.filter((doc) => doc.folderName === currentFolder.name);
  }, [currentCategory, currentFolder, currentUser, documents]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = categoryDocuments.filter((doc) => {
      const typeLabel = normalizeDocumentType(doc.type).toLowerCase();
      const nameMatch = doc.name.toLowerCase().includes(query);
      const tagMatch = (doc.tags || []).some((tag) => tag.toLowerCase().includes(query));
      const typeMatch = typeLabel.includes(query);
      const passesQuery = !query || nameMatch || tagMatch || typeMatch;

      const fileTypePass =
        filters.type === 'all' || normalizeDocumentType(doc.type).toLowerCase() === filters.type.toLowerCase();
      const minSizePass = !filters.minSize || doc.size >= Number(filters.minSize) * 1024;
      const maxSizePass = !filters.maxSize || doc.size <= Number(filters.maxSize) * 1024;
      const dateFromPass = !filters.dateFrom || new Date(doc.modified) >= new Date(filters.dateFrom);
      const dateToPass = !filters.dateTo || new Date(doc.modified) <= new Date(`${filters.dateTo}T23:59:59`);

      return passesQuery && fileTypePass && minSizePass && maxSizePass && dateFromPass && dateToPass;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'modified-asc':
          return new Date(a.modified) - new Date(b.modified);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return b.size - a.size;
        case 'size-asc':
          return a.size - b.size;
        default:
          return new Date(b.modified) - new Date(a.modified);
      }
    });
  }, [categoryDocuments, filters, searchQuery, sortBy]);

  const pinnedFolders = useMemo(() => folders.filter((folder) => folder.parentId === null).slice(0, 5), [folders]);
  const detailDocument = selectedDocument
    ? documents.find((doc) => doc.id === selectedDocument.id) || selectedDocument
    : null;

  const filterCount = Object.values(filters).filter(Boolean).length;

  const openUpload = () => setIsUploadOpen(true);
  const onChooseFiles = () => fileInputRef.current?.click();

  const handleFileSelection = (event) => {
    uploadFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(event.dataTransfer.files);
  };

  const handleDocumentOpen = (doc) => {
    setSelectedDocument(doc);
    setRenameValue(doc.name);
    setShareValue('');
    setTagValue('');
    setDetailsTab('details');
    setZoomLevel(1);
  };

  const handleSearchSubmit = (value) => {
    setSearchQuery(value);
    pushRecentSearch(value);
    setShowSearchHistory(false);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleInlineRenameStart = (doc) => {
    setEditingId(doc.id);
    setInlineName(doc.name);
  };

  const handleInlineRenameSave = async () => {
    if (!editingId) return;
    await renameDocument(editingId, inlineName.trim() || 'Untitled document');
    setEditingId(null);
  };

  const breadcrumbs = ['Home', 'Documents', categoryConfig[currentCategory].label];
  if (currentFolder?.name) breadcrumbs.push(currentFolder.name);

  if (detailDocument) {
    return (
      <div className={`documents-shell ${isFullscreenPreview ? 'documents-shell--fullscreen' : ''}`}>
        <div className="documents-detail-page">
          <div className="documents-detail-header documents-glass">
            <button className="btn btn-link px-0 text-decoration-none" onClick={() => setSelectedDocument(null)}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to explorer
            </button>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h2 className="mb-2" style={{ color: 'var(--text-primary)' }}>{detailDocument.name}</h2>
                <div className="d-flex flex-wrap gap-2">
                  <span className={`badge text-bg-${getTypeTheme(detailDocument.type)}`}>
                    {normalizeDocumentType(detailDocument.type)}
                  </span>
                  <span className="documents-meta-chip">{formatBytes(detailDocument.size)}</span>
                  <span className="documents-meta-chip">Modified {formatDateTime(detailDocument.modified)}</span>
                  <span className="documents-meta-chip">Opened {detailDocument.accessCount || 0} times</span>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-secondary" onClick={() => toggleFavorite(detailDocument.id)}>
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  {detailDocument.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => togglePinned(detailDocument.id)}>
                  <FontAwesomeIcon icon={faThumbTack} className="me-2" />
                  {detailDocument.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => downloadDocument(detailDocument.id, detailDocument.name)}>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Download
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => (detailDocument.isTrash ? deleteDocument(detailDocument.id) : moveToTrash(detailDocument.id))}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {detailDocument.isTrash ? 'Delete permanently' : 'Delete'}
                </button>
              </div>
            </div>
          </div>

          <div className="documents-detail-tabs">
            {['details', 'activity', 'versions'].map((tab) => (
              <button
                key={tab}
                className={`documents-category-tab ${detailsTab === tab ? 'active' : ''}`}
                onClick={() => setDetailsTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="documents-card documents-glass h-100">
                <div className="documents-preview-toolbar">
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.1))}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="small text-secondary">{Math.round(zoomLevel * 100)}%</span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.1))}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsFullscreenPreview((prev) => !prev)}>
                    <FontAwesomeIcon icon={isFullscreenPreview ? faCompress : faExpand} className="me-2" />
                    {isFullscreenPreview ? 'Exit fullscreen' : 'Fullscreen'}
                  </button>
                </div>

                <div className="documents-preview" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                  {detailDocument.url && isImage(detailDocument.type) ? (
                    <img src={detailDocument.url} alt={detailDocument.name}  className="img-fluid rounded-4" />
                  ) : (
                    <div className="documents-preview-placeholder">
                      <FontAwesomeIcon icon={isPdf(detailDocument.type) ? faFileAlt : faFolderOpen} size="2x" style={{ color: 'var(--text-primary)' }} />
                      <h4 className="mt-3 mb-2" style={{ color: 'var(--text-primary)' }}>{getPreviewPlaceholder(detailDocument)}</h4>
                      <p className="mb-0 text-secondary">
                        {detailDocument.previewText || detailDocument.description || 'Preview generated for quick review.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="documents-card documents-glass documents-side-panel">
                {detailsTab === 'details' && (
                  <>
                    <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Metadata</h5>
                    <div className="documents-metadata-list">
                      <div><span>Owner</span><strong style={{ color: 'var(--text-primary)' }}>{detailDocument.owner}</strong></div>
                      <div><span>Type</span><strong style={{ color: 'var(--text-primary)' }}>{normalizeDocumentType(detailDocument.type)}</strong></div>
                      <div><span>Size</span><strong style={{ color: 'var(--text-primary)' }}>{formatBytes(detailDocument.size)}</strong></div>
                      <div><span>Folder</span><strong style={{ color: 'var(--text-primary)' }}>{detailDocument.folderName || 'Root'}</strong></div>
                      <div><span>Last opened</span><strong style={{ color: 'var(--text-primary)' }}>{detailDocument.lastOpenedAt ? formatDateTime(detailDocument.lastOpenedAt) : 'Not yet'}</strong></div>
                    </div>

                    <div className="documents-inline-form">
                      <label className="form-label">Inline rename</label>
                      <div className="input-group">
                        <input className="form-control" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
                        <button className="btn btn-primary" onClick={() => renameDocument(detailDocument.id, renameValue.trim() || detailDocument.name)}>
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                      </div>
                    </div>

                    <div className="documents-inline-form">
                      <label className="form-label">Share with permissions</label>
                      <input className="form-control mb-2" value={shareValue} onChange={(event) => setShareValue(event.target.value)} placeholder="Team or user" />
                      <div className="row g-2">
                        <div className="col-7">
                          <select className="form-select" value={sharePermission} onChange={(event) => setSharePermission(event.target.value)}>
                            <option value="view">View only</option>
                            <option value="edit">Edit</option>
                            <option value="download">Download</option>
                          </select>
                        </div>
                        <div className="col-5">
                          <button className="btn btn-outline-primary w-100" onClick={() => shareDocument(detailDocument.id, shareValue, { permission: sharePermission })}>
                            <FontAwesomeIcon icon={faShareNodes} className="me-2" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="documents-inline-form">
                      <label className="form-label">Public share link</label>
                      <div className="row g-2 align-items-center">
                        <div className="col-5">
                          <input className="form-control" type="number" value={linkExpiryDays} onChange={(event) => setLinkExpiryDays(Number(event.target.value) || 7)} />
                        </div>
                        <div className="col-7">
                          <button
                            className="btn btn-outline-secondary w-100"
                            onClick={() =>
                              shareDocument(detailDocument.id, '', {
                                isPublic: true,
                                permission: sharePermission,
                                expiresInDays: linkExpiryDays,
                                allowDownload: allowPublicDownload,
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faLink} className="me-2" />
                            Generate link
                          </button>
                        </div>
                      </div>
                      <div className="form-check mt-2">
                        <input className="form-check-input" type="checkbox" checked={allowPublicDownload} onChange={(event) => setAllowPublicDownload(event.target.checked)} id="publicDownload" />
                        <label className="form-check-label" htmlFor="publicDownload">Allow public download</label>
                      </div>
                      {detailDocument.publicShare?.url ? (
                        <div className="documents-share-link mt-2">
                          <small className="text-secondary d-block mb-1">Expires {detailDocument.publicShare.expiresAt ? formatDateTime(detailDocument.publicShare.expiresAt) : 'Never'}</small>
                          <input className="form-control" readOnly value={detailDocument.publicShare.url} />
                        </div>
                      ) : null}
                    </div>

                    <div className="documents-inline-form">
                      <label className="form-label">Add tags</label>
                      <div className="input-group">
                        <input className="form-control" value={tagValue} onChange={(event) => setTagValue(event.target.value)} placeholder="Enter a tag" />
                        <button className="btn btn-outline-secondary" onClick={() => { addDocumentTag(detailDocument.id, tagValue); setTagValue(''); }}>
                          <FontAwesomeIcon icon={faTag} />
                        </button>
                      </div>
                    </div>

                    <div className="documents-tag-list">
                      {(detailDocument.tags || []).length ? detailDocument.tags.map((tag) => <span key={tag} className="documents-tag">#{tag}</span>) : <div className="text-secondary small">No tags added yet.</div>}
                    </div>
                  </>
                )}

                {detailsTab === 'activity' && (
                  <>
                    <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>Access Logs</h5>
                    <div className="documents-timeline">
                      {(detailDocument.activities || []).length ? detailDocument.activities.map((activity) => (
                        <div key={activity.id} className="documents-timeline__item">
                          <strong>{activity.description}</strong>
                          <span>{activity.createdAt ? formatDateTime(activity.createdAt) : 'Just now'}</span>
                        </div>
                      )) : <div className="text-secondary small">No activity recorded yet.</div>}
                    </div>
                  </>
                )}

                {detailsTab === 'versions' && (
                  <>
                    <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>File Version History</h5>
                    <div className="documents-timeline">
                      {(detailDocument.versions || []).length ? detailDocument.versions.map((version) => (
                        <div key={version.id} className="documents-timeline__item">
                          <strong>Version {version.versionNumber}</strong>
                          <span>{version.notes || version.name}</span>
                          <span>{version.createdAt ? formatDateTime(version.createdAt) : ''}</span>
                        </div>
                      )) : <div className="text-secondary small">Version history will appear here after replacements.</div>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-shell container">
      <div className="documents-breadcrumbs">
        {breadcrumbs.map((item, index) => (
          <span key={item}>
            {item}
            {index < breadcrumbs.length - 1 ? <span className="documents-breadcrumbs__sep">/</span> : null}
          </span>
        ))}
      </div>

      <div className="documents-hero documents-glass">
        <div>
          <p className="documents-kicker mb-2" >Premium Document Explorer</p>
          <h2 className="mb-2" style={{ color: 'var(--text-primary)' }}>{categoryConfig[currentCategory].label}</h2>
          <p className="mb-0 text-secondary">
            Blue glassmorphism workspace with smart search, quick access, bulk actions, version history, and backend-powered activity.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary" onClick={() => setBulkMode((prev) => !prev)}>
            <FontAwesomeIcon icon={bulkMode ? faCheckSquare : faSquare} className="me-2" />
            {bulkMode ? 'Exit bulk mode' : 'Bulk select'}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <FontAwesomeIcon icon={viewMode === 'grid' ? faList : faGrip} className="me-2" />
            {viewMode === 'grid' ? 'List view' : 'Grid view'}
          </button>
          <button className="btn btn-primary" onClick={openUpload}>
            <FontAwesomeIcon icon={faArrowUpFromBracket} className="me-2" />
            Upload
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="documents-card documents-glass documents-metric">
            <span>Storage usage</span>
            <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(documentsMeta.storage.used)}</strong>
            <div className="documents-storage-bar mt-3">
              <div
                className="documents-storage-bar__fill"
                style={{ width: `${Math.min((documentsMeta.storage.used / (documentsMeta.storage.limit || 1)) * 100, 100)}%` }}
              />
            </div>
            <small>{formatBytes(documentsMeta.storage.free)} free of {formatBytes(documentsMeta.storage.limit)}</small>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="documents-card documents-glass">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Recent Files</h5>
              <FontAwesomeIcon icon={faClockRotateLeft} style={{ color: 'var(--text-primary)' }}/>
            </div>
            <div className="documents-mini-list">
              {(documentsMeta.recentFiles || []).slice(0, 4).map((doc) => (
                <button key={doc.id} className="documents-mini-item" onClick={() => handleDocumentOpen(doc)}>
                  <span>{doc.name}</span>
                  <small>{formatDate(doc.modified)}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="documents-card documents-glass">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Quick Access</h5>
              <FontAwesomeIcon icon={faBolt} style={{ color: 'var(--text-primary)' }}/>
            </div>
            <div className="documents-mini-list">
              {(documentsMeta.quickAccess || []).slice(0, 4).map((doc) => (
                <button key={doc.id} className="documents-mini-item" onClick={() => handleDocumentOpen(doc)}>
                  <span>{doc.name}</span>
                  <small>Pinned file</small>
                </button>
              ))}
              {!documentsMeta.quickAccess?.length ? <div className="text-secondary small">Pin important documents to see them here.</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="documents-card documents-glass">
            <div className="documents-toolbar">
              <div className="documents-search-wrap">
                <div className="documents-search">
                  <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'var(--text-primary)' }}/>
                  <input
                    value={searchQuery}
                    onFocus={() => setShowSearchHistory(true)}
                    onBlur={() => window.setTimeout(() => setShowSearchHistory(false), 120)}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSearchSubmit(searchQuery);
                      }
                    }}
                    placeholder="Search by name, tags, or type"
                  />
                </div>
                {showSearchHistory && documentsMeta.recentSearches?.length ? (
                  <div className="documents-search-history">
                    {documentsMeta.recentSearches.map((item) => (
                      <button key={item} onMouseDown={() => handleSearchSubmit(item)}>
                        <FontAwesomeIcon icon={faClockRotateLeft} className="me-2" style={{ color: 'var(--text-primary)' }}/>
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setIsFilterOpen(true)}>
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Filter{filterCount ? ` (${filterCount})` : ''}
                </button>
                <select className="form-select documents-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="documents-category-tabs">
              {Object.entries(categoryConfig).map(([key, value]) => (
                <button key={key} className={`documents-category-tab ${currentCategory === key ? 'active' : ''}`} onClick={() => { setCurrentCategory(key); setCurrentFolder(null); }}>
                  {value.label}
                </button>
              ))}
            </div>

            <div className="documents-folder-strip">
              <button className={`documents-folder-chip ${!currentFolder ? 'active' : ''}`} onClick={() => setCurrentFolder(null)}>
                Root
              </button>
              {pinnedFolders.map((folder) => (
                <button
                  key={folder.id}
                  className={`documents-folder-chip ${currentFolder?.id === folder.id ? 'active' : ''}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingDocumentId) {
                      moveDocumentToFolder(draggingDocumentId, folder.name);
                      setDraggingDocumentId(null);
                    }
                  }}
                  onClick={() => setCurrentFolder(folder)}
                >
                  <FontAwesomeIcon icon={faUpDownLeftRight} className="me-2" />
                  {folder.name}
                </button>
              ))}
            </div>

            {bulkMode && selectedIds.length ? (
              <div className="documents-bulk-bar">
                <span>{selectedIds.length} selected</span>
                <div className="d-flex gap-2 flex-wrap">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => runBulkAction('favorite', selectedIds)}>Favorite</button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => runBulkAction('pin', selectedIds)}>Pin</button>
                  <button className="btn btn-outline-warning btn-sm" onClick={() => runBulkAction('trash', selectedIds)}>Trash</button>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedIds([])}>Clear</button>
                </div>
              </div>
            ) : null}

            {documentsLoading ? (
              <div className="row g-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div className="col-md-6 col-xl-4" key={item}>
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="row g-3">
                {filteredDocuments.map((doc) => (
                  <div className="col-md-6 col-xl-4" key={doc.id}>
                    <div
                      className="documents-card documents-glass documents-doc-card text-start w-100"
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={() => setDraggingDocumentId(doc.id)}
                      onClick={() => handleDocumentOpen(doc)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleDocumentOpen(doc);
                        }
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            {bulkMode ? (
                              <button className="btn btn-sm btn-outline-secondary" onClick={(event) => { event.stopPropagation(); toggleSelection(doc.id); }}>
                                <FontAwesomeIcon icon={selectedIds.includes(doc.id) ? faCheckSquare : faSquare} />
                              </button>
                            ) : null}
                            <span className={`badge text-bg-${getTypeTheme(doc.type)}`}>{normalizeDocumentType(doc.type)}</span>
                            {doc.duplicateCount ? <span className="documents-meta-chip">Duplicate match</span> : null}
                            {doc.isPinned ? <span className="documents-meta-chip">Pinned</span> : null}
                          </div>
                          <h5 className="mb-2">{highlightMatch(doc.name, searchQuery)}</h5>
                          <p className="text-secondary mb-3">{doc.previewText || doc.description}</p>
                        </div>
                        <div className="documents-card-actions">
                          <button className={`btn btn-sm ${doc.isFavorite ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(doc.id); }}>
                            <FontAwesomeIcon icon={faStar} />
                          </button>
                          <button className={`btn btn-sm ${doc.isPinned ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={(event) => { event.stopPropagation(); togglePinned(doc.id); }}>
                            <FontAwesomeIcon icon={faThumbTack} />
                          </button>
                        </div>
                      </div>
                      <div className="documents-doc-meta">
                        <span>{formatBytes(doc.size)}</span>
                        <span>{formatDate(doc.modified)}</span>
                        <span>{doc.folderName || 'Root'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle documents-table">
                  <thead>
                    <tr>
                      {bulkMode ? <th /> : null}
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Date modified</th>
                      <th>Folder</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id}>
                        {bulkMode ? (
                          <td>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleSelection(doc.id)}>
                              <FontAwesomeIcon icon={selectedIds.includes(doc.id) ? faCheckSquare : faSquare} />
                            </button>
                          </td>
                        ) : null}
                        <td>
                          {editingId === doc.id ? (
                            <div className="input-group">
                              <input className="form-control form-control-sm" value={inlineName} onChange={(event) => setInlineName(event.target.value)} />
                              <button className="btn btn-sm btn-primary" onClick={handleInlineRenameSave}>Save</button>
                            </div>
                          ) : (
                            <button className="btn btn-link text-decoration-none p-0" onDoubleClick={() => handleInlineRenameStart(doc)} onClick={() => handleDocumentOpen(doc)}>
                              {highlightMatch(doc.name, searchQuery)}
                            </button>
                          )}
                        </td>
                        <td>{normalizeDocumentType(doc.type)}</td>
                        <td>{formatBytes(doc.size)}</td>
                        <td>{formatDate(doc.modified)}</td>
                        <td>{doc.folderName || 'Root'}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleFavorite(doc.id)}>
                            <FontAwesomeIcon icon={faStar} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!documentsLoading && !filteredDocuments.length ? (
              <div className="documents-empty-state">
                <FontAwesomeIcon icon={faFolderOpen} size="2x" className="mb-3" />
                <h4 className="mb-2">{categoryConfig[currentCategory].empty}</h4>
                <p className="text-secondary mb-0">Try adjusting your search, filters, folder, or upload a new file to get started.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="col-xl-4">
          <div className="documents-card documents-glass mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Top Files</h5>
              <FontAwesomeIcon icon={faEye} style={{ color: 'var(--text-primary)' }}/>
            </div>
            <div className="documents-mini-list">
              {(documentsMeta.topFiles || []).map((doc) => (
                <button key={doc.id} className="documents-mini-item" onClick={() => handleDocumentOpen(doc)}>
                  <span>{doc.name}</span>
                  <small>{formatBytes(doc.size)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="documents-card documents-glass mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Recent Activity</h5>
              <FontAwesomeIcon icon={faClockRotateLeft} style={{ color: 'var(--text-primary)' }}/>
            </div>
            <div className="documents-timeline">
              {(documentsMeta.recentActivity || []).slice(0, 6).map((activity) => (
                <div key={activity.id} className="documents-timeline__item">
                  <strong>{activity.description}</strong>
                  <span>{activity.createdAt ? formatDateTime(activity.createdAt) : 'Just now'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="documents-card documents-glass">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Trash Stats</h5>
              <FontAwesomeIcon icon={faTrashArrowUp} style={{ color: 'var(--text-primary)' }}/>
            </div>
            <p className="text-secondary mb-2">{documentsMeta.trashStats?.count || 0} files currently in trash.</p>
            <p className="text-secondary mb-3">Auto delete after {documentsMeta.trashStats?.autoDeleteDays || 30} days.</p>
            <button className="btn btn-outline-primary w-100" onClick={restoreAllDocuments}>
              Restore all
            </button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelection} />

      <Modal
        show={isUploadOpen}
        onHide={() => {
          setIsUploadOpen(false);
          resetUploadState();
        }}
        title="Upload documents"
        size="large"
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={onChooseFiles}>Choose files</button>
            <button className="btn btn-primary" onClick={() => { setIsUploadOpen(false); resetUploadState(); }}>Done</button>
          </>
        }
      >
        <div
          className={`documents-upload-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <FontAwesomeIcon icon={faArrowUpFromBracket} size="2x" />
          <h5 className="mt-3">Drop files here</h5>
          <p className="text-secondary mb-0">Queue uploads, pause/resume items, and validate type/size before they hit the backend.</p>
        </div>

        {errors.length ? (
          <div className="alert alert-warning mt-3 mb-0">
            {errors.map((error) => <div key={error}>{error}</div>)}
          </div>
        ) : null}

        <div className="documents-upload-list mt-4">
          {queue.map((item) => (
            <div key={item.id} className="documents-upload-item">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <div>
                  <strong>{item.name}</strong>
                  <div className="small text-secondary">{formatBytes(item.size)}</div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => togglePauseUpload(item.id)}
                    disabled={item.status === 'complete' || item.status === 'error'}
                  >
                    {item.isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => cancelUpload(item.id)}>
                    <FontAwesomeIcon icon={faXmark} className="me-2" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="progress mt-3" role="progressbar" aria-valuenow={item.progress} aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar" style={{ width: `${item.progress}%` }}>{item.progress}%</div>
              </div>
            </div>
          ))}
          {!queue.length ? <div className="text-secondary small">No files queued yet.</div> : null}
          {uploading ? <div className="small text-secondary mt-2">Upload in progress...</div> : null}
        </div>
      </Modal>

      <Modal
        show={isFilterOpen}
        onHide={() => setIsFilterOpen(false)}
        title="Filter documents"
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setFilters(defaultFilters)}>Reset</button>
            <button className="btn btn-primary" onClick={() => setIsFilterOpen(false)}>Apply</button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">File type</label>
            <select className="form-select" value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="all">All types</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="img">IMG</option>
              <option value="sheet">SHEET</option>
              <option value="txt">TXT</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Min size (KB)</label>
            <input className="form-control" type="number" value={filters.minSize} onChange={(event) => setFilters((prev) => ({ ...prev, minSize: event.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date from</label>
            <input className="form-control" type="date" value={filters.dateFrom} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date to</label>
            <input className="form-control" type="date" value={filters.dateTo} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Max size (KB)</label>
            <input className="form-control" type="number" value={filters.maxSize} onChange={(event) => setFilters((prev) => ({ ...prev, maxSize: event.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentsWorkspace;
