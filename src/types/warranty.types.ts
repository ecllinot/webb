// src/types/warranty.types.ts

// 质保金状态枚举
export enum WarrantyStatus {
    PENDING = '待处理',
    IN_PROGRESS = '处理中',
    COMPLETED = '已完成',
    EXPIRED = '已过期'
}

// 文档类型枚举
export enum WarrantyDocumentType {
    WARRANTY_CERTIFICATE = 'warranty_certificate',
    WARRANTY_PAYMENT_APPLICATION = 'warranty_payment_application',
    WARRANTY_PAYMENT_APPROVAL = 'warranty_payment_approval',
    WARRANTY_EQUIPMENT_EVALUATION = 'warranty_equipment_evaluation',
    WARRANTY_ISSUE_STATISTICS = 'warranty_issue_statistics',
    WARRANTY_DEDUCTION_LIST = 'warranty_deduction_list'
}

// 文档模板映射
export const TEMPLATE_FILES: Record<WarrantyDocumentType, string> = {
    [WarrantyDocumentType.WARRANTY_CERTIFICATE]: 'warranty_certificate.docx',
    [WarrantyDocumentType.WARRANTY_PAYMENT_APPLICATION]: 'warranty_payment_application.docx',
    [WarrantyDocumentType.WARRANTY_PAYMENT_APPROVAL]: 'warranty_payment_approval.docx',
    [WarrantyDocumentType.WARRANTY_EQUIPMENT_EVALUATION]: 'warranty_equipment_evaluation.docx',
    [WarrantyDocumentType.WARRANTY_ISSUE_STATISTICS]: 'warranty_issue_statistics.xlsx',
    [WarrantyDocumentType.WARRANTY_DEDUCTION_LIST]: 'warranty_deduction_list.xlsx'
};

// 常量定义
export const WARRANTY_RATIO = 0.03;  // 质保金比例 3%
export const WARRANTY_PERIOD = 2;   // 质保期限 24个月

// 基础质保金记录接口
export interface WarrantyRecord {
    contractNo: string;
    projectName: string;
    warrantyAmount: number;
    expiryDate: Date;
    status: WarrantyStatus;
    remarks?: string;
}

// 质保金文档请求接口
export interface WarrantyDocRequest {
    warrantyStartDate: string;
    contractData: {
        contractNo: string;
        contractName: string;
        customerName: string;
        projectName: string;
        contractAmount: number;
        warrantyAmount?: number;
    };
    selectedDocs: WarrantyDocumentType[];
    warrantyPeriod?: number;
}

// 质保金变量接口
export interface WarrantyPaymentVariables {
    projectName: string;
    contractName: string;
    contractNo: string;
    customerName: string;
    contractAmount: number;
    warrantyAmount: number;
    warrantyStartDate: string;
    warrantyEndDate: string;
    applyAmount: number;
}

// 文件处理结果接口
export interface FileProcessResult {
    success: boolean;
    data?: any;
    error?: string;
    previewUrl?: string;
}

// 质保金响应接口
export interface WarrantyPaymentResponse {
    success: boolean;
    message: string;
    data?: {
        documentPaths?: string[];
        downloadUrls?: string[];
        fileNames?: string[];
        warrantyAmount?: number;
        warrantyEndDate?: string;
    };
}

// API请求接口
export interface WarrantyRequest {
    warrantyStartDate: string;
    contractData: {
        contractNo: string;
        contractName: string;
        customerName: string;
        projectName: string;
        contractAmount: number;
        warrantyAmount?: number;
    };
    selectedDocs: WarrantyDocumentType[];
    warrantyPeriod?: number;
}