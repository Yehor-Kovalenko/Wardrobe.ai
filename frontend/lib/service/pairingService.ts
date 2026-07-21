import {outfitRepository} from "@/lib/db/repositories/outfitRepository";
import {Outfit, UserOutfitFeedback} from "@/lib/types";
import {clothingItemRepository} from "@/lib/db/repositories/clothingItemRepository";

export const pairingService = {
    async getAllPairings(page: number, pageSize: number, sourceType: string | undefined) {
        const filtered = await outfitRepository.filter(outfit => {
            if (outfit.source !== "pairing") {
                return false;
            }

            return !(sourceType && outfit.source_item?.type !== sourceType);
        });

        const total = filtered.length;

        const outfits = filtered
            .slice((page - 1) * pageSize, page * pageSize);

        return {
            outfits: outfits,
            total: total,
        };
    },

    pairingToResponse(outfit: Outfit): Outfit {
        const items = [...outfit.items]
        .sort((a, b) => a.position - b.position)

        const sourceItem =
            outfit.source_item
                ? {
                      id: outfit.source_item.id,
                      type: outfit.source_item.type,
                      subtype: outfit.source_item.subtype,
                      name: outfit.source_item.name,
                      primary_color: outfit.source_item.primary_color,
                      image_path: outfit.source_item.image_path,
                      thumbnail_path: outfit.source_item.thumbnail_path,
                  }
                : undefined;

        const feedback: UserOutfitFeedback | undefined =
            outfit.feedback
                ? {
                      outfit_id: outfit.id,
                      rating: outfit.feedback.rating,
                      comment: outfit.feedback.comment,
                      worn_at: outfit.feedback.worn_at,
                  }
                : undefined;

        const highlights =
            Array.isArray(outfit.ai_raw_response?.highlights)
                ? outfit.ai_raw_response.highlights
                : undefined;

        return {
            id: outfit.id,
            occasion: outfit.occasion,
            scheduled_for: outfit.scheduled_for,
            status: outfit.status,
            source: outfit.source,
            reasoning: outfit.reasoning,
            style_notes: outfit.style_notes,
            highlights,
            source_item: sourceItem,
            items,
            feedback,
        };
    },

    async generatePairings(itemId: any, numPairings: number | undefined) {
        numPairings = Math.max(1, Math.min(5, numPairings ?? 0));

        const source_item = await clothingItemRepository.getById(itemId);
        if (!source_item || source_item?.status !== "ready" || source_item?.is_archived) {
            console.error("Error with clothing item");
            return null;
        }
        const availableItems = await clothingItemRepository.filter(i => {
            return (i.status === "ready"
                && !i?.is_archived
                && i.id != itemId
                );
        })
        if (availableItems.length < 2) {
            console.error("Error withclothing items, not enough of them");
            return null;
        }

    },

    async deletePairing(pairingId: any) {
        let pairing = await outfitRepository.filter(o => {
            return (o.id == pairingId && o.source == "pairing");
        })
        if (!pairing) {
            return null;
        }
        await outfitRepository.delete(pairingId);
    },
}