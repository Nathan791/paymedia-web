// src/components/StatusBadge.tsx
import { Badge } from '@mantine/core';
import { CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS, ContentStatus } from '@/models';

export function StatusBadge({ status, size = 'sm' }: { status: ContentStatus; size?: string }) {
    return (
        <Badge color={CONTENT_STATUS_COLORS[status]} variant="light" size={size as any}>
            {CONTENT_STATUS_LABELS[status]}
        </Badge>
    );
}
