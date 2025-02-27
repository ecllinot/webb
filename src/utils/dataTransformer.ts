// src/utils/dataTransformer.ts
interface ContractFormData {
  contractInfo: {
    projectName: string;
    customerName: string;
    amount: number;
    contractName: string;
    contractNo: string;
    signDate: string;
  };
  paymentTerms: Array<{
    type: string;
    ratio: number;
  }>;
  guaranteeInfo: {
    advancePaymentRatio: number;
    advancePaymentValidity: string;
    deliveryPaymentRatio: number;
    deliveryPaymentValidity: string;
    warrantyRatio: number;
    warrantyValidity: string;
  };
}

export const transformGuaranteeRequest = (formData: ContractFormData, guaranteeType: string) => {
  return {
    templateType: determineTemplateType(formData.contractInfo.customerName),
    guaranteeType,
    variables: {
      contractNo: formData.contractInfo.contractNo,
      contractName: formData.contractInfo.contractName,
      customerName: formData.contractInfo.customerName,
      projectName: formData.contractInfo.projectName,
      contractAmount: formData.contractInfo.amount,
      validityPeriod: getValidityPeriod(guaranteeType, formData.guaranteeInfo),
      guaranteeAmount: calculateGuaranteeAmount(guaranteeType, formData)
    }
  };
};

const determineTemplateType = (customerName: string) => {
  // 根据客户名称判断模板类型的逻辑
  return 'works_bureau'; // 默认值，根据实际情况修改
};

const getValidityPeriod = (guaranteeType: string, guaranteeInfo: any) => {
  switch (guaranteeType) {
    case 'advance':
      return guaranteeInfo.advancePaymentValidity;
    case 'delivery':
      return guaranteeInfo.deliveryPaymentValidity;
    case 'warranty':
      return guaranteeInfo.warrantyValidity;
    default:
      return '';
  }
};

const calculateGuaranteeAmount = (guaranteeType: string, formData: ContractFormData) => {
  const { amount } = formData.contractInfo;
  const { advancePaymentRatio, deliveryPaymentRatio, warrantyRatio } = formData.guaranteeInfo;
  
  switch (guaranteeType) {
    case 'advance':
      return (amount * advancePaymentRatio) / 100;
    case 'delivery':
      return (amount * deliveryPaymentRatio) / 100;
    case 'warranty':
      return (amount * warrantyRatio) / 100;
    default:
      return 0;
  }
};