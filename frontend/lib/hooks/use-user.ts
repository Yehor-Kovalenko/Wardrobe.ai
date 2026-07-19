'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {User, UserUpdate} from "@/lib/types";
import {userRepository} from "@/lib/db/repositories/userRepository";

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userRepository.getCurrent(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserUpdate) => {
      return userRepository.updateCurrent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
