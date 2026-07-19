import { db } from "@/lib/db/database";
import { Outfit } from "@/lib/types";

export const outfitRepository = {

    async create(outfit: Outfit) {
        await db.outfits.add(outfit);
        return outfit;
    },


    async getAll() {
        return db.outfits.toArray();
    },


    async getById(id: string) {
        return db.outfits.get(id);
    },


    async update(
        id: string,
        changes: Partial<Outfit>
    ) {
        await db.outfits.update(id, changes);
    },


    async delete(id: string) {
        await db.outfits.delete(id);
    },


    async count() {
        return db.outfits.count();
    },


    async clear() {
        await db.outfits.clear();
    },
};