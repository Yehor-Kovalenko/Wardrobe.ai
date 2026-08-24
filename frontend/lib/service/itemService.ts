import {clothingItemRepository} from "@/lib/db/repositories/clothingItemRepository";

export const itemService = {
    async getList(params: any) {
        const filtered = clothingItemRepository.filter(i => {
            if (i?.type != params?.type) {
                return false;
            }

            if (i?.subtype != params?.subtype) {
                return false;
            }
        })
    },
}