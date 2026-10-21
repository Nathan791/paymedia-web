// src/services/trigger.service.ts
import { triggerRepository, TriggerStatus } from '@/repositories/trigger.repository';

export const triggerService = {
    list: () => triggerRepository.list(),
    pause: (id: string) => triggerRepository.setStatus(id, 'paused'),
    activate: (id: string) => triggerRepository.setStatus(id, 'active' as TriggerStatus),
};