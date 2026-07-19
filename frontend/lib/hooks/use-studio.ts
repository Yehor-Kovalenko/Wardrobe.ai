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
    mutationFn: async (payload: StudioCreatePayload) => {
      let newOutfit = studioService.createOutfitFromScratch(payload);
      if (!newOutfit) {
        console.error("Failed to create a new outfit");
        return null;
      }

      // @ts-ignore
      await learningService.processFeedback(newOutfit?.id);
      // @ts-ignore
      return studioService.getFullOutfit(newOutfit?.id);
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
    mutationFn: async (payload: WoreInsteadPayload) => {
      let replacement = await studioService.createWoreInstead(originalOutfitId, payload);
      await learningService.processFeedback(replacement!.id);
      // @ts-ignore
      return studioService.getFullOutfit(newOutfit?.id);
    },
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

/**
 * @deprecated
 * @param sourceOutfitId
 */
export function useCloneToLookbook(sourceOutfitId: string) { //TODO remove, this does not work
  const qc = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (payload: { name: string }) => {
      return {};
    },
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
