/**
 * NUMU Frontend Asset Registry
 * Centralized, type-safe repository of all static image assets, paths, dimensions, and metadata.
 * All image files live inside `public/assets/{brand,avatars,cards,badges,landing}`.
 */

export const ASSETS = {
  brand: {
    logo: {
      src: '/assets/brand/numu-nav-logo.png',
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
      src: '/assets/avatars/student-3d-avatar.png',
      alt: 'Student 3D Character Avatar',
      width: 160,
      height: 160,
    },
  },
  hero: {
    dsaHeroCard: {
      src: '/assets/cards/dsa-hero-card.png',
      alt: 'DSA & Development Mastery Visual Banner',
      aspectRatio: '2525/1457',
    },
    dsaAssetCard: {
      src: '/assets/cards/dsa-asset-card.png',
      alt: 'Data Structures and Algorithms Concept Card',
      aspectRatio: '2525/1457',
    },
  },
  landing: {
    pillars: {
      dsa: {
        src: '/assets/landing/pillars/pillar-dsa.jpg',
        alt: 'Pattern-First DSA Curriculum & Judge0 IDE',
      },
      dev: {
        src: '/assets/landing/pillars/pillar-dev.jpg',
        alt: 'Project-Driven Full-Stack Development',
      },
      sysdesign: {
        src: '/assets/landing/pillars/pillar-sysdesign.jpg',
        alt: 'System Design & Core CS Hub',
      },
      tests: {
        src: '/assets/landing/pillars/pillar-tests.jpg',
        alt: 'Timed Mock Tests, Streaks & Public Profiles',
      },
    },
    bento: {
      streak: {
        src: '/assets/landing/bento/bento-streak.jpg',
        alt: '21-Day Activity Matrix & Streaks',
      },
      analytics: {
        src: '/assets/landing/bento/bento-analytics.jpg',
        alt: 'Deep Topic Mastery Analytics',
      },
      leaderboard: {
        src: '/assets/landing/bento/bento-leaderboard.jpg',
        alt: 'Live Campus & Global Leaderboards',
      },
      notes: {
        src: '/assets/landing/bento/bento-notes.svg',
        alt: 'In-Editor Notes & Bookmarks',
      },
      profile: {
        src: '/assets/landing/bento/bento-profile.svg',
        alt: 'Verified Developer Profile',
      },
      theme: {
        src: '/assets/landing/bento/bento-theme.svg',
        alt: 'Dark & Light Workspace Themes',
      },
    },
    campus: {
      placementCell: {
        src: '/assets/landing/campus/case-campus-1.jpg',
        alt: 'CSE & IT Placement Cell Analytics',
      },
      automatedOAs: {
        src: '/assets/landing/campus/case-campus-2.jpg',
        alt: 'Automated Proctored Coding Assessments',
      },
      developerCohort: {
        src: '/assets/landing/campus/case-campus-3.jpg',
        alt: 'Student Developer Club Streak Culture',
      },
    },
  },
} as const;

export const LANDING_PILLAR_IMAGES = [
  ASSETS.landing.pillars.dsa.src,
  ASSETS.landing.pillars.dev.src,
  ASSETS.landing.pillars.sysdesign.src,
  ASSETS.landing.pillars.tests.src,
] as const;

export const LANDING_BENTO_IMAGES = [
  ASSETS.landing.bento.streak.src,
  ASSETS.landing.bento.analytics.src,
  ASSETS.landing.bento.leaderboard.src,
  ASSETS.landing.bento.notes.src,
  ASSETS.landing.bento.profile.src,
  ASSETS.landing.bento.theme.src,
] as const;

export const LANDING_CAMPUS_IMAGES = [
  ASSETS.landing.campus.placementCell.src,
  ASSETS.landing.campus.automatedOAs.src,
  ASSETS.landing.campus.developerCohort.src,
] as const;

export type AssetCategory = keyof typeof ASSETS;
