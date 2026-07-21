import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {FeedbackData, UserOutfitFeedback, Outfit, OutfitFilters, OutfitListResponse} from "@/lib/types";
import {outfitService} from "@/lib/service/outfitService";
import {outfitRepository} from "@/lib/db/repositories/outfitRepository";
import {DEFAULT_WASH_INTERVALS} from "@/lib/service/utils";
import {clothingItemRepository} from "@/lib/db/repositories/clothingItemRepository";
import {studioService} from "@/lib/service/studioService";
import {learningService} from "@/lib/service/learningService";

export function useOutfits(filters: OutfitFilters = {}, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['outfits', filters, page, pageSize],
    queryFn: async (): Promise<OutfitListResponse> => {
      let {outfits, total} = await outfitService.getOutfits(filters, page, pageSize);
      let woreInsteadMap = await outfitService.fetchWoreInsteadMap(outfits);
      const outfitResponses = await Promise.all(
          outfits.map(async o => {
            return outfitService.outfitToResponse(o, woreInsteadMap,false);
          })
      );

      return {
        outfits: outfitResponses,
        total: total,
        page: page,
        page_size: pageSize,
        has_more: (page * pageSize) < total
      }
    },
  });
}

export function useOutfit(outfitId: string | undefined) {
  return useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: async  () => {
      let outfit = await outfitService.getOutfit(outfitId);
      if (!outfit) {
        return null;
      }
      return outfitService.outfitToResponse(outfit!, await outfitService.fetchWoreInsteadMap([outfit]), false)
    },
    enabled: !!outfitId,
  });
}

export function useAcceptOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfitId: string) => {
      let outfit = await outfitService.getOutfit(outfitId);
      if (!outfit) {
        return null;
      }
      outfit.status = "accepted";
      await outfitRepository.update(outfitId, {
        status: "accepted"
      })
      return outfitService.outfitToResponse(outfit, await outfitService.fetchWoreInsteadMap([outfit]), false);
    },
    onSuccess: (_, outfitId) => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      queryClient.invalidateQueries({ queryKey: ['outfit', outfitId] });
      queryClient.invalidateQueries({ queryKey: ['calendarOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useRejectOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfitId: string) => {
      let outfit = await outfitService.getOutfit(outfitId);
      if (!outfit) {
        return null;
      }
      outfit.status = "rejected";
      await outfitRepository.update(outfitId, {
        status: "rejected"
      })
      return outfitService.outfitToResponse(outfit, await outfitService.fetchWoreInsteadMap([outfit]), false);
    },
    onSuccess: (_, outfitId) => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      queryClient.invalidateQueries({ queryKey: ['outfit', outfitId] });
      queryClient.invalidateQueries({ queryKey: ['calendarOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ outfitId, feedback }: { outfitId: string; feedback: UserOutfitFeedback }) => {
      let outfit = await outfitService.getOutfit(outfitId);
      if (!outfit) {
        return null;
      }

      let fb;
      if (outfit?.feedback) {
        fb = outfit.feedback
      } else {
        fb = {outfit_id: outfit.id};
        outfit.feedback = fb;
      }

      fb.accepted = feedback?.accepted;
      outfit.status = (feedback?.accepted) ? "accepted" : "rejected";

      fb.rating = feedback?.rating;
      fb.comfort_rating = feedback?.comfort_rating;
      fb.style_rating = feedback?.style_rating;
      fb.comment = feedback?.comment;
      if (feedback.worn && !feedback?.worn_at) {
        fb.worn_at = Date.now().toString();
        outfit.items.forEach(oi => {
          // @ts-ignore
          let effectiveInterval = (oi?.wash_interval) ? oi.wash_interval : (DEFAULT_WASH_INTERVALS?.[oi?.type ?? "shirt"] ?? 3);
          clothingItemRepository.update(oi.id, {
            wear_count: (oi?.wear_count ?? 0) + 1,
            last_worn_at: fb.worn_at,
            wears_since_wash: (oi?.wear_since_wash ?? 0) + 1,
            needs_wash: (oi?.wear_since_wash ?? 0) + 1 >= effectiveInterval
          })
        })
      }
      fb.worn_with_modifications = feedback?.worn_with_modifications;
      fb.modification_notes = feedback?.modification_notes;
      fb.actually_worn = feedback?.actually_worn;
      if (feedback.wore_instead_items != null) {
        // @ts-ignore
        fb.wore_instead_items = feedback.wore_instead_items.map(i => i.id?.toString());
        if (feedback.wore_instead_items) {
          await studioService.createWoreInstead(outfitId, {items: feedback.wore_instead_items, rating: feedback?.rating, comment: feedback?.comment});
        }
      }

      await outfitRepository.update(outfitId, {
        feedback: fb
      })
      await learningService.processFeedback(outfitId);

      return fb;
    },
    onSuccess: (_, { outfitId }) => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      queryClient.invalidateQueries({ queryKey: ['outfit', outfitId] });
      queryClient.invalidateQueries({ queryKey: ['calendarOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: string) => {
      return outfitRepository.delete(outfitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      queryClient.invalidateQueries({ queryKey: ['calendarOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOutfits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCalendarOutfits(year: number, month: number, filters: OutfitFilters = {}) {
  // Calculate date range for the month
  const date_from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const date_to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const params: Record<string, any> = {
    page: 1,
    page_size: 100, // Get all outfits for the month
    date_from,
    date_to,
  };

  if (filters.status) params.status = filters.status;
  if (filters.occasion) params.occasion = filters.occasion;

  return useQuery({
    queryKey: ['calendarOutfits', year, month, filters],
    queryFn: async () => {
      let {outfits, total} = await outfitService.getOutfits(params, params.page, params.pageSize);
      let woreInsteadMap = await outfitService.fetchWoreInsteadMap(outfits);
      const outfitResponses = await Promise.all(
          outfits.map(async o => {
            return outfitService.outfitToResponse(o, woreInsteadMap,false);
          })
      );

      return {
        outfits: outfitResponses,
        total: total,
        page: params.page,
        page_size: params.pageSize,
        has_more: (params.page * params.pageSize) < total
      }
    },
  });
}

export function usePendingOutfits(limit = 3) {
  const params: Record<string, any> = {
    page: 1,
    page_size: limit,
    status: 'pending',
  };

  return useQuery({
    queryKey: ['pendingOutfits', limit],
    queryFn: async () => {
      let {outfits, total} = await outfitService.getOutfits(params, params.page, params.pageSize);
      let woreInsteadMap = await outfitService.fetchWoreInsteadMap(outfits);
      const outfitResponses = await Promise.all(
          outfits.map(async o => {
            return outfitService.outfitToResponse(o, woreInsteadMap,false);
          })
      );

      return {
        outfits: outfitResponses,
        total: total,
        page: params.page,
        page_size: params.pageSize,
        has_more: (params.page * params.pageSize) < total
      }
    },
  });
}
