import {StudioCreatePayload, WoreInsteadPayload} from "@/lib/hooks/use-studio";
import {Item, Outfit, OutfitItem} from "@/lib/types";
import {clothingItemRepository} from "@/lib/db/repositories/clothingItemRepository";
import {canonicalItemOrder} from "@/lib/studio/canonical-order";
import {outfitRepository} from "@/lib/db/repositories/outfitRepository";
import {learningService} from "@/lib/service/learningService";
import {userOutfitFeedbackRepository} from "@/lib/db/repositories/userOutfitFeedbackRepository";
import {DEFAULT_WASH_INTERVALS} from "@/lib/service/utils";
import {wearHistoryRepository} from "@/lib/db/repositories/wearHistoryRepository";

const CLONE_SOFT_IDEMPOTENCY_SECONDS = 5;

export const studioService = {
    async _apply_wear_tracking(itemIds: any[], worn_at: any) {
        let items = await clothingItemRepository.getByIds(itemIds);

        items.forEach(item => {
            // @ts-ignore
            const effectiveInterval = item?.wash_interval ?? (DEFAULT_WASH_INTERVALS[item?.type] ?? 3);
            const new_wears_since_wash = (item?.wears_since_wash ?? 0) + 1;
            clothingItemRepository.update(item.id, {
                wear_count: (item?.wear_count ?? 0) + 1,
                last_worn_at: worn_at,
                wears_since_wash: new_wears_since_wash,
                needs_wash: new_wears_since_wash >= effectiveInterval
            })
        })
    },

    async createOutfitFromScratch(payload: StudioCreatePayload): Promise<Outfit | null | undefined> {
        let items = await clothingItemRepository.getByIds(payload.items);
        items = items.filter(item => item.status === "ready");
        // order items cannonicaly
        let ordered = canonicalItemOrder(items)
        let effective_worn = (payload?.mark_worn) ? payload?.scheduled_for : undefined;

        let outfit: Outfit = {
            id: crypto.randomUUID(),
            occasion: payload.occasion,
            scheduled_for: payload?.scheduled_for ?? undefined,
            source: "manual",
            status: "pending",
            name: payload.name,
            items: []
        }
        await outfitRepository.create(outfit);
        let newOutfit = await outfitRepository.getById(outfit.id);

        let outfitItems = ordered.map((item, idx) => {
            let oi: OutfitItem = {
                type: item?.type,
                id: item?.id,
                position: idx
            }
            return oi;
        })

        let feedback = learningService.createSyntheticFeedback(newOutfit?.id, false, effective_worn, undefined, undefined);
        await userOutfitFeedbackRepository.create(feedback);
        await outfitRepository.update(newOutfit!.id, {
            items: outfitItems,
            feedback: feedback
        })

        if (payload.mark_worn && effective_worn) {
            let orderedIds = ordered.map(item => item?.id);
            await this._apply_wear_tracking(orderedIds, effective_worn);
            // update wearhistory repo
            await wearHistoryRepository.add(newOutfit!.id, {
                occasion: payload.occasion,
                outfit_id: newOutfit?.id
            })
        }

        return outfitRepository.getById(newOutfit!.id)
    },

    async getFullOutfit(outfitId: any) {
        return outfitRepository.getById(outfitId);
    },

    async createWoreInstead(outfitId: any, payload: WoreInsteadPayload) {
        let outfit = await outfitRepository.getById(outfitId);
        let existingResult = await outfitRepository.getByReplacementId(outfitId)
        if (existingResult.length != 0) {
            return existingResult[0];
        }

        let items = await clothingItemRepository.getByIds(payload.items);
        items = items.filter(item => item.status === "ready");
        // order items cannonicaly
        let ordered = canonicalItemOrder(items);

        let effective_date = payload.scheduled_for ?? outfit?.scheduled_for;
        const occasion_label = (outfit?.occasion ?? "Outfit").toUpperCase();
        let replacement: Outfit = {
            id: crypto.randomUUID(),
            items: [],
            occasion: outfit!.occasion,
            scheduled_for: effective_date,
            source: "manual",
            status: "pending",
            replaces_outfit_id: outfit?.id,
            name: `${occasion_label} (wore instead)`
        }
        await outfitRepository.create(replacement);

         let outfitItems = ordered.map((item, idx) => {
            let oi: OutfitItem = {
                type: item?.type,
                id: item?.id,
                position: idx
            }
            return oi;
        })

        let feedback = learningService.createSyntheticFeedback(replacement?.id, true, effective_date, payload.rating, payload.comment);
        await userOutfitFeedbackRepository.create(feedback);
        await outfitRepository.update(replacement!.id, {
            items: outfitItems,
            feedback: feedback
        })
        //
        outfit!.status = "rejected";
        await outfitRepository.update(outfit!.id, {status: "rejected"})

        if (effective_date) {
            let orderedIds = ordered.map(item => item?.id);
            await this._apply_wear_tracking(orderedIds, effective_date);
            // update wearhistory repo
            await wearHistoryRepository.add(replacement!.id, {
                occasion: replacement.occasion,
                outfit_id: replacement?.id
            })
        }

        return outfitRepository.getById(replacement!.id)
    },

    async wearToday(templateId: any, scheduled_for: any) {
        let outfit = await outfitRepository.getById(templateId);
        if (!outfit) {
            return null;
        }
        if (outfit.scheduled_for) {
            console.error("wear today requires a lookbook template");
            return null;
        }

        const target_date = scheduled_for ?? Date.now();
        let wear: Outfit = {
            id: crypto.randomUUID(),
            occasion: outfit.occasion,
            scheduled_for: target_date,
            source: "manual",
            status: "pending",
            name: outfit.name,
            cloned_from_outfit_id: outfit.id,
            items: []
        }
        await outfitRepository.create(wear);
        let newOutfit = await outfitRepository.getById(wear.id);

        let outfitItems: OutfitItem[] = [];
        for (const oi of outfit.items.sort((a, b) => a.position - b.position)) {
            outfitItems.push({
                id: oi.id,
                type: oi.type,
                position: oi.position,
                layer_type: oi.layer_type,
            });
        }

        let feedback = learningService.createSyntheticFeedback(newOutfit?.id, true, target_date, undefined, undefined);
        await userOutfitFeedbackRepository.create(feedback);
        await outfitRepository.update(newOutfit!.id, {
            items: outfitItems,
            feedback: feedback
        })

        let orderedIds = outfit.items.map(item => item?.id);
        await this._apply_wear_tracking(orderedIds, target_date);
        // update wearhistory repo
        await wearHistoryRepository.add(newOutfit!.id, {
            occasion: outfit.occasion,
            outfit_id: newOutfit?.id
        })

        return outfitRepository.getById(newOutfit!.id)
    },

    async patchOutfit(outfitId: string, name: string | undefined, items: any[] | undefined) {
        let outfit = await outfitRepository.getById(outfitId);
        if (!outfit) {
            return null;
        }
        if (name) {
            outfit.name = name;
        }
        if (items) {
            if (outfit.feedback?.worn_at) {
                console.error("Cannot modify items on a worn outfit");
                return null;
            }
            let newItems = items.filter(item => item.status === "ready");
            // order items cannonicaly
            let ordered = canonicalItemOrder(newItems);

            // let newIds = ordered.map(i => i.id)
            // let oldIds = outfit.items.map(i => i.id);
            // //TODO reconsider? should be removed or not?
            // const oldPairs = generatePairs(oldIds);
            // const newPairs = generatePairs(newIds);
            // // @ts-ignore
            // const added = [...newPairs].filter(pair => !oldPairs.has(pair));
            // // @ts-ignore
            // const removed = [...oldPairs].filter(pair => !newPairs.has(pair))
            await outfitRepository.update(outfit.id, {
                items: ordered
            })
            return outfitRepository.getById(outfit.id);
        }
    }

}

function generatePairs(ids: string[]): Set<string> {
    const pairs = new Set<string>();

    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            const pair = [ids[i], ids[j]]
                .sort()
                .join("|");

            pairs.add(pair);
        }
    }

    return pairs;
}