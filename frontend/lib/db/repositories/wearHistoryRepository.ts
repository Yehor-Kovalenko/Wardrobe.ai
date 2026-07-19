import { db } from "@/lib/db/database";
import { WearHistoryEntry } from "@/lib/types";

export const wearHistoryRepository = {

    async add(
        outfit_id: string,
        entry: Omit<WearHistoryEntry, "worn_at">
    ) {
        const historyEntry = {
            ...entry,
            outfit_id,
            worn_at: Date.now(),
        };

        await db.wearHistory.add(historyEntry);

        return historyEntry;
    },


    async getByOutfitId(outfitId: string) {
        return db.wearHistory
            .where("outfit_id")
            .equals(outfitId)
            .toArray();
    },

    async getByDateRange(
        from: number,
        to: number
    ) {
        return db.wearHistory
            .where("worn_at")
            .between(from, to)
            .toArray();
    },

    async delete(
        worn_at: number
    ) {
        await db.wearHistory.delete(worn_at);
    },

    async clear() {
        await db.wearHistory.clear();
    },
};