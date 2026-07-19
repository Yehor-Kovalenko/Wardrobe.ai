'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Features {
  background_removal: boolean;
}

export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: () => api.get<Features>('/health/features'),
    staleTime: 5 * 60 * 1000,
  });
}
