// src/types/payment.types.ts

// 基础枚举类型
export enum CustomerType {
    WORKS_BUREAU = 'works_bureau',
    HUAWEI = 'huawei',
    CONSTRUCTION = 'construction'
}

export enum PaymentTemplateType {
    WORKS_BUREAU = 'works_bureau',
    HUAWEI = 'huawei',
    CONSTRUCTION = 'construction'
}

export enum PaymentType {
    ADVANCE = 'advance',
    DELIVERY = 'delivery',
    COMPLETION = 'completion',
    WARRANTY = 'warranty'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

// 基础接口定义
export interface ContractData {
    contractNo: string;
    customerName: string;
    projectName: string;
    contractAmount: number;
    signDate: string;
    currentInvestment?: number;
    previouslyPaid?: number;
}

// API请求接口
export interface PaymentRequest {
    templateType: PaymentTemplateType;
    paymentType: PaymentType;
    contractData: {
        contractNo: string;
        contractName?: string;
        customerName: string;
        projectName: string;
        contractAmount: number;
        currentInvestment?: number;
        previouslyPaid?: number;
        signDate: string;
        // 添加保函有效期字段
        advanceGuaranteeValidity?: string;
        deliveryGuaranteeValidity?: string;
        warrantyGuaranteeValidity?: string;
        [key: string]: any;
    };
}

// 文档生成相关接口
export interface PaymentDocVariables {
    customerName: string;
    contractNo: string;
    contractName: string;
    contractAmount: number;
    paymentAmount: number;
    paymentAmountInWords: string;
    currentInvestment?: number;
    previouslyPaid?: number;
    calculationFormula?: string;
    currentDate: string;
}

// API响应接口
export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface PaymentResponse extends ApiResponse {
    data?: {
        downloadUrl?: string;
        previewUrl?: string;
    };
}

// 后端特有的数据库模型接口
export interface PaymentRecord {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    customerType: CustomerType;
    paymentType: PaymentType;
    contractNo: string;
    contractName: string;
    contractAmount: number;
    paymentAmount: number;
    status: PaymentStatus;
    approvalStatus: ApprovalStatus;
    currentInvestment?: number;
    previouslyPaid?: number;
    attachments?: string[];
}

// 付款比例配置接口
export interface PaymentRatios {
    [CustomerType.WORKS_BUREAU]: {
        [PaymentType.ADVANCE]: number;
        [PaymentType.DELIVERY]: number;
        [PaymentType.COMPLETION]: number;
        [PaymentType.WARRANTY]: number;
    };
    [CustomerType.HUAWEI]: {
        [PaymentType.ADVANCE]: number;
        [PaymentType.DELIVERY]: number;
        [PaymentType.COMPLETION]: number;
        [PaymentType.WARRANTY]: number;
    };
    [CustomerType.CONSTRUCTION]: {
        [PaymentType.ADVANCE]: number;
        [PaymentType.DELIVERY]: number;
        [PaymentType.COMPLETION]: number;
        [PaymentType.WARRANTY]: number;
    };
}

// 服务配置接口
export interface PaymentServiceConfig {
    templatePath: string;
    outputPath: string;
    allowedFileTypes: string[];
    maxFileSize: number;
    approvalWorkflow: ApprovalWorkflow;
}

// 审批流程接口
export interface ApprovalWorkflow {
    levels: number;
    approvers: string[];
    autoApprovalThreshold?: number;
    timeoutDuration?: number;
}

// 文档生成选项接口
export interface DocumentGenerationOptions {
    template: string;
    outputFormat: 'pdf' | 'docx';
    watermark?: string;
    compression?: boolean;
    password?: string;
}

// 支付处理结果接口
export interface PaymentProcessResult {
    success: boolean;
    transactionId?: string;
    amount: number;
    status: PaymentStatus;
    timestamp: Date;
    error?: string;
}

// 计算相关接口
export interface BasePaymentRequest {
    customerType: CustomerType;
    paymentType: PaymentType;
    contractAmount: number;
    contractNo: string;
}

export interface WorksBureauPaymentRequest extends BasePaymentRequest {
    customerType: CustomerType.WORKS_BUREAU;
}

export interface ProgressivePaymentRequest extends BasePaymentRequest {
    customerType: CustomerType.HUAWEI | CustomerType.CONSTRUCTION;
    currentInvestment: number;
    previouslyPaid: number;
}