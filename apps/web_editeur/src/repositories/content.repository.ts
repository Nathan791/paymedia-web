import type {
    ApiContent,
    ApiContentCategory,
    Content,
    ContentCategory,
    ContentDraftInput,
    ContentMediaType,
} from '@/models';
import { apiClient } from '@/api/client';

const CONTENT_API_BASE = '/catalog/content';
const CATEGORY_API_BASE = '/catalog/category';

interface ApiEnvelope<T> {
    data: T;
    message?: string;
    timestamp?: string;
}

interface ApiPage<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

interface ApiContentInput {
    title: string;
    description: string;
    mediaType: ContentMediaType;
    categoryId?: number;
    isPremium: boolean;
    price: number;
    freeStartPage?: number;
    freeEndPage?: number;
    freePreviewDuration?: number;
}

function normalizeStatus(status: string): Content['status'] {
    const known: Content['status'][] = [
        'draft', 'pending_review', 'correction_requested', 'approved',
        'scheduled', 'published', 'archived',
    ];
    if (status === 'rejected') return 'correction_requested';
    return known.includes(status as Content['status'])
        ? status as Content['status']
        : 'draft';
}

function normalizePrice(price: string | number): number {
    const parsed = Number(price);
    return Number.isFinite(parsed) ? parsed : 0;
}

function mediaApiUrl(value?: string | null): string | null {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const filename = value.split(/[\\/]/).pop();
    return filename ? `/api/catalog/media/${encodeURIComponent(filename)}` : null;
}

function mapApiContent(item: ApiContent): Content {
    const category = item.category
        ? {
            id: item.category.id !== undefined ? String(item.category.id) : (item.category.ulid ?? ''),
            name: item.category.name,
            slug: item.category.slug,
        }
        : null;

    const previewUnits = item.mediaType === 'epub'
        ? (item.freeEndPage ?? 0)
        : (item.freePreviewDuration ?? 0);

    return {
        id: item.ulid,
        ulid: item.ulid,
        title: item.title,
        slug: item.title.toLowerCase().trim().replace(/\s+/g, '-'),
        summary: item.description ?? '',
        description: item.description ?? '',
        mediaType: item.mediaType,
        asset: item.fileUrl
            ? { fileName: item.fileUrl.split(/[\\/]/).pop() ?? 'fichier', fileUrl: mediaApiUrl(item.fileUrl) ?? '', fileSizeBytes: 0, mimeType: '' }
            : null,
        coverUrl: mediaApiUrl(item.coverUrl ?? item.thumbnailUrl),
        category,
        tags: [],
        isPremium: item.isPremium,
        price: normalizePrice(item.price),
        currency: 'XAF',
        freePreviewUnits: previewUnits,
        status: normalizeStatus(item.status),
        version: 1,
        correctionComment: null,
        reviewerId: null,
        reviewerName: null,
        history: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt,
        scheduledAt: null,
        publishedAt: item.status === 'published' ? (item.updatedAt ?? item.createdAt) : null,
        archivedAt: item.status === 'archived' ? (item.updatedAt ?? item.createdAt) : null,
        authorId: item.userId !== undefined && item.userId !== null ? String(item.userId) : '',
        authorName: '',
        stats: { views: 0, purchases: 0, conversionRate: 0, revenue: 0 },
    };
}

function unwrapContent(payload: ApiEnvelope<ApiContent> | ApiContent): ApiContent {
    return 'data' in payload ? payload.data : payload;
}

function toApiInput(input: ContentDraftInput): ApiContentInput {
    const result: ApiContentInput = {
        title: input.title.trim(),
        description: input.description.trim(),
        mediaType: input.mediaType,
        categoryId: Number(input.categoryId),
        isPremium: input.isPremium,
        price: input.isPremium ? input.price : 0,
    };

    if (input.mediaType === 'epub') {
        result.freeStartPage = 1;
        result.freeEndPage = Math.max(1, input.freePreviewUnits || 1);
    } else {
        result.freePreviewDuration = Math.max(0, input.freePreviewUnits || 0);
    }
    return result;
}

function toFormData(input: ContentDraftInput, file?: File | null, cover?: File | null): FormData {
    const data = toApiInput(input);
    const form = new FormData();
    form.append('title', data.title);
    form.append('description', data.description);
    form.append('mediaType', data.mediaType);
    if (data.categoryId) form.append('categoryId', String(data.categoryId));
    form.append('isPremium', String(data.isPremium));
    form.append('price', String(data.price));
    if (data.freeStartPage !== undefined) form.append('freeStartPage', String(data.freeStartPage));
    if (data.freeEndPage !== undefined) form.append('freeEndPage', String(data.freeEndPage));
    if (data.freePreviewDuration !== undefined) form.append('freePreviewDuration', String(data.freePreviewDuration));
    if (file) form.append('files', file);
    if (cover) form.append('cover_image', cover);
    return form;
}

function mapCategory(category: ApiContentCategory): ContentCategory {
    return {
        id: category.id !== undefined ? String(category.id) : category.ulid,
        name: category.name,
        slug: category.slug,
    };
}

export const contentRepository = {
    async listMyContents(): Promise<Content[]> {
        const response = await apiClient.get<ApiPage<ApiContent>>(
            `${CONTENT_API_BASE}/my-contents`,
            { auth: true },
        );
        return response.data.map(mapApiContent);
    },

    async getById(id: string): Promise<Content> {
        const response = await apiClient.get<ApiEnvelope<ApiContent>>(
            `${CONTENT_API_BASE}/${encodeURIComponent(id)}`,
            { auth: true },
        );
        return mapApiContent(unwrapContent(response));
    },

    async create(input: ContentDraftInput, file: File, coverFile: File | null): Promise<Content> {
        const response = await apiClient.postForm<ApiEnvelope<ApiContent>>(
            CONTENT_API_BASE,
            toFormData(input, file, coverFile),
            { auth: true },
        );
        return mapApiContent(unwrapContent(response));
    },

    async update(id: string, input: ContentDraftInput, file?: File | null, coverFile?: File | null): Promise<Content> {
        const path = `${CONTENT_API_BASE}/${encodeURIComponent(id)}`;
        const response = file || coverFile
            ? await apiClient.patch<ApiEnvelope<ApiContent>>(path, toFormData(input, file, coverFile), { auth: true })
            : await apiClient.patch<ApiEnvelope<ApiContent>>(path, toApiInput(input), { auth: true });
        return mapApiContent(unwrapContent(response));
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete<void>(`${CONTENT_API_BASE}/${encodeURIComponent(id)}`, { auth: true });
    },

    async getCategories(): Promise<ContentCategory[]> {
        const response = await apiClient.get<ApiEnvelope<ApiContentCategory[]>>(
            CATEGORY_API_BASE,
            { auth: true },
        );
        const categories = Array.isArray(response) ? response : response.data;
        return categories.map(mapCategory);
    },
};
