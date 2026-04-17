import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
interface ImageModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}
export function ImageModal({ item, onClose, onNext, onPrev }: ImageModalProps) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onNext, onPrev]);
  // Prevent body scroll when open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item]);
  return (
    <AnimatePresence>
      {item &&
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}>
        
          {/* Top Actions */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white">
              <p className="font-medium">{item.uploaderName}</p>
              <p className="text-xs text-white/70">
                {item.timestamp.toLocaleDateString()} •{' '}
                {item.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
              onClick={(e) => {
                e.stopPropagation();
                // Mock download
                alert('Downloading image...');
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              
                <Download size={20} />
              </button>
              <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {onPrev &&
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10 hidden md:flex">
          
              <ChevronLeft size={24} />
            </button>
        }

          {onNext &&
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10 hidden md:flex">
          
              <ChevronRight size={24} />
            </button>
        }

          {/* Main Image */}
          <motion.div
          initial={{
            scale: 0.9,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0.9,
            opacity: 0
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className="relative max-w-5xl max-h-[85vh] w-full px-4 md:px-16 flex justify-center items-center"
          onClick={(e) => e.stopPropagation()}>
          
            <img
            src={item.url}
            alt={`Uploaded by ${item.uploaderName}`}
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" />
          
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}