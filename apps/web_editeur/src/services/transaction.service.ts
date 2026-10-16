// src/services/transaction.service.ts
import { transactionRepository } from '@/repositories/transaction.repository';

export const transactionService = {
    list: () => transactionRepository.list(),
    listPayouts: () => transactionRepository.listPayouts(),

    requestPayout(amount: number, availableBalance: number, destination: string) {
        if (amount <= 0) throw new Error('Le montant doit être supérieur à 0.');
        if (amount > availableBalance) throw new Error('Le montant dépasse votre solde disponible.');
        return transactionRepository.requestPayout(amount, destination);
    },
};
