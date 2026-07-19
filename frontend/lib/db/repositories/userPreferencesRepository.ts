import { db } from "@/lib/db/database";
import { AIEndpoint, Preferences } from "@/lib/types";

const CURRENT_PREFERENCES_ID = "current" as const;

export const userPreferencesRepository = {

    async getCurrent(): Promise<Preferences | undefined> {
        return db.userPreferences.get(CURRENT_PREFERENCES_ID);
    },


    async save(preferences: Omit<Preferences, "id">) {
        await db.userPreferences.put({
            id: CURRENT_PREFERENCES_ID,
            ...preferences,
        });
    },


    async updateCurrent(changes: Partial<Preferences>) {
        await db.userPreferences.update(
            CURRENT_PREFERENCES_ID,
            changes
        );
    },


    async deleteCurrent() {
        await db.userPreferences.delete(
            CURRENT_PREFERENCES_ID
        );
    },


    async addAIEndpoint(endpoint: AIEndpoint) {
        const preferences = await this.getCurrent();

        if (!preferences) {
            throw new Error("Preferences not initialized");
        }

        await this.updateCurrent({
            ai_endpoints: [
                ...preferences.ai_endpoints,
                endpoint,
            ],
        });
    },


    async removeAIEndpoint(name: string) {
        const preferences = await this.getCurrent();

        if (!preferences) {
            throw new Error("Preferences not initialized");
        }

        await this.updateCurrent({
            ai_endpoints: preferences.ai_endpoints.filter(
                endpoint => endpoint.name !== name
            ),
        });
    },


    async updateAIEndpoint(updatedEndpoint: AIEndpoint) {
        const preferences = await this.getCurrent();

        if (!preferences) {
            throw new Error("Preferences not initialized");
        }

        await this.updateCurrent({
            ai_endpoints: preferences.ai_endpoints.map(endpoint =>
                endpoint.name === updatedEndpoint.name
                    ? updatedEndpoint
                    : endpoint
            ),
        });
    },
};