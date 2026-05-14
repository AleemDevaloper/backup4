import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getFileExtension, validateFiles } from '../utils/fileHelpers';

const createUploadItem = (file) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  file,
  name: file.name,
  size: file.size,
  progress: 0,
  status: 'queued',
  isPaused: false,
});

export const useUpload = () => {
  const { addDocument } = useApp();
  const [queue, setQueue] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const intervalRef = useRef(null);
  const activeIdRef = useRef(null);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetUploadState = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = null;
    activeIdRef.current = null;
    setQueue([]);
    setErrors([]);
    setUploading(false);
  };

  const cancelUpload = (id) => {
    if (activeIdRef.current === id && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      activeIdRef.current = null;
    }

    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePauseUpload = (id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isPaused: !item.isPaused,
              status: item.isPaused ? 'queued' : item.status === 'complete' ? 'complete' : 'paused',
            }
          : item
      )
    );

    if (activeIdRef.current === id && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      activeIdRef.current = null;
    }
  };

  const uploadFiles = (files) => {
    const { accepted, rejected } = validateFiles(files);
    if (!accepted.length && !rejected.length) return;

    setErrors((prev) => [...prev, ...rejected]);
    setQueue((prev) => [...prev, ...accepted.map(createUploadItem)]);
  };

  useEffect(() => {
    const nextItem = queue.find((item) => !item.isPaused && item.status === 'queued');

    if (!nextItem) {
      if (!queue.some((item) => item.status === 'uploading')) {
        setUploading(false);
      }
      return;
    }

    if (intervalRef.current || activeIdRef.current) {
      return;
    }

    activeIdRef.current = nextItem.id;
    setUploading(true);
    setQueue((prev) => prev.map((item) => (item.id === nextItem.id ? { ...item, status: 'uploading' } : item)));

    let progressValue = nextItem.progress;
    intervalRef.current = window.setInterval(async () => {
      const currentItem = queueRef.current.find((item) => item.id === nextItem.id);

      if (!currentItem || currentItem.isPaused) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        activeIdRef.current = null;
        return;
      }

      progressValue = Math.min(progressValue + 12, 92);
      setQueue((prev) =>
        prev.map((item) => (item.id === nextItem.id ? { ...item, progress: progressValue } : item))
      );

      if (progressValue >= 92) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;

        try {
          const created = await addDocument({
            name: nextItem.name,
            type: getFileExtension(nextItem.name),
            size: nextItem.size,
            modified: new Date().toISOString(),
            owner: 'me',
            tags: ['uploaded'],
            file: nextItem.file,
            folderName: null,
            previewText: 'Recently uploaded to the document workspace.',
            description: 'Uploaded through the dashboard document explorer.',
          });

          setQueue((prev) =>
            prev.map((item) =>
              item.id === nextItem.id
                ? {
                    ...item,
                    progress: 100,
                    status: 'complete',
                    uploadedId: created.id,
                  }
                : item
            )
          );
        } catch {
          setQueue((prev) =>
            prev.map((item) => (item.id === nextItem.id ? { ...item, status: 'error' } : item))
          );
        } finally {
          activeIdRef.current = null;
        }
      }
    }, 180);
  }, [addDocument, queue]);

  return {
    uploadFiles,
    uploading,
    queue,
    errors,
    cancelUpload,
    togglePauseUpload,
    resetUploadState,
  };
};
