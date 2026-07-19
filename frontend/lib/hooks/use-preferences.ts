'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {AITestResult, Preferences} from '@/lib/types';
import {userPreferencesRepository} from "@/lib/db/repositories/userPreferencesRepository";

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => userPreferencesRepository.getCurrent(),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Preferences>) => {
      return userPreferencesRepository.updateCurrent(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

export function useResetPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return api.post<Preferences>('/users/me/preferences/reset');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

export function useTestAIEndpoint() {
  return useMutation({
    mutationFn: (url: string) => {
      return api.post<AITestResult>('/users/me/preferences/test-ai-endpoint', { url });
    },
  });
} //TODO in the future
