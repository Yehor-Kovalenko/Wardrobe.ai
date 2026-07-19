'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {User, UserUpdate} from "@/lib/types";
import {userRepository} from "@/lib/db/repositories/userRepository";

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'], //TODO create profile if there is none
    queryFn: async () => {
      let u = await userRepository.getCurrent();
      if (!u) {
        await userRepository.save({
          onboarding_completed: false,
          display_name: "default",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      }
    },
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
