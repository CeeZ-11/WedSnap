import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GalleryGrid } from '../components/GalleryGrid';
import { ImageModal } from '../components/ImageModal';
import { MediaItem } from '../types';

// ✅ Firebase (UPDATED)
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "gallery"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        uploaderName: doc.data().uploaderName,
        createdAt: doc.data().createdAt,
        type: "photo", // default for now
      }));

      setItems(data as MediaItem[]);
    });

    return () => unsubscribe(); // cleanup
  }, []);

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

      {/* Notice */}
      <div className="max-w-md mx-auto mb-6 px-4">
        <div className="text-center border border-light-sage/30 bg-light-sage/10 rounded-xl px-5 py-4">
          <p className="text-sm text-deep-olive font-medium">
            🚧 Gallery uploads will be fully available before the wedding
          </p>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid items={items} onItemClick={setSelectedItem} />

      {/* Modal */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      
    </motion.div>
  );
}