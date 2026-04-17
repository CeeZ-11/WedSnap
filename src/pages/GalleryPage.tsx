import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GalleryGrid } from '../components/GalleryGrid';
import { ImageModal } from '../components/ImageModal';
import { MediaItem } from '../types';
import { mockGalleryItems } from '../mockData';
export function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = mockGalleryItems.findIndex(
      (item) => item.id === selectedItem.id
    );
    if (currentIndex < mockGalleryItems.length - 1) {
      setSelectedItem(mockGalleryItems[currentIndex + 1]);
    } else {
      setSelectedItem(mockGalleryItems[0]); // loop back
    }
  };
  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = mockGalleryItems.findIndex(
      (item) => item.id === selectedItem.id
    );
    if (currentIndex > 0) {
      setSelectedItem(mockGalleryItems[currentIndex - 1]);
    } else {
      setSelectedItem(mockGalleryItems[mockGalleryItems.length - 1]); // loop to end
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="min-h-screen pt-20 pb-24 md:pt-28 md:pb-12 bg-ivory">
      
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl md:text-5xl mb-3 font-semibold text-deep-olive font-[Playfair Display]">
    Wedding Snaps
  </h1>
        <p className="text-dark/60">Memories from our special day</p>
      </div>

      <GalleryGrid onItemClick={setSelectedItem} />

      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onNext={handleNext}
        onPrev={handlePrev} />
      
    </motion.div>);

}