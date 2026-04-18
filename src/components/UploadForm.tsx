import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle2,
  X,
} from 'lucide-react';

// Firebase
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

import {
  collection,
  addDoc
} from "firebase/firestore";

import { storage, db } from "../lib/firebase";

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------
  // Drag & Drop
  // ----------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // ----------------------------
  // 🔥 FINAL UPLOAD LOGIC
  // ----------------------------
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadState("uploading");
    setProgress(0);

    try {
      for (const file of files) {

        // Limit size
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const fileRef = ref(storage, `wedding/${fileName}`);

        const uploadTask = uploadBytesResumable(fileRef, file);

        // 🔥 Upload with real progress
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const percent =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

              setProgress(Math.round(percent));
            },
            (error) => reject(error),
            () => resolve()
          );
        });

        // 🔥 Immediately mark complete
        setProgress(100);

        // 🔥 Firestore (non-blocking)
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          addDoc(collection(db, "gallery"), {
            url,
            uploaderName: name || "Guest",
            createdAt: Date.now(),
          });
        });
      }

      // ✅ Success UI immediately
      setUploadState("success");
      setFiles([]);
      setName("");

      setTimeout(() => {
        setUploadState("idle");
        setProgress(0);
      }, 2500);

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("Upload failed");
      setUploadState("idle");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl mb-4 font-semibold text-deep-olive font-[Playfair Display]">
          Seamor & Lady Stephanie
        </h1>

        <p className="text-base md:text-lg text-deep-olive/70 font-sans">
          December 27, 2026
        </p>

        <p className="mt-2 text-sm md:text-base text-deep-olive/80 font-sans">
          Share your favorite moments with us!
        </p>
      </div>

      {/* Notice */}
      <div className="max-w-md mx-auto mb-6 px-4">
        <div className="text-center border border-light-sage/30 bg-light-sage/10 rounded-xl px-5 py-4">
          <p className="text-sm text-deep-olive font-medium">
            🚧 Wedding Snaps is currently in progress
          </p>
          <p className="text-xs text-deep-olive/70 mt-2">
            This feature will be fully available one day before the wedding 💛
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {uploadState === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-champagne/30 rounded-2xl p-8 text-center border border-warm-beige"
          >
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="font-serif text-2xl text-dark mb-2">
              Uploaded!
            </h3>

            <p className="text-dark/70">
              Thank you for sharing 💛
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-6">

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed cursor-pointer p-10 text-center ${
                isDragging
                  ? 'border-gold bg-gold/5'
                  : 'border-warm-beige bg-champagne/20 hover:bg-champagne/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*"
              />

              <Camera className="mx-auto mb-4 text-gold" size={28} />

              <p className="text-dark font-medium">Tap to select photos</p>
              <p className="text-dark/50 text-sm">or drag and drop</p>
            </div>

            {/* Files */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative p-2 border rounded-lg text-sm">
                    {file.name}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Name */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 border rounded-xl"
            />

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadState === "uploading"}
              className={`w-full py-3 rounded-xl text-white ${
                files.length === 0
                  ? "bg-warm-beige cursor-not-allowed"
                  : "bg-dark hover:bg-dark/90"
              }`}
            >
              {uploadState === "uploading"
                ? `Uploading... ${progress}%`
                : "Upload"}
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}