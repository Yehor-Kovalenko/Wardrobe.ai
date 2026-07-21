import { db } from "@/lib/db/database";
import { Item } from "@/lib/types";

export const clothingItemRepository = {

    async create(item: Item) {
        await db.clothingItems.add(item);
        return item;
    },


    async getAll() {
        return db.clothingItems.toArray();
    },


    async getById(id: string) {
        return db.clothingItems.get(id);
    },

    async getByIds(ids: string[]) {
        const fetchPromises = ids.map(id => db.clothingItems.get(id));
        const results = await Promise.all(fetchPromises);

        return results.filter(item => item !== undefined && item !== null);
    },

    async filter(predicate: (item: Item) => boolean) {
        return db.clothingItems
            .filter(predicate)
            .toArray();
    },

    async update(
        id: string,
        changes: Partial<Item>
    ) {
        await db.clothingItems.update(id, changes);
    },


    async delete(id: string) {
        await db.clothingItems.delete(id);
    },


    async clear() {
        await db.clothingItems.clear();
    },


    async count() {
        return db.clothingItems.count();
    },
};