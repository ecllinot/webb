// src/utils/security.ts
export const cleanupSensitiveData = (resetStateFunctions: any) => {
  const {
    setContractInfo,
    setPaymentRequest,
    setGuaranteeRequest,
    setWarrantyDocuments,
    setWarrantyStartDate,
  } = resetStateFunctions;

  setContractInfo({
    contractNo: '',
    contractName: '',
    customerName: '',
    projectName: '',
    amount: 0,
    signDate: '',
  });
  
  setPaymentRequest({});
  setGuaranteeRequest({});
  setWarrantyDocuments([]);
  setWarrantyStartDate('');
};

export const logUsage = (action: string) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      navigator.sendBeacon('/api/log', JSON.stringify({
        action,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error logging usage:', error);
    }
  }
};