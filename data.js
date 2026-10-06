// ============================================================
// Zenith's Portfolio — CONTENT FILE (data.js)
// ============================================================
// Edit this file to add or update your video links and info.
// The site also lets you paste links via the "+ Add a piece" button in the header!
// ============================================================

const PORTFOLIO_CONFIG = {
  name: "Zenith Onta",
  shortName: "ZENITH",
  year: 2026,
  roles: ["Video Editor", "Colorist", "Motion Designer"],
  tagline:
    "I turn raw footage into scroll-stopping stories — reels, YouTube videos, and brand films with color and motion that keep people watching.",
  location: "Kathmandu, Nepal",
  timezoneLabel: "NPT",
  contact: {
    email: "ontazenith@gmail.com",
    phone: "+977 9849987127",
    whatsapp: "9779849987127", // country code + number, no "+" or spaces
    address: "Samakhusi, Kathmandu"
  },
  socials: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
    behance: ""
  },
  formEndpoint: "https://formsubmit.co/ajax/ontazenith@gmail.com"
};

// Colors palette matching portfolio-lab:
// #bcdcff (soft blue) | #dfff62 (acid lime) | #ff735f (signal coral) | #cdbdff (lavender) | #bde8d5 (mint)

const PORTFOLIO_ITEMS = [
  {
    id: "g-1",
    title: "Project 01 — Kinetic Cut",
    category: "motion",
    role: "Edit & VFX",
    year: "2025",
    orientation: "landscape",
    color: "#bcdcff",
    glyph: "01",
    duration: "01:14",
    featured: true,
    description: "High-energy commercial cut with dynamic speed ramps and kinetic typography.",
    url: "https://drive.google.com/file/d/1XM71ah5tXUZaPjTwJRnOOKmlz0aCpKE7/view?usp=drive_link"
  },
  {
    id: "g-5",
    title: "Project 05 — Vertical Reel",
    category: "reels",
    role: "Short-form Reel",
    year: "2025",
    orientation: "portrait",
    color: "#dfff62",
    glyph: "05",
    duration: "00:32",
    featured: true,
    description: "Fast-paced vertical edit built for social retention, sound design, and clean captions.",
    url: "https://drive.google.com/file/d/1CnIUTCv1ZRUOEDOTpPSSMBOQrXQJUnMi/view?usp=drive_link"
  },
  {
    id: "g-2",
    title: "Project 02 — Cinematic Story",
    category: "cinematic",
    role: "Edit & Color",
    year: "2024",
    orientation: "landscape",
    color: "#ff735f",
    glyph: "02",
    duration: "02:18",
    featured: true,
    description: "Narrative edit with warm cinematic color grading and subtle soundscape design.",
    url: "https://drive.google.com/file/d/1Hd1FeEJXDtPzRqRe3OoK34SwhOCiGzpc/view?usp=drive_link"
  },
  {
    id: "g-8",
    title: "Project 08 — Brand Reel",
    category: "reels",
    role: "Short-form Edit",
    year: "2024",
    orientation: "portrait",
    color: "#cdbdff",
    glyph: "08",
    duration: "00:45",
    featured: true,
    description: "9:16 social cut crafted for Instagram and TikTok with seamless transition rhythm.",
    url: "https://drive.google.com/file/d/12HLZvtPo6FG8yZ2fuIKJY67gsJDZpxoa/view?usp=drive_link"
  },
  {
    id: "g-3",
    title: "Project 03 — Motion Sequence",
    category: "motion",
    role: "Edit & VFX",
    year: "2024",
    orientation: "landscape",
    color: "#bde8d5",
    glyph: "03",
    duration: "01:40",
    featured: false,
    description: "After Effects compositing, clean title animations, and visual accents.",
    url: "https://drive.google.com/file/d/1Db5AM9tSjAKnx4ZTo0vyNl2WXDIEVIWs/view?usp=drive_link"
  },
  {
    id: "g-4",
    title: "Project 04 — Color Grading Reel",
    category: "colorgrading",
    role: "DaVinci Resolve Grade",
    year: "2024",
    orientation: "landscape",
    color: "#dfff62",
    glyph: "04",
    duration: "01:05",
    featured: false,
    description: "DaVinci Resolve color transformation from flat LOG profile to rich cinematic tones.",
    url: "https://drive.google.com/file/d/1hzmlX8_Rxba2LrPK7w7un-ZrQUcF9lOk/view?usp=drive_link"
  },
  {
    id: "g-10",
    title: "Project 10 — Creator Short",
    category: "reels",
    role: "Short-form Reel",
    year: "2024",
    orientation: "portrait",
    color: "#bcdcff",
    glyph: "10",
    duration: "00:28",
    featured: false,
    description: "Snappy creator video with hook-first pacing, zoom punch-ins, and animated subtitles.",
    url: "https://drive.google.com/file/d/15ScMeTdfZKfy6sR9zW_lxu5K4yC7Pbqj/view?usp=drive_link"
  },
  {
    id: "g-6",
    title: "Project 06 — Atmosphere Cut",
    category: "cinematic",
    role: "Edit & Color",
    year: "2024",
    orientation: "landscape",
    color: "#ff735f",
    glyph: "06",
    duration: "02:04",
    featured: false,
    description: "Moody, character-driven edit prioritizing rhythm and emotional texture.",
    url: "https://drive.google.com/file/d/1zEA44EkSzTjFnFX_sQ9YLzC8GN4QGH_g/view?usp=drive_link"
  },
  {
    id: "g-12",
    title: "Project 12 — Fashion Reel",
    category: "reels",
    role: "Short-form Edit",
    year: "2024",
    orientation: "portrait",
    color: "#cdbdff",
    glyph: "12",
    duration: "00:30",
    featured: false,
    description: "Vertical fashion showcase with match cuts on the beat and stylish grade.",
    url: "https://drive.google.com/file/d/1_lIvYlmNc_9MFes3Evtx_BDbKVmmKHeU/view?usp=drive_link"
  },
  {
    id: "g-7",
    title: "Project 07 — Visual Effects",
    category: "motion",
    role: "Edit & VFX",
    year: "2024",
    orientation: "landscape",
    color: "#bde8d5",
    glyph: "07",
    duration: "01:22",
    featured: false,
    description: "Title animation, sky replacement, and object tracking for commercial polish.",
    url: "https://drive.google.com/file/d/120xmWrSLPbzUh7oYMwkh5C048W1mkw1a/view?usp=drive_link"
  },
  {
    id: "g-9",
    title: "Project 09 — Cinematic Travel",
    category: "cinematic",
    role: "Edit & Color",
    year: "2024",
    orientation: "landscape",
    color: "#dfff62",
    glyph: "09",
    duration: "02:30",
    featured: false,
    description: "Rich documentary-style travel sequence with natural soundscapes.",
    url: "https://drive.google.com/file/d/1UlTvjuIF4uoFnZf-6qaDiWZdLASxNw7I/view?usp=drive_link"
  },
  {
    id: "g-13",
    title: "Project 13 — Brand Commercial",
    category: "cinematic",
    role: "Edit & Color",
    year: "2024",
    orientation: "landscape",
    color: "#bcdcff",
    glyph: "13",
    duration: "01:50",
    featured: false,
    description: "Polished brand campaign piece with deliberate pacing and high-end grade.",
    url: "https://drive.google.com/file/d/1vk4ei61iMzlUl8-9v48wCh-CNToQ4aDI/view?usp=drive_link"
  }
];

const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "reels", label: "Reels & Shorts" },
  { id: "cinematic", label: "Cinematic & Brand" },
  { id: "colorgrading", label: "Color Grading" },
  { id: "motion", label: "Motion & VFX" }
];
