// src/types/index.ts
import { PaymentTemplateType, PaymentType, GuaranteeType } from './enums';

export * from './enums';

// 更新后的保函信息接口
export interface GuaranteeInfo {
    advancePaymentRatio: number;
    advancePaymentValidity: string;
    deliveryPaymentRatio: number;
    deliveryPaymentValidity: string;
    performanceRatio: number;
    warrantyRatio: number;
    warrantyValidity: string;
}

// 更新后的合同数据接口
export interface ContractData {
    contractNo: string;
    contractName: string;
    contractAmount: number;
    currentInvestment?: number;
    customerName: string;
    projectName: string;
    signDate: string;
    validityPeriod: string;
    guaranteeInfo?: GuaranteeInfo;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface PaymentRequest {
    templateType: PaymentTemplateType;
    paymentType: PaymentType;
    contractData: ContractData;
    paymentAmount: number;
    paymentRatio: number;
}

// 更新后的保函申请请求接口
export interface GuaranteeRequest {
    templateType: string;
    guaranteeType: GuaranteeType;
    contractData: ContractData;
}

export interface WarrantyPaymentRequest {
    warrantyStartDate: string;
    contractNo: string;
    selectedDocs: string[];
    warrantyPeriod: number;
    warrantyAmount: number;
}

export interface WarrantyDocument {
    id: string;
    name: string;
    selected: boolean;
}

export interface FileProcessResult {
    success: boolean;
    message?: string;
    data?: {
        path: string;
        name: string;
    }[];
}