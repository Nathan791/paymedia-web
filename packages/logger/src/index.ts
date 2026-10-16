import pino from 'pino'

export type Logger = pino.Logger

const isProd = process.env.NODE_ENV === 'production'

const rootLogger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { env: process.env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: !isProd
        ? {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
          }
        : undefined,
})

export function createLogger(name: string): Logger {
    return rootLogger.child({ service: name })
}
