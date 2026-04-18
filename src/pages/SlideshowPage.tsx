import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, Play } from 'lucide-react';

// ✅ Firebase
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

import { MediaItem } from '../types';

export function SlideshowPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // 🔥 FETCH FROM FIREBASE (REAL-TIME)
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
        type: "photo",
      }));

      setItems(data as MediaItem[]);
      setCurrentIndex(0);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 AUTO-HIDE CONTROLS
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);

    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // 🔥 AUTO PLAY (USE FIREBASE ITEMS)
  useEffect(() => {
    if (!isPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, items]);

  // ✅ NO DATA STATE
  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        No photos yet...
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-50">

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >

            {/* Top */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">

              <button
                onClick={() => navigate('/gallery')}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <ArrowLeft size={24} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
              <h2 className="font-serif text-3xl text-white mb-2">
                Seamor & Lady Stephanie
              </h2>

              <p className="text-white/80 text-lg">
                Uploaded by {currentItem.uploaderName}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 6, ease: 'linear' }
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src={currentItem.url}
            alt="Slideshow"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

    </div>
  );
}