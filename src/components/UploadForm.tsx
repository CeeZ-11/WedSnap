import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  CheckCircle2,
  X,
  Image as ImageIcon } from
'lucide-react';
export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<
    'idle' | 'uploading' | 'success'>(
    'idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const handleUpload = () => {
    if (files.length === 0) return;
    setUploadState('uploading');
    setProgress(0);
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadState('success');
            setFiles([]);
            setName('');
            // Reset after showing success
            setTimeout(() => setUploadState('idle'), 3000);
          }, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
  };
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-12">
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

      <AnimatePresence mode="wait">
        {uploadState === 'success' ?
        <motion.div
          key="success"
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0.9
          }}
          className="bg-champagne/30 rounded-2xl p-8 text-center border border-warm-beige">
          
            <motion.div
            initial={{
              scale: 0
            }}
            animate={{
              scale: 1
            }}
            transition={{
              type: 'spring',
              delay: 0.2
            }}
            className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
            
              <CheckCircle2 size={32} />
            </motion.div>
            <h3 className="font-serif text-2xl text-dark mb-2">
              Photos Uploaded!
            </h3>
            <p className="text-dark/70">
              Thank you for sharing these memories with us.
            </p>
          </motion.div> :

        <motion.div
          key="form"
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="space-y-6">
          
            {/* Drop Zone */}
            <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isDragging ? 'border-gold bg-gold/5 scale-[1.02]' : 'border-warm-beige bg-champagne/20 hover:bg-champagne/40'} p-10 text-center flex flex-col items-center justify-center min-h-[240px]`}>
            
              <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*,video/*" />
            

              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-gold">
                <Camera size={28} strokeWidth={1.5} />
              </div>

              <h3 className="font-medium text-dark text-lg mb-1">
                Tap to select photos
              </h3>
              <p className="text-dark/50 text-sm">or drag and drop them here</p>
            </div>

            {/* Selected Files Preview */}
            {files.length > 0 &&
          <div className="space-y-3">
                <h4 className="text-sm font-medium text-dark/70 px-1">
                  Selected ({files.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, index) =>
              <div
                key={index}
                className="relative group bg-white rounded-xl p-2 border border-warm-beige shadow-sm flex items-center space-x-2">
                
                      <div className="w-10 h-10 rounded bg-champagne flex items-center justify-center shrink-0 text-dark/40">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-xs text-dark truncate flex-1">
                        {file.name}
                      </span>
                      <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-warm-beige rounded-full flex items-center justify-center text-dark/50 hover:text-dark shadow-sm">
                  
                        <X size={12} />
                      </button>
                    </div>
              )}
                </div>
              </div>
          }

            {/* Name Input */}
            <div className="space-y-2">
              <label
              htmlFor="name"
              className="text-sm font-medium text-dark/70 px-1">
              
                Your Name (Optional)
              </label>
              <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aunt Sarah"
              className="w-full px-4 py-3 rounded-xl border border-warm-beige bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
            
            </div>

            {/* Upload Button */}
            <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadState === 'uploading'}
            className={`w-full py-4 rounded-xl font-medium text-white transition-all relative overflow-hidden ${files.length === 0 ? 'bg-warm-beige cursor-not-allowed' : 'bg-dark hover:bg-dark/90 active:scale-[0.98] shadow-md'}`}>
            
              {uploadState === 'uploading' ?
            <div className="flex items-center justify-center space-x-2">
                  <span className="relative z-10">
                    Uploading... {progress}%
                  </span>
                  <div
                className="absolute left-0 top-0 bottom-0 bg-gold/80 transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`
                }} />
              
                </div> :

            <div className="flex items-center justify-center space-x-2">
                  <Upload size={18} />
                  <span>
                    Upload {files.length > 0 ? `${files.length} files` : ''}
                  </span>
                </div>
            }
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}