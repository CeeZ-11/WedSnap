import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../types';

interface GalleryGridProps {
  items: MediaItem[]; // ✅ NOW FROM FIREBASE
  onItemClick: (item: MediaItem) => void;
}

export function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Simulate loading only when items first arrive
  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // shorter = better UX
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [items]);

  // 🔥 LOADING STATE
  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4 max-w-7xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl bg-warm-beige/30 animate-shimmer overflow-hidden relative"
            style={{
              height: `${Math.floor(Math.random() * 150) + 150}px`,
            }}
          />
        ))}
      </div>
    );
  }

  // 🔥 EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-24 h-24 bg-champagne rounded-full flex items-center justify-center text-gold mb-6">
          <ImageIcon size={40} strokeWidth={1} />
        </div>
        <h2 className="font-serif text-3xl text-dark mb-2">No photos yet</h2>
        <p className="text-dark/60">
          Be the first to share a memory from the special day!
        </p>
      </div>
    );
  }

  // 🔥 GRID
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4 max-w-7xl mx-auto">
      {items.map((item, index) => {
        const imageUrl = item.url || item.thumbnailUrl;
        const timestamp = item.createdAt
          ? new Date(item.createdAt)
          : item.timestamp || new Date();

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-champagne/20"
            onClick={() => onItemClick(item)}
          >
            {/* IMAGE */}
            <img
              src={imageUrl}
              alt={`Uploaded by ${item.uploaderName}`}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* VIDEO ICON (optional fallback) */}
            {item.type === 'video' && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                <Play size={14} fill="currentColor" />
              </div>
            )}

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white font-medium text-sm truncate">
                {item.uploaderName}
              </p>
              <p className="text-white/70 text-xs">
                {timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}