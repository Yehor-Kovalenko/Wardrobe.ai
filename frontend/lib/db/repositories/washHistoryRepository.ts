import { db } from "@/lib/db/database";
import { WashHistoryEntry } from "@/lib/types";

export const washHistoryRepository = {

    async add(
        item_id: string,
        entry: Omit<WashHistoryEntry, "washed_at">
    ) {
        const historyEntry = {
            ...entry,
            item_id,
            washed_at: Date.now(),
        };

        await db.washHistory.add(historyEntry);

        return historyEntry;
    },


    async getByItemId(item_id: string) {
        return db.washHistory
            .where("item_id")
            .equals(item_id)
            .toArray();
    },


    async getLastForItem(item_id: string) {
        return db.washHistory
            .where("item_id")
            .equals(item_id)
            .reverse()
            .sortBy("washed_at")
            .then(entries => entries[0]);
    },


    async getByDateRange(
        from: number,
        to: number
    ) {
        return db.washHistory
            .where("washed_at")
            .between(from, to)
            .toArray();
    },


    async delete(
        washed_at: number
    ) {
        await db.washHistory.delete(washed_at);
    },


    async clear() {
        await db.washHistory.clear();
    },
};