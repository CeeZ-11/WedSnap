import { useRef, useState } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';
import guestNames from '../data/guestNames.json';

const MAX_FILE_SIZE_BYTES = 90 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
]);
const ACCEPTED_FILE_TYPES_ATTRIBUTE = [...ACCEPTED_FILE_TYPES].join(',');
const sortedGuestNames = [...guestNames].sort((a, b) => a.localeCompare(b));

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [nameSuggestionsOpen, setNameSuggestionsOpen] = useState(false);
  const [activeNameSuggestion, setActiveNameSuggestion] = useState(-1);
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Upload availability is controlled by the Cloudflare Worker. Keep the
  // upload form visible in the frontend when the Worker has been opened.
  const uploadsEnabled = true;
  const apiUrl = import.meta.env.VITE_GALLERY_API_URL || '';
  const nameQuery = name.trim().toLocaleLowerCase();
  const nameSuggestions = nameQuery.length >= 2
    ? sortedGuestNames.filter((guestName) => guestName.toLocaleLowerCase().includes(nameQuery)).slice(0, 8)
    : [];

  const selectGuestName = (guestName: string) => {
    setName(guestName);
    setNameSuggestionsOpen(false);
    setActiveNameSuggestion(-1);
    setMessage('');
  };

  const uploadFiles = async () => {
    setMessage('');
    if (!name.trim() || !inviteCode.trim() || files.length === 0) {
      setMessage('Enter your name and invite code, then choose at least one file.');
      return;
    }
    if (!guestNames.includes(name.trim())) {
      setMessage('Choose your exact name from the guest suggestions.');
      return;
    }
    if (!/^[A-Z0-9]{4}$/.test(inviteCode)) {
      setMessage('Enter your four-character invite code.');
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
          <div className="space-y-2">
            <label htmlFor="upload-guest-name" className="block font-sans text-xs font-semibold uppercase tracking-[0.18em] text-deep-olive">Full Name</label>
            <p className="font-sans text-sm italic text-deep-olive/70">Type your name and select it from the suggestions.</p>
            <div className="relative">
              <input
                id="upload-guest-name"
                type="text"
                required
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={nameSuggestionsOpen && nameQuery.length >= 2}
                aria-controls={nameSuggestionsOpen && nameQuery.length >= 2 ? 'upload-guest-name-suggestions' : undefined}
                aria-activedescendant={activeNameSuggestion >= 0 ? `upload-guest-name-option-${activeNameSuggestion}` : undefined}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameSuggestionsOpen(true);
                  setActiveNameSuggestion(-1);
                  setMessage('');
                }}
                onFocus={() => setNameSuggestionsOpen(true)}
                onBlur={() => setNameSuggestionsOpen(false)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' && nameSuggestions.length > 0) {
                    event.preventDefault();
                    setNameSuggestionsOpen(true);
                    setActiveNameSuggestion((active) => Math.min(active + 1, nameSuggestions.length - 1));
                  } else if (event.key === 'ArrowUp' && nameSuggestions.length > 0) {
                    event.preventDefault();
                    setActiveNameSuggestion((active) => Math.max(active <= 0 ? 0 : active - 1, 0));
                  } else if (event.key === 'Enter' && nameSuggestionsOpen && nameSuggestions.length > 0) {
                    event.preventDefault();
                    selectGuestName(nameSuggestions[Math.max(activeNameSuggestion, 0)]);
                  } else if (event.key === 'Escape') {
                    setNameSuggestionsOpen(false);
                  }
                }}
                placeholder="Start typing your name"
                className="w-full border-x-0 border-b border-t-0 border-warm-beige bg-transparent px-0 py-3 text-left font-serif text-xl text-deep-olive placeholder:text-deep-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-olive focus-visible:ring-offset-2 transition-colors"
              />
              {nameSuggestionsOpen && nameQuery.length >= 2 && nameSuggestions.length > 0 && (
                <ul id="upload-guest-name-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-warm-beige bg-white py-1 shadow-md">
                  {nameSuggestions.map((guestName, index) => (
                    <li key={guestName} role="presentation">
                      <button
                        id={`upload-guest-name-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={activeNameSuggestion === index}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectGuestName(guestName)}
                        onMouseEnter={() => setActiveNameSuggestion(index)}
                        className={`w-full px-3 py-2 text-left font-serif text-lg text-deep-olive hover:bg-light-sage/30 focus-visible:bg-light-sage/30 focus-visible:outline-none ${activeNameSuggestion === index ? 'bg-light-sage/30' : ''}`}
                      >
                        {guestName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {nameSuggestionsOpen && nameQuery.length >= 2 && nameSuggestions.length === 0 && (
                <p className="absolute z-20 mt-1 w-full border border-warm-beige bg-white px-3 py-3 font-sans text-sm text-deep-olive/70 shadow-md" role="status">No matching name found.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="upload-invite-code" className="block font-sans text-xs font-semibold uppercase tracking-[0.18em] text-deep-olive">Invite Code</label>
            <input
              id="upload-invite-code"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={4}
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4))}
              placeholder="Four letters or numbers"
              className="w-full border-x-0 border-b border-t-0 border-warm-beige bg-transparent px-0 py-3 font-serif text-xl uppercase tracking-[0.22em] text-deep-olive placeholder:normal-case placeholder:tracking-normal placeholder:text-deep-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-olive focus-visible:ring-offset-2 transition-colors"
            />
            <p className="font-sans text-xs text-deep-olive/70">Enter the four-character code exactly as provided.</p>
          </div>
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
