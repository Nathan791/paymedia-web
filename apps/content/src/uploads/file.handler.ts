import { createWriteStream, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { extname } from 'node:path'
import { generateId } from '@paymedia/utils'
import type { MultipartFile } from '@fastify/multipart'

const ALLOWED_MIME: Record<string, string[]> = {
    epub: ['application/epub+zip'],
    audio: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/x-wav'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
}
const COVER_MIME = ['image/jpeg', 'image/png', 'image/webp']

export function validateMimeType(mediaType: string, mimeType: string): boolean {
    return ALLOWED_MIME[mediaType]?.includes(mimeType) ?? false
}

export function validateCoverMimeType(mimeType: string): boolean {
    return COVER_MIME.includes(mimeType)
}

export async function saveFile(file: MultipartFile, uploadsDir: string): Promise<string> {
    mkdirSync(uploadsDir, { recursive: true })
    const extension = extname(file.filename).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.bin'
    const filename = `${generateId()}${extension}`
    const dest = join(uploadsDir, filename)
    await pipeline(file.file, createWriteStream(dest, { flags: 'wx' }))
    return dest
}
