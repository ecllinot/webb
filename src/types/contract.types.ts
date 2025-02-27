// src/types/contract.types.ts

export interface ContractInfo {
    projectName: string;      // 项目名称
    customerName: string;     // 客户名称
    amount: number;          // 合同金额
    contractName: string;    // 合同名称
    contractNo: string;      // 合同编号
    signDate: string;        // 签订日期
}

export interface PaymentTerm {
    type: string;           // 付款类型
    ratio: number;          // 付款比例
}

export interface GuaranteeInfo {
    advancePaymentRatio: number;         // 预付款保函比例
    advancePaymentValidity: string;      // 预付款保函有效期
    deliveryPaymentRatio: number;        // 履约保函比例
    deliveryPaymentValidity: string;     // 履约保函有效期
    warrantyRatio: number;               // 质保金保函比例
    warrantyValidity: string;            // 质保金保函有效期
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// 支付类型枚举
export enum PaymentType {
    ADVANCE = 'ADVANCE',        // 预付款
    DELIVERY = 'DELIVERY',      // 到货款
    COMPLETION = 'COMPLETION',  // 竣工款
    WARRANTY = 'WARRANTY'       // 质保金
}

// 模板类型枚举
export enum TemplateType {
    WORKS_BUREAU = 'WORKS_BUREAU',    // 工务署模板
    HUAWEI = 'HUAWEI',               // 华为模板
    CONSTRUCTION = 'CONSTRUCTION',    // 建筑公司模板
    OTHER = 'OTHER'                  // 其他模板
}

// 保函类型枚举
export enum GuaranteeType {
    ADVANCE = 'ADVANCE',          // 预付款保函
    PERFORMANCE = 'PERFORMANCE',  // 履约保函
    WARRANTY = 'WARRANTY'         // 质保金保函
}

// 客户类型枚举
export enum CustomerType {
    HUAWEI = 'HUAWEI',
    CONSTRUCTION = 'CONSTRUCTION',
    OTHER = 'OTHER'
}