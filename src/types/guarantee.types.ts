// src/types/guarantee.types.ts (后端)

export enum GuaranteeTemplateType {
    HSBC = 'hsbc',
    WORKS_BUREAU = 'works_bureau',
    CONSTRUCTION = 'construction'
}

export enum GuaranteeType {
    ADVANCE = 'advance',
    PERFORMANCE = 'performance',
    WARRANTY = 'warranty',
    DELIVERY = 'delivery'
}

// 保函请求变量接口
export interface GuaranteeVariables {
    contractNo: string;
    customerName: string;
    projectName: string;
    contractName: string;  // 添加这个字段
    contractAmount: number;
    validityPeriod: string;
}

// 保函请求接口
export interface GuaranteeRequest {
    templateType: GuaranteeTemplateType;
    guaranteeType: GuaranteeType;
    variables: GuaranteeVariables;
}

// 文档生成使用的变量接口
export interface GuaranteeDocVariables {
    customerName: string;
    contractNo: string;
    contractName: string;
    guaranteeAmount: number;
    guaranteeAmountInWords: string;
    guaranteeRatio: number;
    validityPeriod: string;
    currentDate: string;
}

// API响应接口
export interface GuaranteeResponse {
    success: boolean;
    message?: string;
    data?: {
        downloadUrl?: string;
        previewUrl?: string;
    };
}