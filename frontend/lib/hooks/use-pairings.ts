'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Pairing,
  PairingListResponse,
  GeneratePairingsRequest,
  GeneratePairingsResponse,
} from '@/lib/types';

export function usePairings(page = 1, pageSize = 20, sourceType?: string) {
  return useQuery({
    queryKey: ['pairings', page, pageSize, sourceType],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
      };
      if (sourceType) {
        params.source_type = sourceType;
      }
      return api.get<PairingListResponse>('/pairings', { params });
    },
  });
}

export function useItemPairings(itemId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['pairings', 'item', itemId, page, pageSize],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
      };
      return api.get<PairingListResponse>(`/pairings/item/${itemId}`, { params });
    },
    enabled: !!itemId,
  });
}

export function useGeneratePairings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      numPairings = 3,
    }: {
      itemId: string;
      numPairings?: number;
    }) => {
      return api.post<GeneratePairingsResponse>(`/pairings/generate/${itemId}`, {
        num_pairings: numPairings,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
      queryClient.invalidateQueries({ queryKey: ['pairings', 'item', variables.itemId] });
    },
  });
}

export function useDeletePairing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pairingId: string) => {
      return api.delete(`/pairings/${pairingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
    },
  });
}
