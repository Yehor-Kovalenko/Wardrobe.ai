'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Outfit,
  PairingListResponse,
  GeneratePairingsRequest,
  GeneratePairingsResponse,
} from '@/lib/types';
import {pairingService} from "@/lib/service/pairingService";

export function usePairings(page = 1, pageSize = 20, sourceType?: string) {
  return useQuery({
    queryKey: ['pairings', page, pageSize, sourceType],
    queryFn: async (): Promise<PairingListResponse> => {
      let {outfits, total} = await pairingService.getAllPairings(page, pageSize, sourceType);
      const pairings = outfits.map(o => pairingService.pairingToResponse(o));
      return {
        pairings: pairings,
        total: total,
        page: page,
        page_size: pageSize,
        has_more: (page * pageSize) < total
      }
    },
  });
}

export function useItemPairings(itemId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['pairings', 'item', itemId, page, pageSize],
    queryFn: async () => {
      // const params: Record<string, string> = { //TODO no usage reconsider in the futre and rewrite
      //   page: String(page),
      //   page_size: String(pageSize),
      // };
      // return api.get<PairingListResponse>(`/pairings/item/${itemId}`, { params });
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
      return api.post<GeneratePairingsResponse>(`/pairings/generate/${itemId}`,  { //TODO in the future, uses AI service
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
      await pairingService.deletePairing(pairingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
    },
  });
}
