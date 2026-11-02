'use client';

import React from 'react';

export type CharacterStickerType = 'male' | 'female' | 'cyber' | 'mascot';

interface CharacterAvatarProps {
  type?: CharacterStickerType | string | null | undefined;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modern illustrated developer character avatars / stickers.
 * High-definition SVG vectors with smooth gradients and tech accents.
 */
export function CharacterAvatar({
  type = 'male',
  className = 'w-full h-full',
  size = 'lg',
}: CharacterAvatarProps) {
  const normalizedType: CharacterStickerType =
    type === 'female' || type === 'sticker:female'
      ? 'female'
      : type === 'cyber' || type === 'sticker:cyber'
      ? 'cyber'
      : type === 'mascot' || type === 'sticker:mascot'
      ? 'mascot'
      : 'male';

  if (normalizedType === 'female') {
    // 👩‍💻 Female Developer Sticker: Tech headphones, stylish hair, confident developer smile, emerald & purple jacket
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="femBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#0b5c39" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="femSkin" x1="50" y1="35" x2="70" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba063" />
          </linearGradient>
          <linearGradient id="femHair" x1="30" y1="20" x2="90" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="femJacket" x1="20" y1="85" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Backdrop */}
        <rect width="120" height="120" rx="28" fill="url(#femBg)" />

        {/* Back Hair */}
        <path d="M32 45 C32 24, 88 24, 88 45 C88 68, 86 86, 78 92 C70 98, 50 98, 42 92 C34 86, 32 68, 32 45 Z" fill="url(#femHair)" />

        {/* Neck */}
        <path d="M52 68 L68 68 L68 82 L52 82 Z" fill="url(#femSkin)" opacity="0.9" />

        {/* Face */}
        <path d="M42 46 C42 34, 78 34, 78 46 C78 64, 72 74, 60 74 C48 74, 42 64, 42 46 Z" fill="url(#femSkin)" />

        {/* Cheeks */}
        <circle cx="48" cy="56" r="3.5" fill="#f43f5e" opacity="0.35" />
        <circle cx="72" cy="56" r="3.5" fill="#f43f5e" opacity="0.35" />

        {/* Eyes */}
        <circle cx="51" cy="50" r="2.8" fill="#1e293b" />
        <circle cx="69" cy="50" r="2.8" fill="#1e293b" />
        <circle cx="52" cy="49" r="0.9" fill="#ffffff" />
        <circle cx="70" cy="49" r="0.9" fill="#ffffff" />

        {/* Friendly Smile */}
        <path d="M54 62 Q60 67 66 62" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Modern Front Hair & Bangs */}
        <path d="M38 42 C40 28, 80 26, 82 42 C76 34, 66 32, 58 35 C50 38, 44 42, 38 42 Z" fill="#78350f" />
        <path d="M38 42 C36 54, 40 68, 42 70 C41 60, 42 50, 44 44 Z" fill="#78350f" />
        <path d="M82 42 C84 54, 80 68, 78 70 C79 60, 78 50, 76 44 Z" fill="#78350f" />

