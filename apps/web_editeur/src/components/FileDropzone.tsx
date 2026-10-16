// src/components/FileDropzone.tsx

import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { Group, Stack, Text, ThemeIcon, rem } from '@mantine/core';
import { IconUpload, IconX, IconFileUpload } from '@tabler/icons-react';

interface FileDropzoneProps {
    accept?: string[];
    maxSizeMb?: number;
    onDrop: (files: FileWithPath[]) => void;
    label: string;
    hint?: string;
    height?: number;
    icon?: React.ReactNode;
}

export function FileDropzone({ accept, maxSizeMb = 500, onDrop, label, hint, height = 160, icon }: FileDropzoneProps) {
    return (
        <Dropzone
            onDrop={onDrop}
            onReject={() => {}}
            maxSize={maxSizeMb * 1024 * 1024}
            accept={accept}
            multiple={false}
            style={{ borderRadius: 12, borderColor: 'var(--mantine-color-ink-1)', minHeight: height }}
        >
            <Group justify="center" gap="md" mih={height - 40} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                    <ThemeIcon size={44} radius="xl" color="forest" variant="light">
                        <IconUpload style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                    </ThemeIcon>
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <ThemeIcon size={44} radius="xl" color="red" variant="light">
                        <IconX style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                    </ThemeIcon>
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <ThemeIcon size={44} radius="xl" color="forest" variant="light">
                        {icon ?? <IconFileUpload style={{ width: rem(22), height: rem(22) }} stroke={1.5} />}
                    </ThemeIcon>
                </Dropzone.Idle>

                <Stack gap={2}>
                    <Text size="sm" fw={500}>{label}</Text>
                    <Text size="xs" c="dimmed">{hint ?? `Glissez-déposez ou cliquez pour parcourir · max ${maxSizeMb} Mo`}</Text>
                </Stack>
            </Group>
        </Dropzone>
    );
}
