import { createContext, useContext, useEffect, useState } from 'react';
import { documents as initialDocuments } from '../data/documents';
import { folders as initialFolders } from '../data/folders';
import { getAuthToken, setAuthToken } from '../api/client';
import { login as apiLogin, logout as apiLogout, me as apiMe, register as apiRegister } from '../api/auth';
import {
  bulkDocuments,
  createDocument,
  deleteDocumentRequest,
  listDocuments,
  restoreDocumentRequest,
  shareDocumentRequest,
  updateDocumentRequest,
} from '../api/documents';

const AppContext = createContext();
const DOCUMENTS_STORAGE_KEY = 'dms.documents';
const FOLDERS_STORAGE_KEY = 'dms.folders';
const RECENT_SEARCHES_KEY = 'dms.recentSearches';

const defaultMeta = {
  storage: { used: 0, limit: 1073741824, free: 1073741824 },
  recentFiles: [],
  quickAccess: [],
  topFiles: [],
  recentActivity: [],
  duplicates: [],
  trashStats: { count: 0, autoDeleteDays: 30 },
  recentSearches: [],
};

const readStoredState = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documents, setDocuments] = useState(() => readStoredState(DOCUMENTS_STORAGE_KEY, initialDocuments));
  const [documentsMeta, setDocumentsMeta] = useState(defaultMeta);
  const [folders, setFolders] = useState(() => readStoredState(FOLDERS_STORAGE_KEY, initialFolders));
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en',
  });
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSearches, setRecentSearches] = useState(() => readStoredState(RECENT_SEARCHES_KEY, []));

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setAuthLoading(false);
        return;
      }

      try {
        const user = await apiMe();
        if (!cancelled) setCurrentUser(user);
      } catch {
        setAuthToken(null);
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      setSettings((prev) => ({ ...prev, theme: saved }));
      document.documentElement.classList.toggle('dark-mode', saved === 'dark');
      document.documentElement.classList.toggle('light-mode', saved === 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      setSettings((prev) => ({ ...prev, theme: initial }));
      document.documentElement.classList.toggle('dark-mode', initial === 'dark');
      document.documentElement.classList.toggle('light-mode', initial === 'light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const refreshDocuments = async (params = {}) => {
    if (!getAuthToken()) return { data: documents, meta: documentsMeta };

    setDocumentsLoading(true);
    try {
      const response = await listDocuments(params);
      const nextDocuments = response.data || [];
      const nextMeta = { ...defaultMeta, ...(response.meta || {}) };
      setDocuments(nextDocuments);
      setDocumentsMeta(nextMeta);

      setSelectedDocument((prev) =>
        prev ? nextDocuments.find((doc) => doc.id === prev.id) || null : null
      );

      return { data: nextDocuments, meta: nextMeta };
    } catch (error) {
      console.error('Unable to load documents from API.', error);
      return { data: documents, meta: documentsMeta };
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    refreshDocuments();
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const settingtheme = (newTheme) => {
    setTheme(newTheme);
  };

  const login = async ({ email, password }) => {
    const user = await apiLogin({ email, password });
    setCurrentUser(user);
    await refreshDocuments();
    return user;
  };

  const signup = async ({ name, email, password, id, role }) => {
    const user = await apiRegister({
      name,
      email,
      password,
      empId: id,
      role,
    });
    setCurrentUser(user);
    await refreshDocuments();
    return user;
  };

  const logout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setSelectedDocument(null);
    setDocuments(initialDocuments);
    setDocumentsMeta(defaultMeta);
  };

  const updateUserProfile = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addDocument = async (doc) => {
    try {
      const created = await createDocument(doc);
      setDocuments((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      await refreshDocuments();
      addNotification(`Uploaded ${created.name} successfully.`, 'success');
      return created;
    } catch (error) {
      addNotification(error.message || 'Document upload failed.', 'error');
      throw error;
    }
  };

  const addDocuments = async (docs) => {
    const results = [];
    for (const doc of docs) {
      // Keep uploads ordered and easy to trace in the activity feed.
      const created = await addDocument(doc);
      results.push(created);
    }
    return results;
  };

  const updateDocument = async (id, updates) => {
    try {
      const updated = await updateDocumentRequest(id, updates);
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)));
      setSelectedDocument((prev) => (prev?.id === id ? updated : prev));
      await refreshDocuments();
      return updated;
    } catch (error) {
      addNotification(error.message || 'Document update failed.', 'error');
      throw error;
    }
  };

  const renameDocument = async (id, name) => {
    const updated = await updateDocument(id, { name });
    addNotification(`Renamed to ${updated.name}.`, 'success');
    return updated;
  };

  const deleteDocument = async (id, force = true) => {
    try {
      await deleteDocumentRequest(id, force);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      await refreshDocuments();
      addNotification(force ? 'Document deleted permanently.' : 'Document moved to trash.', 'warning');
    } catch (error) {
      addNotification(error.message || 'Unable to delete document.', 'error');
      throw error;
    }
  };

  const moveToTrash = async (id) => {
    const updated = await updateDocument(id, { inTrash: true });
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    addNotification(`${updated.name} moved to trash.`, 'warning');
    return updated;
  };

  const restoreDocument = async (id) => {
    try {
      const restored = await restoreDocumentRequest(id);
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? restored : doc)));
      await refreshDocuments();
      addNotification(`${restored.name} restored.`, 'success');
      return restored;
    } catch (error) {
      addNotification(error.message || 'Unable to restore document.', 'error');
      throw error;
    }
  };

  const restoreAllDocuments = async () => {
    const ids = documents.filter((doc) => doc.isTrash).map((doc) => doc.id);
    if (!ids.length) return;
    await bulkDocuments('restore', ids);
    await refreshDocuments();
    addNotification('All trash items restored.', 'success');
  };

  const toggleFavorite = async (id) => {
    const target = documents.find((doc) => doc.id === id);
    if (!target) return null;
    const updated = await updateDocument(id, { isFavorite: !target.isFavorite });
    addNotification(
      updated.isFavorite ? `${updated.name} added to favorites.` : `${updated.name} removed from favorites.`,
      'info'
    );
    return updated;
  };

  const togglePinned = async (id) => {
    const target = documents.find((doc) => doc.id === id);
    if (!target) return null;
    const updated = await updateDocument(id, { isPinned: !target.isPinned });
    addNotification(
      updated.isPinned ? `${updated.name} pinned to quick access.` : `${updated.name} unpinned.`,
      'info'
    );
    return updated;
  };

  const shareDocument = async (id, shareTarget, options = {}) => {
    try {
      const payload = {
        recipient: shareTarget || undefined,
        permission: options.permission || 'view',
        isPublic: options.isPublic || false,
        expiresInDays: options.expiresInDays || undefined,
        allowDownload: options.allowDownload || false,
      };

      const result = await shareDocumentRequest(id, payload);
      const updated = result.document;
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? updated : doc)));
      setSelectedDocument((prev) => (prev?.id === id ? updated : prev));
      await refreshDocuments();
      addNotification(`Sharing updated for ${updated.name}.`, 'success');
      return result;
    } catch (error) {
      addNotification(error.message || 'Unable to share document.', 'error');
      throw error;
    }
  };

  const addDocumentTag = async (id, tag) => {
    const target = documents.find((doc) => doc.id === id);
    if (!target) return null;

    const normalized = tag.trim().toLowerCase();
    if (!normalized) return target;

    const existing = new Set(target.tags || []);
    existing.add(normalized);
    return updateDocument(id, { tags: Array.from(existing) });
  };

  const removeDocumentTag = async (id, tagToRemove) => {
    const target = documents.find((doc) => doc.id === id);
    if (!target) return null;
    return updateDocument(id, {
      tags: (target.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  const runBulkAction = async (action, ids) => {
    if (!ids.length) return;
    await bulkDocuments(action, ids);
    await refreshDocuments();
    addNotification(`Bulk action "${action}" completed.`, 'success');
  };

  const addFolder = (folder) => {
    const now = new Date().toISOString();
    setFolders((prev) => [
      ...prev,
      {
        ...folder,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        created: now,
        modified: now,
      },
    ]);
  };

  const updateFolder = (id, updates) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, ...updates, modified: new Date().toISOString() } : folder
      )
    );
  };

  const deleteFolder = (id) => {
    setDocuments((prev) => prev.map((doc) => (doc.folderId === id ? { ...doc, folderId: null } : doc)));
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
  };

  const moveDocumentToFolder = async (documentId, folderId) => {
    return updateDocument(documentId, { folderName: folderId ?? null });
  };

  const getFoldersForParent = (parentId) => folders.filter((folder) => folder.parentId === parentId);

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const pushRecentSearch = (query) => {
    const normalized = query.trim();
    if (!normalized) return;
    setRecentSearches((prev) => [normalized, ...prev.filter((item) => item !== normalized)].slice(0, 8));
  };

  const value = {
    currentUser,
    authLoading,
    documentsLoading,
    documents,
    documentsMeta: { ...documentsMeta, recentSearches },
    folders,
    currentFolder,
    currentCategory,
    searchQuery,
    filterType,
    viewMode,
    selectedDocument,
    settings,
    theme,
    notifications,
    rememberMe,
    login,
    signup,
    logout,
    refreshDocuments,
    updateUserProfile,
    updateSettings,
    toggleTheme,
    settingtheme,
    addDocument,
    addDocuments,
    updateDocument,
    renameDocument,
    deleteDocument,
    moveToTrash,
    restoreDocument,
    restoreAllDocuments,
    toggleFavorite,
    togglePinned,
    shareDocument,
    addDocumentTag,
    removeDocumentTag,
    runBulkAction,
    addFolder,
    updateFolder,
    deleteFolder,
    moveDocumentToFolder,
    getFoldersForParent,
    addNotification,
    removeNotification,
    pushRecentSearch,
    setRememberMe,
    setCurrentFolder,
    setCurrentCategory,
    setSearchQuery,
    setFilterType,
    setViewMode,
    setSelectedDocument,
    activeTab,
    setActiveTab,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
