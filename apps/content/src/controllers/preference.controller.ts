import type { FastifyRequest, FastifyReply } from 'fastify'
import * as preferenceService from '../services/preference.service'

const ts = () => new Date().toISOString()

export async function listPreferences(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const prefs = await preferenceService.getPreferences(request.user!.userId)
    reply.send({ data: prefs, timestamp: ts() })
}

export async function addPreference(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const categoryId = parseInt((request.params as any).category_id)
    const pref = await preferenceService.addPreference(request.user!.userId, categoryId)
    reply.status(201).send({ data: pref, timestamp: ts() })
}

export async function removePreference(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const categoryId = parseInt((request.params as any).category_id)
    await preferenceService.removePreference(request.user!.userId, categoryId)
    reply.status(204).send()
}
