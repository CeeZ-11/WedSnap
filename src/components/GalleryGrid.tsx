import React, { useEffect, useState, lazy, memo } from 'react';
import { motion } from 'framer-motion';
import { Play, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../types';
import { mockGalleryItems } from '../mockData';
interface GalleryGridProps {
  onItemClick: (item: MediaItem) => void;
}
export function GalleryGrid({ onItemClick }: GalleryGridProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    // Simulate network load
    const timer = setTimeout(() => {
      setItems(mockGalleryItems);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4 max-w-7xl mx-auto">
        {Array.from({
          length: 8
        }).map((_, i) =>
        <div
          key={i}
          className="w-full rounded-2xl bg-warm-beige/30 animate-shimmer overflow-hidden relative"
          style={{
            height: `${Math.floor(Math.random() * 150) + 150}px`,
            backgroundImage:
            'linear-gradient(90deg, rgba(232, 221, 211, 0.3) 0px, rgba(232, 221, 211, 0.6) 50%, rgba(232, 221, 211, 0.3) 100%)',
            backgroundSize: '200% 100%'
          }} />

        )}
      </div>);

  }
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
      </div>);

  }
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4 max-w-7xl mx-auto">
      {items.map((item, index) =>
      <motion.div
        key={item.id}
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: index * 0.05,
          duration: 0.4
        }}
        className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-champagne/20"
        onClick={() => onItemClick(item)}>
        
          <img
          src={item.thumbnailUrl}
          alt={`Uploaded by ${item.uploaderName}`}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
        

          {item.type === 'video' &&
        <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <Play size={14} fill="currentColor" />
            </div>
        }

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <p className="text-white font-medium text-sm truncate">
              {item.uploaderName}
            </p>
            <p className="text-white/70 text-xs">
              {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
            </p>
          </div>
        </motion.div>
      )}
    </div>);

}