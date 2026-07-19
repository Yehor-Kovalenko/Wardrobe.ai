import { db } from "@/lib/db/database";
import { ItemPair } from "@/lib/types";

export const itemPairRepository = {

    async create(itemPair: ItemPair) {
        return db.itemPairs.add(itemPair);
    },


    async getAll() {
        return db.itemPairs.toArray();
    },


    async getById(id: number) {
        return db.itemPairs.get(id);
    },


    async getByItemId(itemId: string) {
        return db.itemPairs
            .filter(pair =>
                pair.item1?.id === itemId ||
                pair.item2?.id === itemId
            )
            .toArray();
    },


    async getPair(
        item1Id: string,
        item2Id: string
    ) {
        return db.itemPairs
            .filter(pair =>
                (pair.item1?.id === item1Id &&
                 pair.item2?.id === item2Id) ||
                (pair.item1?.id === item2Id &&
                 pair.item2?.id === item1Id)
            )
            .first();
    },


    async update(
        id: number,
        changes: Partial<ItemPair>
    ) {
        await db.itemPairs.update(id, changes);
    },


    async delete(id: number) {
        await db.itemPairs.delete(id);
    },


    async clear() {
        await db.itemPairs.clear();
    },


    async count() {
        return db.itemPairs.count();
    },
};