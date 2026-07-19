'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {AITestResult, Preferences} from '@/lib/types';
import {userPreferencesRepository} from "@/lib/db/repositories/userPreferencesRepository";
import {userPreferencesService} from "@/lib/service/userPreferencesService";

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      let p = await userPreferencesRepository.getCurrent();
      if (!p) {
        return await userPreferencesService.resetToDefault();
      }
      return p;
    },
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
    mutationFn: async () => {
      return await userPreferencesService.resetToDefault();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}

export function useTestAIEndpoint() {
  return useMutation({
    // @ts-ignore
    mutationFn: (url: string) => {
      return undefined;
      // return api.post<AITestResult>('/users/me/preferences/test-ai-endpoint', { url }); //TODO in th efuture
    },
  });
} //TODO in the future
