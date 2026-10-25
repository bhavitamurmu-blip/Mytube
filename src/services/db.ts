import { Video, User, VideoComment, CommentReply, NotificationItem, ReportedContent, Playlist, VideoCategory } from '../types';

// IndexedDB Helper for persistent Large Binary Storage (User-uploaded Video Blobs & Thumbnails)
const IDB_NAME = 'MyTube_MediaStore';
const IDB_STORE = 'videos_blobs';
const IDB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
}

export async function saveMediaBlob(id: string, file: Blob): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ id, data: file });
  } catch (err) {
    console.warn('Could not save media blob to IndexedDB:', err);
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result ? req.result.data : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Pre-seeded high quality real royalty-free videos
export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Big Buck Bunny - 4K Animated Short Film',
    description: 'A large and lovable rabbit deals with bullying forest creatures in this iconic open-source animation produced by the Blender Institute. Remastered in crisp 4K visual fidelity.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    duration: 596,
    durationFormatted: '9:56',
    views: 1425890,
    likes: 98450,
    dislikes: 1204,
    uploadDate: '3 days ago',
    uploadTimestamp: Date.now() - 3 * 86400000,
    category: 'Animation',
    tags: ['Animation', 'Blender', 'CGI', '4K', 'Comedy'],
    channel: {
      id: 'chan-blender',
      name: 'Blender Studio',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      subscribers: 852000,
      verified: true,
      description: 'Official Blender open-movie animation projects, showcases and 3D modeling tools.',
      joinedDate: 'Joined Jan 2021',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-2',
    title: 'Sintel - The Legendary Quest for Scales',
    description: 'Follow Sintel, a lonely young woman who embarks on a dangerous journey through deserts and frozen mountains to rescue a baby dragon she befriended.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    duration: 888,
    durationFormatted: '14:48',
    views: 3120400,
    likes: 184200,
    dislikes: 3100,
    uploadDate: '1 week ago',
    uploadTimestamp: Date.now() - 7 * 86400000,
    category: 'Animation',
    tags: ['Fantasy', 'Cinematic', 'Dragon', 'Story', 'Animation'],
    channel: {
      id: 'chan-blender',
      name: 'Blender Studio',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      subscribers: 852000,
      verified: true,
      description: 'Official Blender open-movie animation projects, showcases and 3D modeling tools.',
      joinedDate: 'Joined Jan 2021',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-3',
    title: 'Tears of Steel - Sci-Fi VFX Short in Amsterdam',
    description: 'In a dystopian future Amsterdam, a squad of veteran warriors and scientists attempt to stage an emergency cybernetic restoration to stop world destruction.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    duration: 734,
    durationFormatted: '12:14',
    views: 890520,
    likes: 64200,
    dislikes: 840,
    uploadDate: '2 weeks ago',
    uploadTimestamp: Date.now() - 14 * 86400000,
    category: 'Technology',
    tags: ['SciFi', 'VFX', 'Cyberpunk', 'Robotics', 'Technology'],
    channel: {
      id: 'chan-futuretech',
      name: 'Future Cinematic Lab',
      handle: '@FutureCinema',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      subscribers: 430000,
      verified: true,
      description: 'Pushing cinematic storytelling and visual effects forward.',
      joinedDate: 'Joined May 2022',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-4',
    title: 'Speed & Thrills: Mountain Pass Supercar Chase',
    description: 'High-octane driving through treacherous alpine switchbacks. Experience the roar of twin-turbo engines and precision aerodynamic maneuvering.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 450120,
    likes: 38200,
    dislikes: 210,
    uploadDate: '4 hours ago',
    uploadTimestamp: Date.now() - 4 * 3600000,
    category: 'Sports',
    tags: ['Supercars', 'Racing', 'Motorsport', 'Sports', 'Drifting'],
    channel: {
      id: 'chan-apex',
      name: 'Apex Velocity Racing',
      handle: '@ApexVelocity',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
      subscribers: 1250000,
      verified: true,
      description: 'Your premier destination for high-octane motorsport, track records, and telemetry.',
      joinedDate: 'Joined Aug 2020',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-5',
    title: 'Wildfire: Behind the Scenes with Extreme Firefighters',
    description: 'A deep look into the bravery and tactical science behind aerial firefighting and containment crews tackling immense wildfires across rugged terrain.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 298000,
    likes: 22400,
    dislikes: 190,
    uploadDate: '1 day ago',
    uploadTimestamp: Date.now() - 86400000,
    category: 'News',
    tags: ['Documentary', 'News', 'Firefighting', 'Nature', 'Heroism'],
    channel: {
      id: 'chan-chronicle',
      name: 'Global Dispatch News',
      handle: '@GlobalDispatch',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
      subscribers: 910000,
      verified: true,
      description: 'In-depth global investigative reports, frontline documentaries, and science journalism.',
      joinedDate: 'Joined Nov 2019',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-6',
    title: 'Electric Dreams: Synthwave Sunset Live Session',
    description: 'Relax, code, or drive to this atmospheric analog synthwave performance featuring vintage Juno-106, Moog bass, and shimmering retrowave arpeggios.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 1209300,
    likes: 104500,
    dislikes: 420,
    uploadDate: '5 days ago',
    uploadTimestamp: Date.now() - 5 * 86400000,
    category: 'Music',
    tags: ['Synthwave', 'Music', 'LiveSession', 'Chill', 'LoFi'],
    channel: {
      id: 'chan-soundwave',
      name: 'Neon Frequency Records',
      handle: '@NeonFrequency',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
      subscribers: 620000,
      verified: true,
      description: 'Independent electronic music collective. Daily releases and ambient soundscapes.',
      joinedDate: 'Joined Feb 2022',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-7',
    title: 'Top 10 Quantum Computing Breakthroughs Explained',
    description: 'How qubits, superposition, and quantum entanglement are transforming cryptography, materials science, and computational physics. Explained simply with intuitive animations.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 742100,
    likes: 54100,
    dislikes: 480,
    uploadDate: '6 days ago',
    uploadTimestamp: Date.now() - 6 * 86400000,
    category: 'Education',
    tags: ['Quantum', 'Physics', 'Education', 'Science', 'Computing'],
    channel: {
      id: 'chan-mindcraft',
      name: 'OmniScience Hub',
      handle: '@OmniScience',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      subscribers: 1850000,
      verified: true,
      description: 'Making advanced sciences accessible, beautiful, and deeply engaging.',
      joinedDate: 'Joined Oct 2018',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-8',
    title: 'When Game Physics Completely Go Wild (Comedy Highlights)',
    description: 'A hilarious compilation of the most ridiculous ragdoll glitches, flying tanks, and physics engine blunders submitted by our gaming community.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 2450000,
    likes: 198000,
    dislikes: 1400,
    uploadDate: '3 days ago',
    uploadTimestamp: Date.now() - 3 * 86400000,
    category: 'Comedy',
    tags: ['Comedy', 'Gaming', 'Fails', 'Funny', 'Highlights'],
    channel: {
      id: 'chan-pixelpunch',
      name: 'Pixel Punch Gaming',
      handle: '@PixelPunch',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
      subscribers: 2400000,
      verified: true,
      description: 'Daily gaming fails, funny moments, and competitive highlights.',
      joinedDate: 'Joined Apr 2019',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-9',
    title: 'Elephant\'s Dream - Surreal Mechanical World',
    description: 'Proog and Emo explore the surreal, infinite mechanical depths of an enigmatic machine universe that bends to their differing perceptions of reality.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 653,
    durationFormatted: '10:53',
    views: 1890000,
    likes: 112000,
    dislikes: 920,
    uploadDate: '3 weeks ago',
    uploadTimestamp: Date.now() - 21 * 86400000,
    category: 'Animation',
    tags: ['Animation', 'Blender', 'Surreal', 'SciFi'],
    channel: {
      id: 'chan-blender',
      name: 'Blender Studio',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      subscribers: 852000,
      verified: true,
      description: 'Official Blender open-movie animation projects, showcases and 3D modeling tools.',
      joinedDate: 'Joined Jan 2021',
    },
    resolution: '1080p',
  },
  {
    id: 'vid-10',
    title: 'We Are Going On Bullrun - Desert Rally Championship',
    description: 'Raw onboard sound and aerial cinematic footage tracking high-powered offroad trophy trucks speeding through brutal Mojave terrain.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc0623a9686?w=800&auto=format&fit=crop&q=80',
    duration: 47,
    durationFormatted: '0:47',
    views: 520400,
    likes: 41200,
    dislikes: 310,
    uploadDate: '4 days ago',
    uploadTimestamp: Date.now() - 4 * 86400000,
    category: 'Sports',
    tags: ['Motorsport', 'Rally', 'Desert', 'Racing'],
    channel: {
      id: 'chan-apex',
      name: 'Apex Velocity Racing',
      handle: '@ApexVelocity',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
      subscribers: 1250000,
      verified: true,
      description: 'Your premier destination for high-octane motorsport, track records, and telemetry.',
      joinedDate: 'Joined Aug 2020',
    },
    resolution: '1080p',
  },
  // Shorts (Vertical Videos)
  {
    id: 'short-1',
    title: 'Wait for that impossible drift transition! 🔥',
    description: 'Precision drifting through the hairpin corner. Watch the tyre smoke! #Shorts #Drift #Supercars',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 4892000,
    likes: 382000,
    dislikes: 1200,
    uploadDate: 'Yesterday',
    uploadTimestamp: Date.now() - 86400000,
    category: 'Sports',
    tags: ['Shorts', 'Drift', 'Supercars'],
    channel: {
      id: 'chan-apex',
      name: 'Apex Velocity Racing',
      handle: '@ApexVelocity',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      subscribers: 1250000,
      verified: true,
    },
    isShort: true,
  },
  {
    id: 'short-2',
    title: 'The exact moment lightning ignited the ridge ⚡',
    description: 'Captured at 1000 FPS slow motion. Nature is magnificent! #Shorts #Storm #Nature',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 2190000,
    likes: 189000,
    dislikes: 800,
    uploadDate: '2 days ago',
    uploadTimestamp: Date.now() - 2 * 86400000,
    category: 'News',
    tags: ['Shorts', 'Nature', 'Lightning'],
    channel: {
      id: 'chan-chronicle',
      name: 'Global Dispatch News',
      handle: '@GlobalDispatch',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      subscribers: 910000,
      verified: true,
    },
    isShort: true,
  },
  {
    id: 'short-3',
    title: 'Synth bassline that makes you instantly groove 🎹',
    description: 'Analog synth magic in 60 seconds. Grab your headphones! #Shorts #Music #Producer',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 1840000,
    likes: 142000,
    dislikes: 450,
    uploadDate: '3 days ago',
    uploadTimestamp: Date.now() - 3 * 86400000,
    category: 'Music',
    tags: ['Shorts', 'Music', 'Synth'],
    channel: {
      id: 'chan-soundwave',
      name: 'Neon Frequency Records',
      handle: '@NeonFrequency',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      subscribers: 620000,
      verified: true,
    },
    isShort: true,
  },
  {
    id: 'short-4',
    title: 'Top 3 Coding Shortcuts that will double your speed 🚀',
    description: 'Multi-cursor wizardry you need in your daily developer workflow. #Shorts #Coding #Tech',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    durationFormatted: '0:15',
    views: 3104000,
    likes: 278000,
    dislikes: 900,
    uploadDate: '4 days ago',
    uploadTimestamp: Date.now() - 4 * 86400000,
    category: 'Technology',
    tags: ['Shorts', 'Code', 'Productivity'],
    channel: {
      id: 'chan-mindcraft',
      name: 'OmniScience Hub',
      handle: '@OmniScience',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subscribers: 1850000,
      verified: true,
    },
    isShort: true,
  },
];

// Pre-seeded demo comments
export const INITIAL_COMMENTS: Record<string, VideoComment[]> = {
  'vid-1': [
    {
      id: 'comm-101',
      videoId: 'vid-1',
      userId: 'user-demo-1',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'Big Buck Bunny will forever be the benchmark! Seeing this in modern 4K brings back so many memories of when open source 3D tools first proved themselves.',
      timestamp: '2 days ago',
      likes: 124,
      replies: [
        {
          id: 'rep-101-1',
          userId: 'chan-blender',
          userName: 'Blender Studio',
          userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
          text: 'Thank you Elena! The open source community continues to push the boundaries every day.',
          timestamp: '1 day ago',
          likes: 48,
        },
      ],
    },
    {
      id: 'comm-102',
      videoId: 'vid-1',
      userId: 'user-demo-2',
      userName: 'Marcus Vance',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      text: 'The character rigging on that squirrel is still top tier comic timing. Bravo!',
      timestamp: '1 day ago',
      likes: 56,
      replies: [],
    },
  ],
  'vid-2': [
    {
      id: 'comm-201',
      videoId: 'vid-2',
      userId: 'user-demo-3',
      userName: 'Sophie Lin',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      text: 'The ending of Sintel breaks my heart every single time. The emotional depth Blender achieved here is unbelievable.',
      timestamp: '5 days ago',
      likes: 310,
      replies: [],
    },
  ],
};

// Demo user accounts
export const DEMO_USERS: User[] = [
  {
    id: 'user-creator',
    name: 'Sarah Jenkins',
    email: 'sarah@mytube.com',
    handle: '@SarahJenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    bio: 'Digital creator, animator & tech enthusiast. Creating stories that resonate and tutorials that inspire.',
    role: 'creator',
    status: 'active',
    subscribedChannelIds: ['chan-blender', 'chan-soundwave', 'chan-mindcraft'],
    likedVideoIds: ['vid-1', 'vid-6', 'short-1'],
    dislikedVideoIds: [],
    watchLaterVideoIds: ['vid-3', 'vid-7'],
    history: [
      { videoId: 'vid-1', watchedAt: Date.now() - 3600000 },
      { videoId: 'vid-6', watchedAt: Date.now() - 7200000 },
    ],
    playlists: [
      {
        id: 'play-1',
        title: 'Favorite Animation Gems',
        description: 'Groundbreaking 3D animation shorts and CGI masterpieces.',
        userId: 'user-creator',
        videoIds: ['vid-1', 'vid-2', 'vid-9'],
        createdAt: 'Oct 2026',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'play-2',
        title: 'Deep Focus Chill & Code',
        description: 'Ambient synthwave tracks for uninterrupted productivity.',
        userId: 'user-creator',
        videoIds: ['vid-6'],
        createdAt: 'Oct 2026',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'user-admin',
    name: 'Alex Rivera (Admin)',
    email: 'admin@mytube.com',
    handle: '@MyTubeAdmin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    bio: 'MyTube Platform Administrator & Safety Operations Lead.',
    role: 'admin',
    status: 'active',
    subscribedChannelIds: ['chan-blender', 'chan-apex', 'chan-chronicle'],
    likedVideoIds: ['vid-3'],
    dislikedVideoIds: [],
    watchLaterVideoIds: [],
    history: [],
    playlists: [],
  },
  {
    id: 'user-guest',
    name: 'Jordan Lee',
    email: 'jordan@mytube.com',
    handle: '@JordanLee',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Casual video lover, gamer and podcast listener.',
    role: 'user',
    status: 'active',
    subscribedChannelIds: ['chan-pixelpunch'],
    likedVideoIds: ['vid-8'],
    dislikedVideoIds: [],
    watchLaterVideoIds: ['vid-1'],
    history: [],
    playlists: [],
  },
];

// Seeded notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-creator',
    title: 'New Video from Blender Studio',
    message: 'Blender Studio just uploaded "Sintel - The Legendary Quest for Scales"',
    timestamp: '2 hours ago',
    read: false,
    videoId: 'vid-2',
    channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    type: 'upload',
  },
  {
    id: 'notif-2',
    userId: 'user-creator',
    title: 'New Reply to Your Comment',
    message: 'Blender Studio replied to your comment on "Big Buck Bunny"',
    timestamp: '5 hours ago',
    read: false,
    videoId: 'vid-1',
    channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    type: 'comment',
  },
  {
    id: 'notif-3',
    userId: 'user-creator',
    title: 'Creator Milestone Reached! 🎉',
    message: 'Your channel hit 500 total views across all uploads!',
    timestamp: '1 day ago',
    read: true,
    type: 'milestone',
  },
];

// Seeded content moderation reports for Admin panel
export const INITIAL_REPORTS: ReportedContent[] = [
  {
    id: 'rep-1',
    videoId: 'vid-5',
    videoTitle: 'Wildfire: Behind the Scenes with Extreme Firefighters',
    videoThumbnail: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&auto=format&fit=crop&q=80',
    channelName: 'Global Dispatch News',
    reportedByUserId: 'user-guest',
    reportedByUserName: 'Jordan Lee',
    reason: 'inappropriate',
    notes: 'Intense fire hazards shown without warning tags.',
    timestamp: '6 hours ago',
    status: 'pending',
  },
];

// LocalStorage Keys
const STORAGE_KEYS = {
  VIDEOS: 'mytube_videos_v2',
  USERS: 'mytube_users_v2',
  CURRENT_USER_ID: 'mytube_current_user_id_v2',
  COMMENTS: 'mytube_comments_v2',
  NOTIFICATIONS: 'mytube_notifications_v2',
  REPORTS: 'mytube_reports_v2',
  SEARCH_HISTORY: 'mytube_search_history_v2',
  THEME: 'mytube_theme_preference',
};

// Database Service Implementation
class DatabaseService {
  private videos: Video[] = [];
  private users: User[] = [];
  private currentUserId: string | null = null;
  private comments: Record<string, VideoComment[]> = {};
  private notifications: NotificationItem[] = [];
  private reports: ReportedContent[] = [];
  private searchHistory: string[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load or seed Videos
    const savedVideos = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (savedVideos) {
      try {
        this.videos = JSON.parse(savedVideos);
      } catch {
        this.videos = [...INITIAL_VIDEOS];
      }
    } else {
      this.videos = [...INITIAL_VIDEOS];
      this.saveVideos();
    }

    // Load or seed Users
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers);
      } catch {
        this.users = [...DEMO_USERS];
      }
    } else {
      this.users = [...DEMO_USERS];
      this.saveUsers();
    }

    // Load Current User
    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedUserId && this.users.some(u => u.id === savedUserId)) {
      this.currentUserId = savedUserId;
    } else {
      // Default to the creator demo account
      this.currentUserId = 'user-creator';
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    }

    // Load Comments
    const savedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (savedComments) {
      try {
        this.comments = JSON.parse(savedComments);
      } catch {
        this.comments = { ...INITIAL_COMMENTS };
      }
    } else {
      this.comments = { ...INITIAL_COMMENTS };
      this.saveComments();
    }

    // Load Notifications
    const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (savedNotifs) {
      try {
        this.notifications = JSON.parse(savedNotifs);
      } catch {
        this.notifications = [...INITIAL_NOTIFICATIONS];
      }
    } else {
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.saveNotifications();
    }

    // Load Reports
    const savedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (savedReports) {
      try {
        this.reports = JSON.parse(savedReports);
      } catch {
        this.reports = [...INITIAL_REPORTS];
      }
    } else {
      this.reports = [...INITIAL_REPORTS];
      this.saveReports();
    }

    // Load Search History
    const savedSearch = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    if (savedSearch) {
      try {
        this.searchHistory = JSON.parse(savedSearch);
      } catch {
        this.searchHistory = ['Blender animation', 'Supercar racing', 'Synthwave live', 'Quantum computing'];
      }
    } else {
      this.searchHistory = ['Blender animation', 'Supercar racing', 'Synthwave live', 'Quantum computing'];
      this.saveSearchHistory();
    }
  }

  private saveVideos() {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(this.videos));
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private saveComments() {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
  }

  private saveNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
  }

  private saveReports() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
  }

  private saveSearchHistory() {
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(this.searchHistory));
  }

  // --- Auth & User Operations ---
  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  public setCurrentUser(userId: string | null): User | null {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    return this.getCurrentUser();
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public login(email: string): { user: User | null; error?: string } {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { user: null, error: 'User with this email not found. You can Sign Up or use a quick demo account.' };
    }
    if (user.status === 'suspended') {
      return { user: null, error: 'This account has been suspended by an administrator.' };
    }
    this.setCurrentUser(user.id);
    return { user };
  }

  public signup(name: string, email: string, handle: string): { user: User | null; error?: string } {
    if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      handle: cleanHandle,
      avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: `Hello! I am ${name}. Welcome to my channel on MyTube!`,
      role: 'user',
      status: 'active',
      subscribedChannelIds: ['chan-blender'],
      likedVideoIds: [],
      dislikedVideoIds: [],
      watchLaterVideoIds: [],
      history: [],
      playlists: [],
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setCurrentUser(newUser.id);
    return { user: newUser };
  }

  public updateUserProfile(updates: Partial<User>): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users = this.users.map(u => (u.id === user.id ? updated : u));
    this.saveUsers();
    return updated;
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended'): void {
    this.users = this.users.map(u => (u.id === userId ? { ...u, status } : u));
    this.saveUsers();
  }

  // --- Video CRUD Operations ---
  public getVideos(category?: VideoCategory, search?: string): Video[] {
    let list = [...this.videos];
    if (category && category !== 'All') {
      if (category === 'Trending') {
        list = list.sort((a, b) => b.views - a.views);
      } else {
        list = list.filter(v => v.category === category);
      }
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.channel.handle.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getShorts(): Video[] {
    return this.videos.filter(v => v.isShort);
  }

  public getVideoById(id: string): Video | null {
    return this.videos.find(v => v.id === id) || null;
  }

  public async addVideo(videoData: Omit<Video, 'id' | 'views' | 'likes' | 'dislikes' | 'uploadDate' | 'uploadTimestamp'>, videoBlob?: Blob): Promise<Video> {
    const id = `user-vid-${Date.now()}`;
    const newVideo: Video = {
      ...videoData,
      id,
      views: 1,
      likes: 0,
      dislikes: 0,
      uploadDate: 'Just now',
      uploadTimestamp: Date.now(),
      isUserUploaded: true,
    };

    if (videoBlob) {
      await saveMediaBlob(id, videoBlob);
    }

    this.videos.unshift(newVideo);
    this.saveVideos();

    // Trigger notification to users who follow this creator
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Video Published Successfully!',
        message: `"${newVideo.title}" is now live and processing in 1080p.`,
        timestamp: 'Just now',
        read: false,
        videoId: newVideo.id,
        type: 'upload',
      });
      this.saveNotifications();
    }

    return newVideo;
  }

  public updateVideo(id: string, updates: Partial<Video>): Video | null {
    const video = this.getVideoById(id);
    if (!video) return null;
    const updated = { ...video, ...updates };
    this.videos = this.videos.map(v => (v.id === id ? updated : v));
    this.saveVideos();
    return updated;
  }

  public deleteVideo(id: string): boolean {
    const prevLen = this.videos.length;
    this.videos = this.videos.filter(v => v.id !== id);
    if (this.videos.length !== prevLen) {
      this.saveVideos();
      return true;
    }
    return false;
  }

  public recordView(id: string): void {
    const video = this.getVideoById(id);
    if (video) {
      video.views += 1;
      this.saveVideos();
    }
  }

  // --- Likes & Social Actions ---
  public toggleLike(videoId: string): { isLiked: boolean; likes: number; isDisliked: boolean } {
    const user = this.getCurrentUser();
    const video = this.getVideoById(videoId);
    if (!user || !video) return { isLiked: false, likes: 0, isDisliked: false };

    const hasLiked = user.likedVideoIds.includes(videoId);
    const hasDisliked = user.dislikedVideoIds.includes(videoId);

    if (hasLiked) {
      user.likedVideoIds = user.likedVideoIds.filter(id => id !== videoId);
      video.likes = Math.max(0, video.likes - 1);
    } else {
      user.likedVideoIds.push(videoId);
      video.likes += 1;
      if (hasDisliked) {
        user.dislikedVideoIds = user.dislikedVideoIds.filter(id => id !== videoId);
        video.dislikes = Math.max(0, video.dislikes - 1);
      }
    }

    this.saveUsers();
    this.saveVideos();
    return {
      isLiked: !hasLiked,
      likes: video.likes,
      isDisliked: user.dislikedVideoIds.includes(videoId),
    };
  }

  public toggleDislike(videoId: string): { isDisliked: boolean; dislikes: number; isLiked: boolean } {
    const user = this.getCurrentUser();
    const video = this.getVideoById(videoId);
    if (!user || !video) return { isDisliked: false, dislikes: 0, isLiked: false };

    const hasDisliked = user.dislikedVideoIds.includes(videoId);
    const hasLiked = user.likedVideoIds.includes(videoId);

    if (hasDisliked) {
      user.dislikedVideoIds = user.dislikedVideoIds.filter(id => id !== videoId);
      video.dislikes = Math.max(0, video.dislikes - 1);
    } else {
      user.dislikedVideoIds.push(videoId);
      video.dislikes += 1;
      if (hasLiked) {
        user.likedVideoIds = user.likedVideoIds.filter(id => id !== videoId);
        video.likes = Math.max(0, video.likes - 1);
      }
    }

    this.saveUsers();
    this.saveVideos();
    return {
      isDisliked: !hasDisliked,
      dislikes: video.dislikes,
      isLiked: user.likedVideoIds.includes(videoId),
    };
  }

  // --- Subscriptions ---
  public toggleSubscribe(channelId: string): { isSubscribed: boolean; subscribers: number } {
    const user = this.getCurrentUser();
    if (!user) return { isSubscribed: false, subscribers: 0 };

    const isSubscribed = user.subscribedChannelIds.includes(channelId);
    let newSubCount = 0;

    if (isSubscribed) {
      user.subscribedChannelIds = user.subscribedChannelIds.filter(id => id !== channelId);
    } else {
      user.subscribedChannelIds.push(channelId);
    }

    // Update all video records matching this channel
    this.videos.forEach(v => {
      if (v.channel.id === channelId) {
        v.channel.subscribers += isSubscribed ? -1 : 1;
        newSubCount = v.channel.subscribers;
      }
    });

    this.saveUsers();
    this.saveVideos();
    return { isSubscribed: !isSubscribed, subscribers: Math.max(0, newSubCount) };
  }

  // --- Watch History ---
  public addToHistory(videoId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;
    // Remove if already in history so it moves to front
    user.history = user.history.filter(h => h.videoId !== videoId);
    user.history.unshift({ videoId, watchedAt: Date.now() });
    // Limit to 100 history items
    if (user.history.length > 100) {
      user.history.pop();
    }
    this.saveUsers();
  }

  public removeFromHistory(videoId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;
    user.history = user.history.filter(h => h.videoId !== videoId);
    this.saveUsers();
  }

  public clearHistory(): void {
    const user = this.getCurrentUser();
    if (!user) return;
    user.history = [];
    this.saveUsers();
  }

  // --- Watch Later ---
  public toggleWatchLater(videoId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const exists = user.watchLaterVideoIds.includes(videoId);
    if (exists) {
      user.watchLaterVideoIds = user.watchLaterVideoIds.filter(id => id !== videoId);
    } else {
      user.watchLaterVideoIds.unshift(videoId);
    }
    this.saveUsers();
    return !exists;
  }

  // --- Comments & Nested Replies ---
  public getComments(videoId: string): VideoComment[] {
    return this.comments[videoId] || [];
  }

  public addComment(videoId: string, text: string): VideoComment | null {
    const user = this.getCurrentUser();
    if (!user || !text.trim()) return null;

    const newComment: VideoComment = {
      id: `comm-${Date.now()}`,
      videoId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
      replies: [],
    };

    if (!this.comments[videoId]) {
      this.comments[videoId] = [];
    }
    this.comments[videoId].unshift(newComment);
    this.saveComments();
    return newComment;
  }

  public addReply(videoId: string, commentId: string, text: string): CommentReply | null {
    const user = this.getCurrentUser();
    if (!user || !text.trim()) return null;

    const commentList = this.comments[videoId];
    if (!commentList) return null;

    const targetComment = commentList.find(c => c.id === commentId);
    if (!targetComment) return null;

    const newReply: CommentReply = {
      id: `rep-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
    };

    targetComment.replies.push(newReply);
    this.saveComments();
    return newReply;
  }

  public toggleCommentLike(videoId: string, commentId: string): number {
    const commentList = this.comments[videoId];
    if (!commentList) return 0;
    const comment = commentList.find(c => c.id === commentId);
    if (!comment) return 0;
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    this.saveComments();
    return comment.likes;
  }

  // --- Playlists ---
  public createPlaylist(title: string, description?: string): Playlist | null {
    const user = this.getCurrentUser();
    if (!user || !title.trim()) return null;

    const newPlaylist: Playlist = {
      id: `play-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      userId: user.id,
      videoIds: [],
      createdAt: 'Just now',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    };

    user.playlists.push(newPlaylist);
    this.saveUsers();
    return newPlaylist;
  }

  public toggleVideoInPlaylist(playlistId: string, videoId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const pl = user.playlists.find(p => p.id === playlistId);
    if (!pl) return false;

    const exists = pl.videoIds.includes(videoId);
    if (exists) {
      pl.videoIds = pl.videoIds.filter(id => id !== videoId);
    } else {
      pl.videoIds.push(videoId);
      // Update thumbnail to this video's thumbnail
      const video = this.getVideoById(videoId);
      if (video) pl.thumbnailUrl = video.thumbnailUrl;
    }
    this.saveUsers();
    return !exists;
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return this.notifications.filter(n => n.userId === user.id || n.type === 'system');
  }

  public markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications();
  }

  public markAllNotificationsAsRead(): void {
    const user = this.getCurrentUser();
    if (!user) return;
    this.notifications = this.notifications.map(n =>
      n.userId === user.id ? { ...n, read: true } : n
    );
    this.saveNotifications();
  }

  // --- Moderation Reports ---
  public reportVideo(videoId: string, reason: ReportedContent['reason'], notes?: string): boolean {
    const user = this.getCurrentUser();
    const video = this.getVideoById(videoId);
    if (!user || !video) return false;

    const newReport: ReportedContent = {
      id: `rep-${Date.now()}`,
      videoId,
      videoTitle: video.title,
      videoThumbnail: video.thumbnailUrl,
      channelName: video.channel.name,
      reportedByUserId: user.id,
      reportedByUserName: user.name,
      reason,
      notes,
      timestamp: 'Just now',
      status: 'pending',
    };

    this.reports.unshift(newReport);
    this.saveReports();
    return true;
  }

  public getReports(): ReportedContent[] {
    return [...this.reports];
  }

  public resolveReport(reportId: string, action: 'keep' | 'remove'): void {
    const rep = this.reports.find(r => r.id === reportId);
    if (!rep) return;
    rep.status = action === 'remove' ? 'removed' : 'reviewed';
    if (action === 'remove') {
      this.deleteVideo(rep.videoId);
    }
    this.saveReports();
  }

  // --- Search History ---
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  public addSearchQuery(query: string): void {
    if (!query.trim()) return;
    const clean = query.trim();
    this.searchHistory = [clean, ...this.searchHistory.filter(q => q.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    this.saveSearchHistory();
  }

  public clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }
}

export const db = new DatabaseService();
