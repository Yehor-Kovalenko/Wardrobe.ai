import { db } from "@/lib/db/database";
import {LearningInsightsData, LearningProfile} from "@/lib/types";

const CURRENT_PROFILE_ID = "current" as const;

export const learningInsightsDataRepository = {

    async getCurrent(): Promise<LearningInsightsData | undefined> {
        return db.learningInsightsData.get(CURRENT_PROFILE_ID);
    },


    async save(profile: Omit<LearningInsightsData, "id">) {
        await db.learningInsightsData.put({
            id: CURRENT_PROFILE_ID,
            ...profile,
        });
    },


    async updateCurrent(changes: Partial<LearningInsightsData>) {
        await db.learningInsightsData.update(
            CURRENT_PROFILE_ID,
            changes
        );
    },


    async deleteCurrent() {
        await db.learningInsightsData.delete(
            CURRENT_PROFILE_ID
        );
    },
};