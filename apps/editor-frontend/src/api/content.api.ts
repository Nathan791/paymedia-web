import { catalogClient } from './client.js';
import { Content, Category } from '@/models';

export const contentApi = {
    create: async (data: FormData): Promise<Content> => {
        const response = await catalogClient.post('/content', data);

        return response.data?.data ?? response.data;
    },

    update: async (
        ulid: string,
        data: FormData
    ): Promise<Content> => {
        const response = await catalogClient.put(
            `/content/${ulid}`,
            data
        );

        return response.data?.data ?? response.data;
    },

    addCover: async (
        ulid: string,
        file: File
    ): Promise<Content> => {
        const formData = new FormData();
        formData.append('cover', file);

        const response = await catalogClient.post(
            `/content/${ulid}/cover`,
            formData
        );

        return response.data?.data ?? response.data;
    },

    getAll: async (
        params?: {
            status?: string;
            categoryId?: string;
        }
    ): Promise<Content[]> => {
        const response = await catalogClient.get('/content', {
            params,
        });

        const payload = response.data;

        let contents: any[] = [];

        if (Array.isArray(payload)) {
            contents = payload;
        } else if (Array.isArray(payload?.data)) {
            contents = payload.data;
        } else if (Array.isArray(payload?.data?.items)) {
            contents = payload.data.items;
        } else if (Array.isArray(payload?.items)) {
            contents = payload.items;
        }

        return contents.map((content) => ({
            ...content,
            id: content.ulid ?? content.id,
        }));
    },

    getOne: async (ulid: string): Promise<Content> => {
        const response = await catalogClient.get(
            `/content/${ulid}`
        );

        return response.data?.data ?? response.data;
    },

    delete: async (ulid: string): Promise<void> => {
        await catalogClient.delete(`/content/${ulid}`);
    },

    changeStatus: async (
        ulid: string,
        status: string
    ): Promise<Content> => {
        const response = await catalogClient.patch(
            `/content/${ulid}/status`,
            { status }
        );

        return response.data?.data ?? response.data;
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await catalogClient.get('/categories');

        const payload = response.data;

        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        if (Array.isArray(payload?.data?.items)) {
            return payload.data.items;
        }

        if (Array.isArray(payload?.items)) {
            return payload.items;
        }

        return [];
    },
};