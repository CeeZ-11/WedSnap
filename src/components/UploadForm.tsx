import { useRef, useState } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 90 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
]);
const ACCEPTED_FILE_TYPES_ATTRIBUTE = [...ACCEPTED_FILE_TYPES].join(',');

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadsEnabled = import.meta.env.VITE_UPLOADS_ENABLED === 'true';
  const apiUrl = import.meta.env.VITE_GALLERY_API_URL || '';

  const uploadFiles = async () => {
    setMessage('');
    if (!name.trim() || !inviteCode.trim() || files.length === 0) {
      setMessage('Enter your name and invite code, then choose at least one file.');
      return;
    }
    if (files.some((file) => !ACCEPTED_FILE_TYPES.has(file.type.toLowerCase()))) {
      setMessage('Choose a JPEG, PNG, WebP, GIF, HEIC, MP4, MOV, or WebM file.');
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      setMessage('Each photo or video must be 90 MB or smaller.');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const response = await fetch(`${apiUrl}/api/uploads`, {
          method: 'POST',
          headers: {
            'content-type': file.type,
            'x-guest-name': name.trim(),
            'x-invite-code': inviteCode,
            'x-file-name': encodeURIComponent(file.name),
          },
          body: file,
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || 'Upload failed. Please try again.');
      }
      setUploaded(true);
      setFiles([]);
      setName('');
      setInviteCode('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl mb-4 font-semibold text-deep-olive font-[Playfair Display]">
          Seamor &amp; Lady Stephanie
        </h1>
        <p className="text-base md:text-lg text-deep-olive/70 font-sans">
          December 27, 2026
        </p>
        <p className="mt-2 text-sm md:text-base text-deep-olive/80 font-sans">
          Share your favorite moments with us!
        </p>
      </div>

      <div className="max-w-md mx-auto mb-6 px-4">
        <div className="text-center border border-light-sage/30 bg-light-sage/10 rounded-xl px-5 py-4">
          <p className="text-sm text-deep-olive font-medium">
            {uploadsEnabled ? 'Uploads are open' : 'Wedding gallery uploads are currently closed'}
          </p>
          <p className="text-xs text-deep-olive/70 mt-2">
            {uploadsEnabled
              ? 'Share photos and videos from the celebration.'
              : 'Uploads will open when the couple is ready. Please check back the day before the wedding.'}
          </p>
        </div>
      </div>

      {uploaded ? (
        <div className="rounded-2xl p-8 text-center border border-warm-beige bg-champagne/30">
          <CheckCircle2 className="mx-auto mb-3 text-gold" size={34} />
          <p className="font-serif text-2xl text-dark">Uploaded!</p>
          <p className="text-dark/70 mt-2">Thank you for sharing your memories.</p>
        </div>
      ) : uploadsEnabled ? (
        <div className="space-y-4">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name on the guest list" className="w-full p-3 border border-warm-beige rounded-xl bg-white" />
          <input type="password" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Your personal invite code" className="w-full p-3 border border-warm-beige rounded-xl bg-white" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-warm-beige bg-champagne/20 p-10 text-center hover:bg-champagne/40">
            <Camera className="mx-auto mb-4 text-gold" size={28} />
            <span className="block text-dark font-medium">Choose photos or videos</span>
            <span className="block text-dark/50 text-sm mt-1">Photos and videos up to 90 MB each</span>
          </button>
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES_ATTRIBUTE} className="hidden" onChange={(event) => { setFiles(Array.from(event.target.files || [])); setMessage(''); }} />
          {files.length > 0 && <ul className="space-y-2">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-warm-beige bg-white px-3 py-2 text-sm"><span className="truncate">{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(files.filter((_, i) => i !== index))} className="ml-2 text-dark/60"><X size={16} /></button></li>)}</ul>}
          {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
          <button type="button" onClick={uploadFiles} disabled={isUploading || files.length === 0} className="w-full py-3 rounded-xl bg-dark text-white hover:bg-dark/90 disabled:cursor-not-allowed disabled:bg-warm-beige">
            {isUploading ? 'Uploading…' : 'Upload to the wedding gallery'}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-warm-beige bg-champagne/20 p-10 text-center opacity-70">
          <Camera className="mx-auto mb-4 text-gold" size={28} />
          <p className="text-dark font-medium">Photo and video uploads are not open yet</p>
          <p className="text-dark/50 text-sm mt-2">No files can be uploaded while the gallery is closed.</p>
        </div>
      )}
    </div>
  );
}
