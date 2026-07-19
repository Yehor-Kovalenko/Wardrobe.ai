import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Outfit } from '@/lib/types';
import {studioService} from "@/lib/service/studioService";
import {learningService} from "@/lib/service/learningService";
import {userRepository} from "@/lib/db/repositories/userRepository";

export interface StudioCreatePayload {
  items: string[];
  occasion: string;
  name?: string;
  scheduled_for?: string | null;
  mark_worn?: boolean;
  source_item_id?: string | null;
}

export function useCreateStudioOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudioCreatePayload) => {
      let newOutfit = studioService.createOutfitFromScratch(payload);
      if (!newOutfit) {
        console.error("Failed to create a new outfit");
        return null;
      }

      // @ts-ignore
      await learningService.processFeedback(newOutfit?.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outfits'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['learning'] });
    },
  });
}

export interface WoreInsteadPayload {
  items: string[];
  rating?: number;
  comment?: string;
  scheduled_for?: string | null;
}

export function useCreateWoreInstead(originalOutfitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WoreInsteadPayload) =>
      api.post<Outfit>(`/outfits/${originalOutfitId}/wore-instead`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outfits'] });
      qc.invalidateQueries({ queryKey: ['outfit', originalOutfitId] });
      qc.invalidateQueries({ queryKey: ['pendingOutfits'] });
      qc.invalidateQueries({ queryKey: ['calendarOutfits'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['learning'] });
    },
  });
}

export function useCloneToLookbook(sourceOutfitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      api.post<Outfit>(`/outfits/${sourceOutfitId}/clone-to-lookbook`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outfits'] });
    },
  });
}

export function useWearToday(templateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { scheduled_for?: string | null }) =>
      api.post<Outfit>(`/outfits/${templateId}/wear-today`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outfits'] });
      qc.invalidateQueries({ queryKey: ['calendarOutfits'] });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export interface PatchOutfitPayload {
  name?: string;
  items?: string[];
}

export function usePatchOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatchOutfitPayload }) =>
      api.patch<Outfit>(`/outfits/${id}`, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['outfit', id] });
      qc.invalidateQueries({ queryKey: ['outfits'] });
    },
  });
}
