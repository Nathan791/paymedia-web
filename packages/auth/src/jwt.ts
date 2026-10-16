import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface AccessTokenPayload extends JWTPayload {
    sub: string    
    userId: number
    jti: string
    roles: string[]
    email: string
}
export interface RefreshTokenPayload extends JWTPayload {
    sub: string
    jti: string
    type: 'refresh'
}

function encode(secret: string): Uint8Array {
    return new TextEncoder().encode(secret)
}

export async function signAccessToken(
    payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
    secret: string,
    ttlSeconds: number,
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .sign(encode(secret))
}

export async function signRefreshToken(
    payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
    secret: string,
    ttlSeconds: number,
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .sign(encode(secret))
}

export async function verifyAccessToken(token: string, secret: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, encode(secret))
    if ((payload as RefreshTokenPayload).type === 'refresh') {
        throw new Error('Refresh token cannot be used as access token')
    }
    return payload as AccessTokenPayload
}

export async function verifyRefreshToken(token: string, secret: string): Promise<RefreshTokenPayload> {
    const { payload } = await jwtVerify(token, encode(secret))
    if ((payload as RefreshTokenPayload).type !== 'refresh') {
        throw new Error('Access token cannot be used as refresh token')
    }
    return payload as RefreshTokenPayload
}
