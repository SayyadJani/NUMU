'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProblemsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const topic = searchParams.get('topic');
    if (topic) {
      router.replace(`/dashboard/dsa?topic=${encodeURIComponent(topic)}`);
    } else {
      router.replace('/dashboard/dsa');
    }
  }, [router, searchParams]);

  return null;
}
