import {Outfit, UserOutfitFeedback} from "@/lib/types";
import {outfitRepository} from "@/lib/db/repositories/outfitRepository";

const ACCEPTANCE_WEIGHT = 0.4
const RATING_WEIGHT = 0.4
const WEAR_WEIGHT = 0.2

const MIN_FEEDBACK_FOR_LEARNING = 1
const MIN_PAIRS_FOR_SCORING = 2

const SCORE_DECAY_RATE = 0.995

const MANUAL_SIGNAL_MULTIPLIER = 1.2
const WEAR_BONUS_INCREMENT = 0.1
const WEAR_BONUS_CAP = 1.0

export const learningService = {
    async processFeedback(outfitId: any) {
        let outfit = await outfitRepository.getById(outfitId);
        await this._update_outfit_performance(outfit);
    },

    async _update_outfit_performance(outfit: any) {
        let feedback = outfit?.feedback;
        if (!feedback) return;

        let acceptanceScore = (feedback.accepted) ? 1.0 : 0.0;
        let ratingScore = (feedback.rating) ? (feedback.rating - 1) / 4 : 0;
        let wear_score;
        if (feedback.worn_at) {
            wear_score = 1.0
            if (feedback.worn_with_modifications) wear_score = 0.7
        }

        // overall performance
        let scores = []
        let weights = []

        scores.push(acceptanceScore)
        weights.push(ACCEPTANCE_WEIGHT)
        scores.push(ratingScore)
        weights.push(RATING_WEIGHT)
        if (wear_score) {
            scores.push(wear_score)
            weights.push(WEAR_WEIGHT)
        }

        let totalWeight = weights.reduce((sum, current) => sum + current, 0);
        const performanceScore = scores.reduce((sum, score, index) => {
            const weight = weights[index] ?? 0; // Fallback to 0 if the arrays aren't the same length
            return sum + (score * weight);
        }, 0) / totalWeight;

        let w_temp;
        let w_condition;
        if (outfit.weather) {
            w_temp = outfit.weather.temperature;
            w_condition = outfit.weather.condition;
        }

        let itemComposition = {
            top: undefined,
            bottom: undefined,
            shoes: undefined,
            outerwear: undefined,
            socks: undefined,
            neckwear: undefined
        }
        const colorComposition = {
          primary_colors: [],
        };

        for (const outfitItem of outfit.items) {
          const item = outfitItem.item;
          const itemType = item.type?.toLowerCase() ?? "unknown";

          // Categorize by type
          if (["shirt", "blouse", "t-shirt", "sweater", "top"].includes(itemType)) {
            itemComposition.top = itemType;
          } else if (["pants", "jeans", "skirt", "shorts"].includes(itemType)) {
            itemComposition.bottom = itemType;
          } else if (["sneakers", "boots", "heels", "shoes", "sandals"].includes(itemType)) {
            itemComposition.shoes = itemType;
          } else if (["jacket", "coat", "outerwear"].includes(itemType)) {
            itemComposition.outerwear = itemType;
          } else if (itemType === "socks") {
            itemComposition.socks = itemType;
          } else if (itemType === "tie") {
            itemComposition.neckwear = itemType;
          }

          if (item.primary_color) {
            // @ts-ignore
            colorComposition.primary_colors.push(item?.primary_color);
          }
        }
        //
        await outfitRepository.update(outfit!.id, {
            outfitPerformance: {
                performance_score: performanceScore,
                acceptance_score: acceptanceScore,
                rating_score: ratingScore,
                wear_score: wear_score ?? 0,
                occasion: outfit?.occasion,
                weather_temp: w_temp,
                weather_condition: w_condition,
                item_composition: itemComposition,
                color_composition: colorComposition,
                was_modified: feedback?.worn_with_modifications,
                modification_notes: feedback?.modification_notes
            }
        })
    },

    createSyntheticFeedback(outfitId: any, accepted: boolean, worn_at: any, rating: number | undefined, comment: string | undefined): UserOutfitFeedback {
        return {
            outfit_id: outfitId,
            accepted: accepted,
            worn_at: worn_at,
            rating: rating,
            comment: comment
        }
    }
}