export type MediaItem = {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  uploaderName: string;
  timestamp: Date;
};