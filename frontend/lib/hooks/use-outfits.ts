import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {FeedbackData, UserOutfitFeedback, Outfit, OutfitFilters, OutfitListResponse} from "@/lib/types";

export function useOutfits(filters: OutfitFilters = {}, page = 1, pageSize = 20) {
  const params: Record<string, string> = {
    page: String(page),
    page_size: String(pageSize),
  };

  if (filters.status) params.status = filters.status;
  if (filters.occasion) params.occasion = filters.occasion;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.source) params.source = filters.source;
  if (filters.is_lookbook !== undefined) params.is_lookbook = String(filters.is_lookbook);
  if (filters.is_replacement !== undefined)
    params.is_replacement = String(filters.is_replacement);
  if (filters.has_source_item !== undefined)
    params.has_source_item = String(filters.has_source_item);
  if (filters.search) params.search = filters.search;
  if (filters.cloned_from_outfit_id)
    params.cloned_from_outfit_id = filters.cloned_from_outfit_id;

  return useQuery({
    queryKey: ['outfits', filters, page, pageSize],
    queryFn: () => api.get<OutfitListResponse>('/outfits', { params }),
  });
}

export function useOutfit(outfitId: string | undefined) {
  return useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => api.get<Outfit>(`/outfits/${outfitId}`),
    enabled: !!outfitId,
  });
}

export function useAcceptOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: string) => api.post<Outfit>(`/outfits/${outfitId}/accept`),
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
    mutationFn: (outfitId: string) => api.post<Outfit>(`/outfits/${outfitId}/reject`),
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
    mutationFn: ({ outfitId, feedback }: { outfitId: string; feedback: FeedbackData }) =>
      api.post<UserOutfitFeedback>(`/outfits/${outfitId}/feedback`, feedback),
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
    mutationFn: (outfitId: string) => api.delete<void>(`/outfits/${outfitId}`),
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

  const params: Record<string, string> = {
    page: '1',
    page_size: '100', // Get all outfits for the month
    date_from,
    date_to,
  };

  if (filters.status) params.status = filters.status;
  if (filters.occasion) params.occasion = filters.occasion;

  return useQuery({
    queryKey: ['calendarOutfits', year, month, filters],
    queryFn: () => api.get<OutfitListResponse>('/outfits', { params }),
  });
}

export function usePendingOutfits(limit = 3) {
  const params: Record<string, string> = {
    page: '1',
    page_size: String(limit),
    status: 'pending',
  };

  return useQuery({
    queryKey: ['pendingOutfits', limit],
    queryFn: () => api.get<OutfitListResponse>('/outfits', { params }),
  });
}
