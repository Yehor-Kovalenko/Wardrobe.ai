import {
    ForecastResponse,
    WeatherResponse, WMO_CODES,
} from "@/lib/weather/types";

import { userRepository } from "@/lib/db//repositories/userRepository";

const GEOCODING_FAILURE_DETAIL = "Unable to geocode saved location name. Please try again later or update your location in settings."

async function getCoordinates(): Promise<{latitude: number | undefined; longitude: number | undefined; locationName: string | undefined} | null> {
    const user = await userRepository.getCurrent();

    if (!user) {
        console.error("User not found")
        return null;
    }


    if (!user.location_lat || !user.location_lon == null) {
        // try to geocode the location
        let locationName = user.location_name?.trim()?.trimStart();
        if (!locationName) {
            console.error(GEOCODING_FAILURE_DETAIL);
            return null;
        }
        //
        let params = {
            "q": locationName,
            "format": "jsonv2",
            "limit": "1",
        }
        let headers = {
            "User-Agent": "Wardrobe.ai/1.0",
        }

        // Create a timeout controller for 10 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch("https://nominatim.openstreetmap.org/search?" + new URLSearchParams(params), {
            method: 'GET',
            headers: headers,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(`Geocoding error for ${JSON.stringify(locationName)}: HTTP status ${response.status}`);
            return null;
          }
          let data;
          try {
            data = await response.json();
          } catch (e) {
            console.error(`Geocoding returned invalid JSON for ${JSON.stringify(locationName)}:`, e);
            return null;
          }

          if (!data || data.length === 0) {
            return null;
          }

          const first = data[0];
          const latitude = parseFloat(first.lat);
          const longitude = parseFloat(first.lon);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
          }

          const displayName = first.display_name;
          return {
              latitude: latitude,
              longitude: longitude,
              locationName: displayName
          };

        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error(`Geocoding error for ${JSON.stringify(locationName)}:`, error.message || error);
          return null;
        }
    }

    return {
        latitude: user.location_lat,
        longitude: user.location_lon,
        locationName: user.location_name
    };
}

async function validateCoordinates(lat: number | undefined, lon: number | undefined) {
    if (!lat || !lon) {
        return false
    }
    if (lat < -90 || lat > 90) {
        console.error("Invalid latitude, should be in range [-90, 90]")
        return false;
    }
    if (lon < -180 || lon > 180) {
        console.error("Invalid longitude, should be in range [-90, 90]")
        return false;
    }

    return true;
}


export const weatherService = {
    /**
     * Public method
     */
    async getCurrent(): Promise<WeatherResponse | null> {

        const coordinates = await getCoordinates();
        if (!coordinates) {
            console.error(GEOCODING_FAILURE_DETAIL);
            return null;
        }
        const validCoordinates = validateCoordinates(coordinates?.latitude, coordinates?.longitude)
        if (!validCoordinates) {
            return null;
        }

        const params = {
            "latitude": coordinates.latitude?.toString() ?? "0",
            "longitude": coordinates.longitude?.toString() ?? "0",
            // "current": [ //TODO fix later investigate
            //     "temperature_2m",
            //     "apparent_temperature",
            //     "relative_humidity_2m",
            //     "precipitation",
            //     "weather_code",
            //     "wind_speed_10m",
            //     "is_day",
            //     "uv_index",
            // ],
            // "hourly": ["precipitation_probability"],
            "forecast_hours": "1",
            "timezone": "auto",
        }
        // Create a timeout controller for 10 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch("https://api.open-meteo.com/v1/forecast?" + new URLSearchParams(params), {
            method: 'GET',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(`Weather error : HTTP status ${response.status}`);
            return null;
          }
          let data;
          try {
            data = await response.json();
          } catch (e) {
            console.error(`Reading weather response failed: `, e);
            return null;
          }

          if (!data || data.length === 0) {
            return null;
          }

          const current = data.current ?? {};
          let hourly = data.hourly ?? {}
          let precip_probs = hourly.precipitation_probability ?? [];
          let precip_chance = precip_probs?.[0] ?? 0
          let weather_code: number = current.weather_code ?? 0;

          return {
            temperature: current.temperature_2m ?? 0,
            feels_like: current.apparent_temperature ?? 0,
            humidity: current.relative_humidity_2m ?? 0,
            precipitation_chance: precip_chance,
            precipitation_mm: current.precipitation ?? 0,
            wind_speed: current.wind_speed_10m ??0,
            condition: WMO_CODES[weather_code as keyof typeof WMO_CODES] ?? "unknown",
            condition_code: weather_code,
            is_day: current.is_day ?? true,
            uv_index: current.uv_index ?? 0,
            timestamp: Date.now().toString()
        }

        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error(`Weather error happened:`, error.message || error);
          return null;
        }
    },


    async getForecast(
        days = 7
    ): Promise<ForecastResponse | null>  {
//TODO in the future
        return null;
    },
};