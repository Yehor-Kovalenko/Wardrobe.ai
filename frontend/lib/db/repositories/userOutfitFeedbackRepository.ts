import { db } from "@/lib/db/database";
import { UserOutfitFeedback } from "@/lib/types";

export const userOutfitFeedbackRepository = {

    async create(feedback: UserOutfitFeedback) {
        await db.userOutfitFeedbacks.add(feedback);
        return feedback;
    },


    async getAll() {
        return db.userOutfitFeedbacks.toArray();
    },


    async getById(id: string) {
        return db.userOutfitFeedbacks.get(id);
    },


    async getByOutfitId(outfitId: string) {
        return db.userOutfitFeedbacks
            .where("outfitId")
            .equals(outfitId)
            .toArray();
    },


    async update(
        id: string,
        changes: Partial<UserOutfitFeedback>
    ) {
        await db.userOutfitFeedbacks.update(id, changes);
    },


    async delete(id: string) {
        await db.userOutfitFeedbacks.delete(id);
    },


    async count() {
        return db.userOutfitFeedbacks.count();
    },


    async clear() {
        await db.userOutfitFeedbacks.clear();
    },
};