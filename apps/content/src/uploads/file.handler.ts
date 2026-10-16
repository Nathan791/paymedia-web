import { createWriteStream, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { generateId } from '@paymedia/utils'
import type { MultipartFile } from '@fastify/multipart'

const ALLOWED_MIME: Record<string, string[]> = {
    epub:  ['application/epub+zip'],
    audio: ['audio/mpeg', 'audio/mp4', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
}

export function validateMimeType(mediaType: string, mimeType: string): boolean {
    return ALLOWED_MIME[mediaType]?.includes(mimeType) ?? false
}

export async function saveFile(
    file: MultipartFile,
    uploadsDir: string,
): Promise<string> {
    mkdirSync(uploadsDir, { recursive: true })
    const ext      = file.filename.split('.').pop() ?? 'bin'
    const filename = `${generateId()}.${ext}`
    const dest     = join(uploadsDir, filename)
    await pipeline(file.file, createWriteStream(dest))
    return dest
}