        {/* Tech Headband & Headphones */}
        <path d="M36 44 C36 28, 84 28, 84 44" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Left Earphone Cup */}
        <rect x="30" y="44" width="7" height="15" rx="3.5" fill="#c084fc" />
        {/* Right Earphone Cup */}
        <rect x="83" y="44" width="7" height="15" rx="3.5" fill="#c084fc" />

        {/* Glasses */}
        <rect x="45" y="46" width="12" height="9" rx="2.5" stroke="#38bdf8" strokeWidth="1.5" fill="#38bdf8" fillOpacity="0.1" />
        <rect x="63" y="46" width="12" height="9" rx="2.5" stroke="#38bdf8" strokeWidth="1.5" fill="#38bdf8" fillOpacity="0.1" />
        <path d="M57 50 L63 50" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Developer Hoodie / Jacket */}
        <path d="M22 110 C22 92, 44 82, 60 82 C76 82, 98 92, 98 110 L22 110 Z" fill="url(#femJacket)" />
        {/* Inner Shirt Collar */}
        <path d="M52 82 L60 94 L68 82 Z" fill="#064e3b" />
        {/* Hoodie Strings */}
        <path d="M50 88 L49 104" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M70 88 L71 104" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

        {/* Code Sticker Accent (Floating Badge) */}
        <rect x="76" y="78" width="22" height="13" rx="4" fill="#10b981" stroke="#34d399" strokeWidth="1" />
        <text x="87" y="87.5" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          &lt;/&gt;
        </text>
      </svg>
    );
  }

  if (normalizedType === 'cyber') {
    // ⚡ Cyber Developer Sticker
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="cybBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="28" fill="url(#cybBg)" />
        <path d="M38 52 C38 32, 82 32, 82 52 C82 72, 76 80, 60 80 C44 80, 38 72, 38 52 Z" fill="#334155" />
        {/* Cyber Visor */}
        <rect x="36" y="44" width="48" height="14" rx="4" fill="#06b6d4" />
        <rect x="42" y="48" width="36" height="6" rx="2" fill="#a5f3fc" />
        {/* Cyber Suit */}
        <path d="M20 110 C20 88, 42 78, 60 78 C78 78, 100 88, 100 110 Z" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
        <circle cx="60" cy="94" r="5" fill="#38bdf8" />
      </svg>
    );
  }

  if (normalizedType === 'mascot') {
    // 🐱 Coder Mascot Sticker
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="mascBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="28" fill="url(#mascBg)" />
        {/* Ears */}
        <polygon points="36,44 48,24 60,44" fill="#fbbf24" />
        <polygon points="84,44 72,24 60,44" fill="#fbbf24" />
        <polygon points="40,42 48,28 56,42" fill="#f43f5e" />
        <polygon points="80,42 72,28 64,42" fill="#f43f5e" />
        {/* Head */}
        <ellipse cx="60" cy="58" rx="30" ry="24" fill="#fef3c7" />
        {/* Eyes & Glasses */}
        <circle cx="48" cy="56" r="3.5" fill="#1e293b" />
        <circle cx="72" cy="56" r="3.5" fill="#1e293b" />
        <circle cx="49" cy="55" r="1.2" fill="#fff" />
        <circle cx="73" cy="55" r="1.2" fill="#fff" />
        <rect x="42" y="50" width="13" height="12" rx="3" stroke="#0284c7" strokeWidth="1.5" />
        <rect x="65" y="50" width="13" height="12" rx="3" stroke="#0284c7" strokeWidth="1.5" />
        <line x1="55" y1="56" x2="65" y2="56" stroke="#0284c7" strokeWidth="1.5" />
        {/* Nose & Whiskers */}
        <polygon points="58,63 62,63 60,65" fill="#f43f5e" />
        <path d="M56 67 Q60 70 64 67" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="32" y1="60" x2="44" y2="62" stroke="#d97706" strokeWidth="1.5" />
        <line x1="32" y1="65" x2="44" y2="65" stroke="#d97706" strokeWidth="1.5" />
        <line x1="88" y1="60" x2="76" y2="62" stroke="#d97706" strokeWidth="1.5" />
        <line x1="88" y1="65" x2="76" y2="65" stroke="#d97706" strokeWidth="1.5" />
        {/* Body */}
        <path d="M30 110 C30 88, 45 80, 60 80 C75 80, 90 88, 90 110 Z" fill="#047857" />
      </svg>
    );
  }

  // 👨‍💻 Male Developer Sticker (Default): Cool coder with tech hoodie, headphones & glasses
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="maleBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0b5c39" />
          <stop offset="50%" stopColor="#042f2e" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="maleSkin" x1="50" y1="35" x2="70" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fba063" />
        </linearGradient>
        <linearGradient id="maleHair" x1="35" y1="18" x2="85" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="maleHoodie" x1="20" y1="85" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Ambient Gradient Backdrop */}
      <rect width="120" height="120" rx="28" fill="url(#maleBg)" />

      {/* Neck */}
      <path d="M52 68 L68 68 L68 84 L52 84 Z" fill="url(#maleSkin)" opacity="0.9" />

      {/* Face */}
      <path d="M42 45 C42 32, 78 32, 78 45 C78 64, 72 74, 60 74 C48 74, 42 64, 42 45 Z" fill="url(#maleSkin)" />

      {/* Hair (Modern Crop) */}
      <path d="M38 38 C38 22, 82 20, 82 38 C75 30, 68 28, 60 28 C50 28, 44 32, 38 38 Z" fill="url(#maleHair)" />
      <path d="M40 36 C44 26, 76 26, 80 36 C76 32, 64 30, 60 30 C54 30, 46 32, 40 36 Z" fill="#334155" />

      {/* Eyes */}
      <circle cx="51" cy="49" r="2.8" fill="#0f172a" />
      <circle cx="69" cy="49" r="2.8" fill="#0f172a" />
      <circle cx="52" cy="48" r="0.9" fill="#ffffff" />
      <circle cx="70" cy="48" r="0.9" fill="#ffffff" />

      {/* Cheerful Smile */}
      <path d="M54 62 Q60 67 66 62" stroke="#9a3412" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Tech Glasses */}
      <rect x="44" y="44" width="14" height="10" rx="2.5" stroke="#38bdf8" strokeWidth="1.8" fill="#38bdf8" fillOpacity="0.12" />
      <rect x="62" y="44" width="14" height="10" rx="2.5" stroke="#38bdf8" strokeWidth="1.8" fill="#38bdf8" fillOpacity="0.12" />
      <path d="M58 48 L62 48" stroke="#38bdf8" strokeWidth="1.8" />
      <path d="M44 48 L37 46" stroke="#38bdf8" strokeWidth="1.5" />
      <path d="M76 48 L83 46" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Tech Headphones */}
      <path d="M35 44 C35 26, 85 26, 85 44" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Earphone Cups */}
      <rect x="29" y="42" width="7" height="16" rx="3.5" fill="#d97706" />
      <rect x="84" y="42" width="7" height="16" rx="3.5" fill="#d97706" />
      <circle cx="32.5" cy="50" r="1.5" fill="#fef3c7" />
      <circle cx="87.5" cy="50" r="1.5" fill="#fef3c7" />

      {/* Hoodie */}
      <path d="M22 110 C22 92, 42 80, 60 80 C78 80, 98 92, 98 110 L22 110 Z" fill="url(#maleHoodie)" />
      {/* Inner T-shirt */}
      <path d="M52 82 L60 95 L68 82 Z" fill="#0f172a" />
      {/* Hoodie Strings */}
      <path d="M49 88 L48 104" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M71 88 L72 104" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />

      {/* Floating Level / Terminal Badge Sticker */}
      <rect x="76" y="78" width="22" height="13" rx="4" fill="#047857" stroke="#10b981" strokeWidth="1" />
      <text x="87" y="87.5" fill="#a7f3d0" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
        DEV
      </text>
    </svg>
  );
}
