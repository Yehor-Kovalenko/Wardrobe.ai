import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {ItemPairSuggestion, LearningInsightsData, LearningProfile, StyleInsight} from "@/lib/types";

// Types for learning API responses

/**
 * Hook to fetch learning insights for the current user.
 * Returns the user's learning profile, best item pairs, and style insights.
 */
export function useLearning() {
  return useQuery({
    queryKey: ['learning'],
    queryFn: () => api.get<LearningInsightsData>('/learning'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to recompute the learning profile.
 * Triggers a full recomputation of learned preferences from feedback history.
 */
export function useRecomputeLearning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post<LearningProfile>('/learning/recompute');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
  });
}

/**
 * Hook to generate new style insights.
 * Creates human-readable insights about the user's style patterns.
 */
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post<StyleInsight[]>('/learning/generate-insights');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
  });
}

/**
 * Hook to acknowledge/dismiss an insight.
 */
export function useAcknowledgeInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      return api.post<{ acknowledged: boolean }>(`/learning/insights/${insightId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
  });
}

/**
 * Hook to get items that pair well with a specific item.
 */
export function useItemPairSuggestions(itemId: string, limit = 5) {
  return useQuery({
    queryKey: ['learning', 'item-pairs', itemId, limit],
    queryFn: () => api.get<ItemPairSuggestion[]>(`/learning/item-pairs/${itemId}`, {
      params: { limit: String(limit) },
    }),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });
}
