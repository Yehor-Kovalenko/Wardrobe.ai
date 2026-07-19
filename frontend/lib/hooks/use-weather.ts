'use client';

import { useQuery } from '@tanstack/react-query';
import {weatherService} from "@/lib/weather/weatherService";

export function useWeather() {
  return useQuery({
    queryKey: ['weather-current'],
    queryFn: () => weatherService.getCurrent(),
    staleTime: 1000 * 60 * 30, // 30 minutes - weather doesn't change that fast
    retry: false, // Don't retry if location not set
  });
}

export function useWeatherForecast(days = 7) {
    return useQuery({
        queryKey: ["weather-forecast", days],
        queryFn: () =>
            weatherService.getForecast(days),
    });
}