import { User, UserUpdate } from "@/lib/types";
import {db} from "@/lib/db/database";

const CURRENT_USER_ID = "current";

export const userRepository = {

    async save(user: Omit<User, "id">) {
        await db.users.put({
            ...user,
            id: CURRENT_USER_ID,
        });
        return this.getCurrent();
    },

    async getCurrent(): Promise<User | undefined> {
        return db.users.get(CURRENT_USER_ID);
    },

    async updateCurrent(changes: Partial<User> | UserUpdate) {
        await db.users.update(CURRENT_USER_ID, changes);
        return this.getCurrent();
    },

    async deleteCurrent() {
        await db.users.delete(CURRENT_USER_ID);
    },
};