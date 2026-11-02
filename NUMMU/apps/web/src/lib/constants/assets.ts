/**
 * NUMU Frontend Asset Registry
 * Centralized, type-safe repository of all static image assets, paths, dimensions, and metadata.
 * Use these constants instead of hardcoded string paths to ensure maintainability,
 * refactor safety, and consistent accessibility metadata across pages and components.
 */

export const ASSETS = {
  brand: {
    logo: {
      src: '/numu-nav-logo.png',
      alt: 'NUMU Learning Platform Logo',
      width: 140,
      height: 40,
    },
    icon: {
      src: '/icon.png',
      alt: 'NUMU Favicon Icon',
      width: 48,
      height: 48,
    },
    favicon: {
      src: '/favicon.ico',
      alt: 'NUMU Favicon',
    },
  },
  avatars: {
    student3d: {
      src: '/student-3d-avatar.png',
      alt: 'Student 3D Character Avatar',
      width: 160,
      height: 160,
    },
  },
  hero: {
    dsaHeroCard: {
      src: '/assets/dsa-hero-card.png',
      alt: 'DSA & Development Mastery Visual Banner',
      aspectRatio: '2525/1457',
    },
    dsaAssetCard: {
      src: '/assets/dsa-asset-card.png',
      alt: 'Data Structures and Algorithms Concept Card',
      aspectRatio: '2525/1457',
    },
  },
} as const;

export type AssetCategory = keyof typeof ASSETS;
