import { 
    BasePaymentRequest, 
    CustomerType, 
    PaymentType, 
    PaymentCalculation 
} from '../types/payment.types';
import { convertToChineseAmount, formatSimpleAmount } from './amount.utils';

export const calculatePayment = (data: BasePaymentRequest): PaymentCalculation => {
    if (data.customerType === CustomerType.WORKS_BUREAU) {
        const rates = {
            [PaymentType.ADVANCE]: 0.3,
            [PaymentType.DELIVERY]: 0.5,
            [PaymentType.COMPLETION]: 0.1,
            [PaymentType.WARRANTY]: 0.1
        };

        const rate = rates[data.paymentType];
        const amount = data.contractAmount * rate;

        return {
            amount,
            amountInWords: convertToChineseAmount(amount),
            amountInSimple: formatSimpleAmount(amount),
            calculationFormula: `${data.contractAmount.toLocaleString()} × ${rate * 100}%`
        };
    } 
    else {
        const { currentInvestment = 0, previouslyPaid = 0 } = data;

        switch (data.paymentType) {
            case PaymentType.ADVANCE: {
                const advanceRate = 0.1;
                const amount = data.contractAmount * advanceRate;
                return {
                    amount,
                    amountInWords: convertToChineseAmount(amount),
                    amountInSimple: formatSimpleAmount(amount),
                    calculationFormula: `${data.contractAmount.toLocaleString()} × ${advanceRate * 100}%`
                };
            }
            case PaymentType.DELIVERY: {
                const amount = currentInvestment * 0.8 - previouslyPaid;
                return {
                    amount,
                    amountInWords: convertToChineseAmount(amount),
                    amountInSimple: formatSimpleAmount(amount),
                    calculationFormula: `${currentInvestment.toLocaleString()} × 80% - ${previouslyPaid.toLocaleString()}`
                };
            }
            case PaymentType.COMPLETION: {
                const amount = currentInvestment * 0.97 - previouslyPaid;
                return {
                    amount,
                    amountInWords: convertToChineseAmount(amount),
                    amountInSimple: formatSimpleAmount(amount),
                    calculationFormula: `${currentInvestment.toLocaleString()} × 97% - ${previouslyPaid.toLocaleString()}`
                };
            }
            case PaymentType.WARRANTY: {
                const warrantyRate = 0.03;
                const amount = data.contractAmount * warrantyRate;
                return {
                    amount,
                    amountInWords: convertToChineseAmount(amount),
                    amountInSimple: formatSimpleAmount(amount),
                    calculationFormula: `${data.contractAmount.toLocaleString()} × ${warrantyRate * 100}%`
                };
            }
        }
    }

    return {
        amount: 0,
        amountInWords: '零元整',
        amountInSimple: '0.00',
        calculationFormula: '暂不支持的付款类型'
    };
};