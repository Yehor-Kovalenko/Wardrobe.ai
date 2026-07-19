import {Outfit, UserOutfitFeedback} from "@/lib/types";
import {outfitRepository} from "@/lib/db/repositories/outfitRepository";

export const learningService = {
    async processFeedback(outfitId: any) {
        let outfit = await outfitRepository.getById(outfitId);
        await _update_outfit_performance(outfit);
    },

    async _update_outfit_performance(outfit: Outfit) {
        let feedback = outfit.feedback;
        if (!feedback) return;

        let acceptanceScore = (feedback.accepted) ? 1.0 : 0.0;
        let ratingScore = (feedback.rating) ? (feedback.rating - 1)/4 : 0;
        let we
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