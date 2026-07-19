import {userPreferencesRepository} from "@/lib/db/repositories/userPreferencesRepository";

export const userPreferencesService = {
    async resetToDefault() {
        await userPreferencesRepository.save({
            color_favorites: [],
            color_avoid: [],
            style_profile: {
                casual: 50,
                formal: 50,
                sporty: 50,
                minimalist: 50,
                bold: 50,
            },
            occasion_preferences: "",
            temperature_unit: "celsius",
            ai_endpoints: [],
            default_occasion: "casual",
            temperature_sensitivity: "normal",
            cold_threshold: 10,
            hot_threshold: 25,
            layering_preference: "moderate",
            avoid_repeat_days: 7,
            prefer_underused_items: true,
            variety_level: "moderate",
            excluded_item_ids: [],
            excluded_combinations: [],
        });

        return userPreferencesRepository.getCurrent();
    }
}