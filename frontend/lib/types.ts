// API response types matching backend schemas
// ITEMS

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {api} from "@/lib/api";

export interface ItemTags {
  colors: string[];
  primary_color?: string;
  pattern?: string;
  material?: string;
  style: string[];
  season: string[];
  formality?: string;
  fit?: string;
  occasion?: string[];
  brand?: string;
  condition?: string;
  features?: string[];
  logprobs_confidence?: number;
}

export interface WearHistoryEntry {
  worn_at: number;
  occasion?: string;
  notes?: string;
  outfit_id?: string;
}

export interface Item {
  id: string;
  type: string;
  subtype?: string;
  name?: string;
  brand?: string;
  notes?: string;
  purchase_date?: string;
  purchase_price?: number;
  favorite: boolean;
  image_path: string;
  thumbnail_path?: string;
  medium_path?: string;
  image_url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  tags: ItemTags;
  colors: string[];
  primary_color?: string;
  status: 'processing' | 'ready' | 'error' | 'archived';
  ai_processed: boolean;
  ai_confidence?: number;
  ai_description?: string;
  wear_count: number;
  last_worn_at?: string;
  // wear_history?: ItemWearHistory[]
  // wash_history?: WashHistoryEntry[]
  last_suggested_at?: string;
  suggestion_count: number;
  acceptance_count: number;
  wears_since_wash: number;
  last_washed_at?: string;
  wash_interval?: number;
  needs_wash: boolean;
  effective_wash_interval: number;
  additional_images: ItemImage[];
  is_archived: boolean;
  archived_at?: string;
  archive_reason?: string;
  updated_at: string;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ItemFilter {
  type?: string;
  subtype?: string;
  colors?: string[];
  status?: string;
  favorite?: boolean;
  needs_wash?: boolean;
  is_archived?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  ids?: string;
}

export interface StyleProfile {
  casual: number;
  formal: number;
  sporty: number;
  minimalist: number;
  bold: number;
}

// Color options for the app
// Hex values tuned for typical clothing colors, not pure/saturated colors
export const CLOTHING_COLORS = [
  { name: 'Black', value: 'black', hex: '#1a1a1a' },
  { name: 'Charcoal', value: 'charcoal', hex: '#36454F' },
  { name: 'Gray', value: 'gray', hex: '#808080' },
  { name: 'White', value: 'white', hex: '#FAFAFA' },
  { name: 'Cream', value: 'cream', hex: '#F5F5DC' },
  { name: 'Beige', value: 'beige', hex: '#D4C4A8' },
  { name: 'Tan', value: 'tan', hex: '#C9B896' },
  { name: 'Khaki', value: 'khaki', hex: '#A89F6B' },
  { name: 'Olive', value: 'olive', hex: '#707B52' },
  { name: 'Army Green', value: 'army-green', hex: '#5B6340' },
  { name: 'Green', value: 'green', hex: '#4A7C59' },
  { name: 'Teal', value: 'teal', hex: '#367588' },
  { name: 'Navy', value: 'navy', hex: '#1B2A4A' },
  { name: 'Blue', value: 'blue', hex: '#4A7DB8' },
  { name: 'Brown', value: 'brown', hex: '#8B5A3C' },
  { name: 'Dark Brown', value: 'dark-brown', hex: '#5C4033' },
  { name: 'Burgundy', value: 'burgundy', hex: '#722F37' },
  { name: 'Red', value: 'red', hex: '#C44536' },
  { name: 'Pink', value: 'pink', hex: '#E8A0B0' },
  { name: 'Purple', value: 'purple', hex: '#6B5B7A' },
  { name: 'Yellow', value: 'yellow', hex: '#D4A84B' },
  { name: 'Orange', value: 'orange', hex: '#D2691E' },
] as const;

// Clothing types — must match the TYPE vocabulary in clothing_analysis.txt
export const CLOTHING_TYPES = [
  { label: 'Shirt', value: 'shirt' },
  { label: 'T-Shirt', value: 't-shirt' },
  { label: 'Top', value: 'top' },
  { label: 'Polo', value: 'polo' },
  { label: 'Blouse', value: 'blouse' },
  { label: 'Tank Top', value: 'tank-top' },
  { label: 'Sweater', value: 'sweater' },
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Cardigan', value: 'cardigan' },
  { label: 'Vest', value: 'vest' },
  { label: 'Pants', value: 'pants' },
  { label: 'Jeans', value: 'jeans' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Skirt', value: 'skirt' },
  { label: 'Dress', value: 'dress' },
  { label: 'Jumpsuit', value: 'jumpsuit' },
  { label: 'Jacket', value: 'jacket' },
  { label: 'Blazer', value: 'blazer' },
  { label: 'Coat', value: 'coat' },
  { label: 'Suit', value: 'suit' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Sneakers', value: 'sneakers' },
  { label: 'Boots', value: 'boots' },
  { label: 'Sandals', value: 'sandals' },
  { label: 'Socks', value: 'socks' },
  { label: 'Tie', value: 'tie' },
  { label: 'Hat', value: 'hat' },
  { label: 'Scarf', value: 'scarf' },
  { label: 'Belt', value: 'belt' },
  { label: 'Bag', value: 'bag' },
  { label: 'Accessories', value: 'accessories' },
] as const;

export const OCCASIONS = [
  { label: 'Casual', value: 'casual' },
  { label: 'Office', value: 'office' },
  { label: 'Formal', value: 'formal' },
  { label: 'Date', value: 'date' },
  { label: 'Sporty', value: 'sporty' },
  { label: 'Outdoor', value: 'outdoor' },
] as const;

// Multi-image types
export interface ItemImage {
  id: string;
  item_id: string;
  image_path: string;
  thumbnail_path?: string;
  medium_path?: string;
  position: number;
  created_at: string;
  image_url: string;
  thumbnail_url?: string;
  medium_url?: string;
}

// Wash tracking types
export interface WashHistoryEntry {
  id: string;
  item_id: string;
  washed_at: number;
  method?: string;
  notes?: string;
  created_at: string;
}

// Outfit types
export interface OutfitItem {
  id: string;
  type: string;
  subtype?: string;
  name?: string;
  primary_color?: string;
  colors?: string[];
  image_path?: string;
  thumbnail_path?: string;
  image_url?: string;
  thumbnail_url?: string;
  layer_type?: string;
  wash_interval?: number;
  wear_since_wash?: number;
  wear_count?: number;
  position: number;
}

export interface WoreInsteadItem {
  id: string;
  type: string;
  name?: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
}

// export interface FeedbackSummary {
//   rating?: number;
//   comment?: string;
//   worn_at?: string;
//   actually_worn?: boolean;
//   wore_instead_items?: WoreInsteadItem[];
// }

export interface FeedbackData {
  accepted?: boolean;
  rating?: number;
  comfort_rating?: number;
  style_rating?: number;
  comment?: string;
  worn?: boolean;
  worn_with_modifications?: boolean;
  modification_notes?: string;
  actually_worn?: boolean;
  wore_instead_items?: string[];
}

export interface UserOutfitFeedback {
  id?: string;
  outfit_id: string;
  accepted?: boolean;
  rating?: number;
  comfort_rating?: number;
  style_rating?: number;
  comment?: string;
  worn_at?: string;
  worn?: boolean;
  worn_with_modifications?: boolean;
  modification_notes?: string;
  actually_worn?: boolean;
  wore_instead_items?: string[] | any;
}

export type OutfitSource = 'scheduled' | 'on_demand' | 'manual' | 'pairing';

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  precipitation_chance: number;
  condition: string;
}
export interface Outfit {
  id: string;
  occasion: string;
  scheduled_for?: string; //remove? TODO
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  source: OutfitSource;
  source_item?: any;
  name?: string;
  replaces_outfit_id?: string;
  cloned_from_outfit_id?: string;
  reasoning?: string;
  style_notes?: string;
  ai_raw_response?: any;
  highlights?: string[];
  weather?: WeatherData;
  is_lookbook?: boolean;
  is_replacement?: false;
  items: OutfitItem[];
  feedback?: UserOutfitFeedback;
  is_starter_suggestion?: boolean;
  outfitPerformance?: OutfitPerformance;
}

export interface OutfitListResponse {
  outfits: Outfit[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface OutfitFilters {
  status?: string;
  occasion?: string;
  date_from?: string;
  date_to?: string;
  source?: string;
  is_lookbook?: boolean;
  is_replacement?: boolean;
  has_source_item?: boolean;
  search?: string;
  cloned_from_outfit_id?: string;
}

export interface SuggestRequest {
  occasion: string;
  weather_override?: {
    temperature: number;
    feels_like?: number;
    humidity: number;
    precipitation_chance: number;
    condition: string;
  };
  exclude_items?: string[];
  include_items?: string[];
}

// learning types
export interface LearnedColorScore {
  color: string;
  score: number;
  interpretation: string; // "strongly liked", "liked", "neutral", "disliked", "strongly disliked"
}
export interface LearnedStyleScore {
  style: string;
  score: number;
}

export interface OccasionPattern {
  occasion: string;
  preferred_colors: string[];
  success_rate: number;
}

export interface WeatherPreference {
  weather_type: string; // cold, cool, mild, hot
  preferred_layers: number;
  success_rate: number;
}
export interface LearningProfile {
  id: "current";
  has_learning_data: boolean;
  feedback_count: number;
  outfits_rated: number;
  overall_acceptance_rate: number | null;
  average_rating: number | null;
  average_comfort_rating: number | null;
  average_style_rating: number | null;
  color_preferences: LearnedColorScore[];
  style_preferences: LearnedStyleScore[];
  occasion_patterns: OccasionPattern[];
  weather_preferences: WeatherPreference[];
  last_computed_at: string | null;
}
export interface ItemInfo {
  id: string;
  type: string;
  name: string | null;
  primary_color: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
}

export interface ItemPair {
  id?: number,
  item1: ItemInfo;
  item2: ItemInfo;
  compatibility_score: number;
  wear_bonus?: number;
  times_paired: number;
  times_accepted?: number;
  times_rejected?: number;
  //
  total_rating_sum?: number;
  rating_count?: number;
  occasion_performance?: any;
  weather_performance?: any;
}

export interface OutfitPerformance {
  performance_score: number;
  acceptance_score?: number;
  rating_score: number;
  wear_score: number;
  occasion?: any;
  weather_temp?: number;
  weather_condition?: string;
  item_composition?: any; //Format: {"top": "shirt", "bottom": "jeans", "shoes": "sneakers"}
  color_composition?: any; //Format: {"primary_colors": ["blue", "gray"], "color_harmony": "complementary"}
  was_modified?: boolean;
  modification_notes?: string;
}

export interface StyleInsight {
  id: string;
  category: string;
  insight_type: string;
  title: string;
  description: string;
  confidence: number;
  supporting_data?: any;
  is_acknowledged?: boolean;
  expires_at: string; // when this insight will expire
}

export interface PreferenceSuggestions {
  updated: boolean;
  suggestions?: {
    suggested_favorite_colors?: string[];
    suggested_avoid_colors?: string[];
  };
  confidence?: number | null;
  reason?: string;
}

export interface LearningInsightsData {
  id: "current";
  profile: LearningProfile;
  best_pairs: ItemPair[];
  insights: StyleInsight[];
  preference_suggestions: PreferenceSuggestions;
}

export interface ItemPairSuggestion {
  item: ItemInfo;
  compatibility_score: number;
}
// Pairing types
export interface SourceItem {
  id: string;
  type: string;
  subtype?: string;
  name?: string;
  primary_color?: string;
  image_path: string;
  thumbnail_path?: string;
  image_url?: string;
  thumbnail_url?: string;
}

export interface PairingListResponse {
  pairings: Outfit[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface GeneratePairingsRequest {
  num_pairings: number;
}

export interface GeneratePairingsResponse {
  generated: number;
  pairings: Outfit[];
}

// USERS and preferences
export interface User {
  id: "current";
  // email: string; // do not need it for now
  onboarding_completed: boolean;
  //
  display_name: string;
  avatar_url?: string;
  timezone: string;
  location_lat?: number;
  location_lon?: number;
  location_name?: string;
  body_measurements?: Record<string, number | string> | null;
}

export interface UserUpdate {
  display_name?: string;
  timezone?: string;
  location_lat?: number;
  location_lon?: number;
  location_name?: string;
  body_measurements?: Record<string, number | string> | null;
}

export interface AITestResult {
  status: 'connected' | 'error';
  available_models?: string[];
  vision_models?: string[];
  text_models?: string[];
  error?: string;
}

export interface AIEndpoint {
  name: string;
  url: string;
  vision_model: string;
  text_model: string;
  enabled: boolean;
}

export interface Preferences {
  id: "current";
  color_favorites: string[];
  color_avoid: string[];
  style_profile: StyleProfile;
  default_occasion: string;
  occasion_preferences: any; //TODO maybe delete? what is it?
  //
  temperature_unit: 'celsius' | 'fahrenheit';
  temperature_sensitivity: 'low' | 'normal' | 'high';
  cold_threshold: number;
  hot_threshold: number;
  layering_preference: 'minimal' | 'moderate' | 'heavy';
  //
  avoid_repeat_days: number;
  prefer_underused_items: boolean;
  variety_level: 'low' | 'moderate' | 'high';
  //
  excluded_item_ids: string[];
  excluded_combinations: any;
  //
  ai_endpoints: AIEndpoint[];
}