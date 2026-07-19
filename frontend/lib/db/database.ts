import Dexie, { Table } from "dexie";
import {
    Item,
    ItemPair, LearningInsightsData,
    Outfit,
    Preferences, User,
    UserOutfitFeedback, WashHistoryEntry, WearHistoryEntry
} from "@/lib/types";

class AppDatabase extends Dexie {
    users!: Table<User, string>;
    userPreferences!: Table<Preferences, string>;
    outfits!: Table<Outfit, string>;
    userOutfitFeedbacks!: Table<UserOutfitFeedback, string>;
    // userLearningProfiles!: Table<LearningProfile, string>; //TODO reconsider
    learningInsightsData!: Table<LearningInsightsData, string>; //TODO reconsider
    // styleInsights!: Table<StyleInsight, string>; //TODO reconsider
    itemPairs!: Table<ItemPair, number>;
    // outfitPerformance!: Table<OutfitPerformance, string>; //reconsdier this
    clothingItems!: Table<Item, string>;
    washHistory!: Table<WashHistoryEntry, number>;
    wearHistory!: Table<WearHistoryEntry, number>;


    constructor() {
        super("wardrobe.ai-database");

        this.version(1).stores({
            users: "id",//singleton
            userPreferences: "id", //singleton
            outfits: "id, replaces_outfit_id",
            userOutfitFeedbacks: "++id, outfitId",
            // userLearningProfiles: "id", //singleton //Reconsider
            learningInsightsData: "id", //singleton //combines userlearningprofile + styleinsights
            // styleInsights: "id", //singleton //Reconsider
            itemPairs: "++id",//, item1.id, item2.id",
            clothingItems: "id",
            itemWearHistory: "worn_at, outfit_id",
            itemWashHistory: "washed_at, item_id",
        });
    }
}

export const db = new AppDatabase();