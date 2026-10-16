import type { FastifyInstance } from 'fastify'
import * as preferenceController from '../controllers/preference.controller'

export async function preferenceRoutes(app: FastifyInstance): Promise<void> {
    app.get   ('/preference',                   preferenceController.listPreferences)
    app.post  ('/preference/:category_id',      preferenceController.addPreference)
    app.delete('/preference/:category_id',      preferenceController.removePreference)
}
