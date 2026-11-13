import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { GalleryGrid } from '../components/GalleryGrid';
import { ImageModal } from '../components/ImageModal';
import { MediaItem } from '../types';

export function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const apiUrl = import.meta.env.VITE_GALLERY_API_URL || '';

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_GALLERY_API_URL || ''}/api/gallery`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Gallery service is not configured yet.');
        return response.json() as Promise<MediaItem[]>;
      })
      .then(setItems)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Could not load the Cloudflare gallery:', error);
        setItems([]);
      });
    return () => controller.abort();
  }, []);

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setAdminCode('');
    setDeleteMessage('');
  };

  const deleteItem = async () => {
    if (!deleteTarget || !/^\d{4}$/.test(adminCode)) {
      setDeleteMessage('Enter your four-digit admin code.');
      return;
    }
    setIsDeleting(true);
    setDeleteMessage('');
    try {
      const response = await fetch(`${apiUrl}/api/gallery/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-code': adminCode },
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Could not delete this item.');
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setSelectedItem((current) => current?.id === deleteTarget.id ? null : current);
      setDeleteTarget(null);
      setAdminCode('');
    } catch (error) {
      setDeleteMessage(error instanceof Error && error.message === 'Failed to fetch'
        ? 'Could not reach the gallery service. Please try again.'
        : error instanceof Error ? error.message : 'Could not delete this item.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Next
  const handleNext = () => {
    if (!selectedItem || items.length === 0) return;

    const currentIndex = items.findIndex(
      (item) => item.id === selectedItem.id
    );

    if (currentIndex < items.length - 1) {
      setSelectedItem(items[currentIndex + 1]);
    } else {
      setSelectedItem(items[0]);
    }
  };

  // ✅ Prev
  const handlePrev = () => {
    if (!selectedItem || items.length === 0) return;

    const currentIndex = items.findIndex(
      (item) => item.id === selectedItem.id
    );

    if (currentIndex > 0) {
      setSelectedItem(items[currentIndex - 1]);
    } else {
      setSelectedItem(items[items.length - 1]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-24 md:pt-28 md:pb-12 bg-ivory"
    >
      
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl md:text-5xl mb-3 font-semibold text-deep-olive font-[Playfair Display]">
          Wedding Snaps
        </h1>

        <p className="text-deep-olive/70 font-sans">
          Memories from our special day
        </p>
      </div>

      {/* Gallery */}
      <GalleryGrid items={items} onItemClick={setSelectedItem} onDeleteClick={(item) => {
        setDeleteTarget(item);
        setAdminCode('');
        setDeleteMessage('');
      }} />

      {/* Modal */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-8" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeDeleteDialog();
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="delete-gallery-title" className="w-full max-w-md rounded-2xl border border-warm-beige bg-ivory p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="delete-gallery-title" className="font-serif text-2xl text-deep-olive">Delete gallery item?</h2>
                <p className="mt-1 text-sm text-deep-olive/70">This permanently removes the photo or video.</p>
              </div>
              <button type="button" onClick={closeDeleteDialog} disabled={isDeleting} aria-label="Close delete dialog" className="rounded-full p-2 text-deep-olive hover:bg-light-sage/30 disabled:opacity-50"><X size={18} /></button>
            </div>
            <label htmlFor="admin-delete-code" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.18em] text-deep-olive">Admin code</label>
            <input
              id="admin-delete-code"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(event) => { if (event.key === 'Enter') void deleteItem(); }}
              placeholder="4 digits"
              className="w-full rounded-xl border border-warm-beige bg-white px-4 py-3 font-sans text-lg tracking-[0.35em] text-deep-olive outline-none focus:ring-2 focus:ring-deep-olive"
              autoFocus
            />
            {deleteMessage && <p role="alert" className="mt-3 text-sm text-red-700">{deleteMessage}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={closeDeleteDialog} disabled={isDeleting} className="rounded-xl border border-warm-beige px-4 py-2 font-sans text-sm text-deep-olive hover:bg-light-sage/20 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void deleteItem()} disabled={isDeleting} className="inline-flex items-center gap-2 rounded-xl bg-deep-olive px-4 py-2 font-sans text-sm font-medium text-white hover:bg-[#4a4e3c] disabled:opacity-50">
                <Trash2 size={15} />{isDeleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </section>
        </div>
      )}
      
    </motion.div>
  );
}
