export type MediaItem = {
  id: string;

  // optional now (Firebase doesn’t provide these yet)
  type?: 'photo' | 'video';

  url: string;
  thumbnailUrl?: string;

  uploaderName: string;

  timestamp?: Date;

  // ✅ ADD THIS (from Firebase)
  createdAt?: number;
};