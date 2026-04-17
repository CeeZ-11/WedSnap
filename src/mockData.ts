import { MediaItem } from './types';

export const mockGalleryItems: MediaItem[] = [
{
  id: '1',
  type: 'photo',
  url: 'https://picsum.photos/id/1015/800/1200',
  thumbnailUrl: 'https://picsum.photos/id/1015/400/600',
  uploaderName: 'Aunt Sarah',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
},
{
  id: '2',
  type: 'photo',
  url: 'https://picsum.photos/id/1016/1200/800',
  thumbnailUrl: 'https://picsum.photos/id/1016/600/400',
  uploaderName: 'Michael B.',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5)
},
{
  id: '3',
  type: 'photo',
  url: 'https://picsum.photos/id/1025/800/800',
  thumbnailUrl: 'https://picsum.photos/id/1025/400/400',
  uploaderName: 'Jessica',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12)
},
{
  id: '4',
  type: 'photo',
  url: 'https://picsum.photos/id/1043/800/1000',
  thumbnailUrl: 'https://picsum.photos/id/1043/400/500',
  uploaderName: 'Uncle Tom',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
},
{
  id: '5',
  type: 'photo',
  url: 'https://picsum.photos/id/1044/1200/800',
  thumbnailUrl: 'https://picsum.photos/id/1044/600/400',
  uploaderName: 'Emma & Dan',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26)
},
{
  id: '6',
  type: 'photo',
  url: 'https://picsum.photos/id/1050/800/1200',
  thumbnailUrl: 'https://picsum.photos/id/1050/400/600',
  uploaderName: 'College Crew',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)
},
{
  id: '7',
  type: 'photo',
  url: 'https://picsum.photos/id/1062/1000/1000',
  thumbnailUrl: 'https://picsum.photos/id/1062/500/500',
  uploaderName: 'Mom',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50)
},
{
  id: '8',
  type: 'photo',
  url: 'https://picsum.photos/id/1074/800/1200',
  thumbnailUrl: 'https://picsum.photos/id/1074/400/600',
  uploaderName: 'David',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72)
}];