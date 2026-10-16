import 'dotenv/config'

function requireEnv(key: string): string {
    const value = process.env[key]
    if (!value) throw new Error(`Missing required environment variable: ${key}`)
    return value
}

export const config = {
    port:             parseInt(process.env.PORT ?? '4001', 10),
    nodeEnv:          process.env.NODE_ENV ?? 'development',
    databaseUrl:      requireEnv('DATABASE_URL'),
    redisUrl:         requireEnv('REDIS_URL'),
    jwtSecret:        requireEnv('JWT_ACCESS_SECRET'),
    jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    jwtAccessTtl:     parseInt(process.env.JWT_ACCESS_TTL  ?? '7200',   10),
    jwtRefreshTtl:    parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10),
    storageDriver:    process.env.STORAGE_DRIVER ?? 'local',
    uploadsDir:       process.env.UPLOADS_DIR ?? 'src/uploads/files',

    // CLOUDINARY Config
    cloudinaryCloudName: requireEnv('CLOUDINARY_CLOUD_NAME'),
    cloudinaryApiKey:    requireEnv('CLOUDINARY_API_KEY'),
    cloudinaryApiSecret: requireEnv('CLOUDINARY_API_SECRET'),

    // CLOUDINARY FOLDER Config
    coverFolder: requireEnv('COVERS_FOLDER'),

    // FILE Config
    maxFileSizeBytes: requireEnv('MAX_FILE_SIZE_BYTES'),
} as const
