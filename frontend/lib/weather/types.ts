export interface WeatherResponse {
    temperature: number;
    feels_like: number;
    humidity: number;
    precipitation_chance: number;
    precipitation_mm: number;
    wind_speed: number;
    condition: string;
    condition_code: number;
    is_day: boolean;
    uv_index: number;
    timestamp: string;
}

export interface ForecastDay {
    date: string;
    temp_min: number;
    temp_max: number;
    precipitation_chance: number;
    condition: string;
    condition_code: number;
}


export interface ForecastResponse {
    latitude: number;
    longitude: number;
    forecast: ForecastDay[];
}

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export const WMO_CODES = {
    0: "sunny",
    1: "mostly sunny",
    2: "partly cloudy",
    3: "cloudy",
    45: "foggy",
    48: "foggy",
    51: "light drizzle",
    53: "drizzle",
    55: "heavy drizzle",
    56: "freezing drizzle",
    57: "freezing drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    66: "freezing rain",
    67: "freezing rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    77: "snow grains",
    80: "light showers",
    81: "showers",
    82: "heavy showers",
    85: "light snow showers",
    86: "snow showers",
    95: "thunderstorm",
    96: "thunderstorm with hail",
    99: "thunderstorm with hail",
} as const;