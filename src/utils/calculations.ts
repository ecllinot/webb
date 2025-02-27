// src/utils/calculations.ts
import { formatCurrency } from './formatters';
import { PaymentTemplateType, PaymentType, ContractData } from '../types';

export const calculatePaymentAmount = (
  contractData: ContractData,
  templateType: PaymentTemplateType,
  paymentType: PaymentType,
  currentInvestment?: number,
  previouslyPaid?: number
): number => {
  if (templateType === PaymentTemplateType.WORKS_BUREAU) {
    switch (paymentType) {
      case PaymentType.ADVANCE:
        return contractData.contractAmount * 0.3;
      case PaymentType.DELIVERY:
        return contractData.contractAmount * 0.5;
      case PaymentType.COMPLETION:
        return contractData.contractAmount * 0.1;
      case PaymentType.WARRANTY:
        return contractData.contractAmount * 0.1;
      default:
        return 0;
    }
  }

  if ([PaymentTemplateType.HUAWEI, PaymentTemplateType.CONSTRUCTION].includes(templateType)) {
    switch (paymentType) {
      case PaymentType.ADVANCE:
        return contractData.contractAmount * 0.1;
      case PaymentType.DELIVERY:
        return (currentInvestment || 0) * 0.8 - (previouslyPaid || 0);
      case PaymentType.COMPLETION:
        return (currentInvestment || 0) * 0.97 - (previouslyPaid || 0);
      case PaymentType.WARRANTY:
        return (currentInvestment || 0) - (previouslyPaid || 0);
      default:
        return 0;
    }
  }

  return 0;
};

export const generateCalculationFormula = (
  contractData: ContractData,
  templateType: PaymentTemplateType,
  paymentType: PaymentType,
  currentInvestment?: number,
  previouslyPaid?: number
): string => {
  if ([PaymentTemplateType.HUAWEI, PaymentTemplateType.CONSTRUCTION].includes(templateType)) {
    switch (paymentType) {
      case PaymentType.ADVANCE:
        return `预付款金额 = 合同金额(${formatCurrency(contractData.contractAmount)}) × 10%`;
      case PaymentType.DELIVERY:
        return `到货款金额 = 本期投资估值(${formatCurrency(currentInvestment || 0)}) × 80% - 已付款金额(${formatCurrency(previouslyPaid || 0)})`;
      case PaymentType.COMPLETION:
        return `竣工款金额 = 本期投资估值(${formatCurrency(currentInvestment || 0)}) × 97% - 已付款金额(${formatCurrency(previouslyPaid || 0)})`;
      case PaymentType.WARRANTY:
        return `质保金金额 = 本期投资估值(${formatCurrency(currentInvestment || 0)}) × 100% - 已付款金额(${formatCurrency(previouslyPaid || 0)})`;
    }
  }

  if (templateType === PaymentTemplateType.WORKS_BUREAU) {
    const ratios = {
      [PaymentType.ADVANCE]: '30%',
      [PaymentType.DELIVERY]: '50%',
      [PaymentType.COMPLETION]: '10%',
      [PaymentType.WARRANTY]: '10%'
    };
    return `付款金额 = 合同金额(${formatCurrency(contractData.contractAmount)}) × ${ratios[paymentType]}`;
  }

  return '';
};

export { formatCurrency };