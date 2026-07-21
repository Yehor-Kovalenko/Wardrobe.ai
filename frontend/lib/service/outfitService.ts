import {outfitRepository} from "@/lib/db/repositories/outfitRepository";
import {Item, Outfit, OutfitFilters, WoreInsteadItem} from "@/lib/types";
import Dict = NodeJS.Dict;
import {clothingItemRepository} from "@/lib/db/repositories/clothingItemRepository";

export const outfitService = {
    async getOutfits(filters: OutfitFilters, page: number, pageSize: number) {
        const filtered = await outfitRepository.filter(outfit => {

            if (filters.status && outfit.status !== filters.status) {
                return false;
            }

            if (filters.occasion && outfit.occasion !== filters.occasion) {
                return false;
            }

            if (filters.source && outfit.source !== filters.source) {
                return false;
            }

            if (
                filters.cloned_from_outfit_id &&
                outfit.cloned_from_outfit_id !== filters.cloned_from_outfit_id
            ) {
                return false;
            }

            if (
                filters.is_lookbook !== undefined &&
                outfit.is_lookbook !== filters.is_lookbook
            ) {
                return false;
            }

            if (
                filters.is_replacement !== undefined &&
                outfit.is_replacement !== filters.is_replacement
            ) {
                return false;
            }

            if (
                filters.has_source_item !== undefined &&
                (!!outfit.source_item !== filters.has_source_item)
            ) {
                return false;
            }

            if (filters.search) {
                const search = filters.search.toLowerCase();

                const matchesReasoning =
                    outfit.reasoning?.toLowerCase().includes(search);

                const matchesStyleNotes =
                    outfit.style_notes?.toLowerCase().includes(search);

                const matchesItemName =
                    outfit.items.some(item =>
                        item.name?.toLowerCase().includes(search)
                    );

                if (
                    !matchesReasoning &&
                    !matchesStyleNotes &&
                    !matchesItemName
                ) return false;
            }

            return true;
        });

        const total = filtered.length;

        const outfits = filtered
            .slice(
                (page - 1) * pageSize,
                page * pageSize
            );

        return {
            outfits: outfits,
            total: total
        }
    },

    async getOutfit(outfitId: any) {
      return outfitRepository.getById(outfitId);
    },

    async fetchWoreInsteadMap(outfits: Outfit[]) {
        let all_item_ids = new Set();
        let outfitToItemIds: Dict<any> = {};

        outfits.forEach(o => {
            if (o?.feedback && o?.feedback?.wore_instead_items) {
                let itemIds: any[] = []
                // @ts-ignore
                o.feedback.wore_instead_items.forEach(i => {
                    let itemId;
                    if (i && typeof i === "object" && !Array.isArray(i)) {
                        itemId = i?.item_id! ?? "";
                    } else {
                        itemId = String(i);
                    }
                    if (itemId) {
                        itemIds.push(itemId)
                        all_item_ids.add(itemId)
                    }
                })
                outfitToItemIds[o.id.toString()] = itemIds;
            }
        })

        if (!all_item_ids) {
            return {};
        }
        let items = await clothingItemRepository.filter(i => all_item_ids.has(i));
        const itemsById: Record<string, Item> = Object.fromEntries(
            items.map(item => [String(item.id), item])
        );

        let woreInsteadMap: Record<string, WoreInsteadItem[]> = {};
        for (const [outfitId, itemIds] of Object.entries(outfitToItemIds)) {
            const woreItems: WoreInsteadItem[] = [];

            for (const itemId of itemIds) {
                if (itemsById[itemId]) {
                    const item = itemsById[itemId];

                    woreItems.push({
                        id: item.id,
                        type: item.type,
                        name: item?.name,
                        thumbnail_path: item.thumbnail_path,
                    });
                }
            }

            if (woreItems.length > 0) {
                woreInsteadMap[outfitId] = woreItems;
            }
        }

        return woreInsteadMap;
    },

    async outfitToResponse(outfit: Outfit, woreInsteadMap: any, isStarterSuggestion: boolean) {
        let woreInstead;
        if (outfit.feedback) {
            if (woreInsteadMap && woreInsteadMap[outfit?.id]) {
                woreInstead = woreInsteadMap[outfit.id.toString()];
            }
            outfit.feedback.wore_instead_items = woreInstead;
        }
        outfit.is_starter_suggestion = isStarterSuggestion;

        await outfitRepository.update(outfit.id, {
            // @ts-ignore
            feedback: {
                ...(outfit.feedback ?? {}), //TODO possibly bugs?
                wore_instead_items: woreInstead
            },
            is_starter_suggestion: isStarterSuggestion
        })

        return outfit;
    },
}