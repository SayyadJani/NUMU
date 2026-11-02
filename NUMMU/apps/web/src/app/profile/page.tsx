'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export default function ProfileIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user?.username) {
        router.replace(`/profile/${encodeURIComponent(user.username)}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Header />
      <ProfileSkeleton />
      <Footer />
    </div>
  );
}
