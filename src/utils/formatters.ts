// src/utils/formatters.ts
import { NumberConverter } from './numberConverter';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const numberToChineseAmount = (amount: number): string => {
    return NumberConverter.toChineseMoney(amount);
};
