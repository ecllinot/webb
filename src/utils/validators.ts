// src/utils/validators.ts
import { PaymentTemplateType } from '../types/enums';
import { PaymentRequest } from '../types/payment.types';
import { GuaranteeRequest } from '../types/guarantee.types';
import { 
    WarrantyRequest,
    WarrantyPaymentVariables,
    WarrantyDocumentType 
} from '../types/warranty.types';

export class Validators {
    // 付款申请验证
    static validatePaymentRequest(request: PaymentRequest): string | null {
        if (!request.templateType) return '模板类型不能为空';
        if (!request.paymentType) return '付款类型不能为空';
        if (!request.contractData) return '合同数据不能为空';
        if (!request.contractData.contractNo) return '合同编号不能为空';
        if (!request.contractData.customerName) return '客户名称不能为空';
        if (!request.contractData.contractAmount || request.contractData.contractAmount <= 0) return '合同金额必须大于0';

        // 对华为和基建客户的特殊验证
        if ([PaymentTemplateType.HUAWEI, PaymentTemplateType.CONSTRUCTION].includes(request.templateType)) {
            if (!request.contractData.currentInvestment) return '请填写本期投资估值';
            if (!request.contractData.previouslyPaid) return '请填写已付款金额';
        }

        return null;
    }

    // 保函申请验证
    static validateGuaranteeRequest(request: GuaranteeRequest): string | null {
        if (!request.templateType) return '保函模板类型不能为空';
        if (!request.guaranteeType) return '保函类型不能为空';
        if (!request.variables.contractName) return '合同名称不能为空';
        if (!request.variables.contractNo) return '合同编号不能为空';
        if (!request.variables.contractAmount || request.variables.contractAmount <= 0) return '合同金额必须大于0';
        if (!request.variables.validityPeriod) return '有效期不能为空';
        return null;
    }

    // 质保金申请验证
    static validateWarrantyRequest(request: WarrantyRequest): string | null {
        if (!request.warrantyStartDate) return '质保期开始日期不能为空';
        if (!request.contractData) return '合同数据不能为空';
        
        const { contractData } = request;
        
        // 验证合同数据
        if (!contractData.contractNo) return '合同编号不能为空';
        if (!contractData.contractName) return '合同名称不能为空';
        if (!contractData.customerName) return '客户名称不能为空';
        if (!contractData.projectName) return '项目名称不能为空';
        if (!contractData.contractAmount || contractData.contractAmount <= 0) return '合同金额必须大于0';

        // 验证日期格式
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(request.warrantyStartDate)) {
            return '质保期开始日期格式不正确，应为YYYY-MM-DD';
        }

        // 验证选中的文档
        if (!request.selectedDocs || request.selectedDocs.length === 0) {
            return '请至少选择一个文档';
        }

        // 验证文档类型
        for (const docType of request.selectedDocs) {
            if (!Object.values(WarrantyDocumentType).includes(docType)) {
                return `无效的文档类型: ${docType}`;
            }
        }

        return null;
    }

    // 验证质保金变量
    static validateWarrantyVariables(variables: WarrantyPaymentVariables): string | null {
        // 验证必填字段
        const requiredFields = {
            projectName: '项目名称',
            contractName: '合同名称',
            contractNo: '合同编号',
            customerName: '客户名称',
            contractAmount: '合同金额',
            warrantyAmount: '质保金金额',
            warrantyStartDate: '质保期开始日期',
            warrantyEndDate: '质保期结束日期',
            applyAmount: '申请金额'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!variables[field as keyof WarrantyPaymentVariables]) {
                return `${label}不能为空`;
            }
        }

        // 验证金额
        if (variables.contractAmount <= 0) return '合同金额必须大于0';
        if (variables.warrantyAmount <= 0) return '质保金金额必须大于0';
        if (variables.applyAmount <= 0) return '申请金额必须大于0';
        if (variables.applyAmount > variables.warrantyAmount) return '申请金额不能大于质保金总额';

        // 验证日期
        const startDate = new Date(variables.warrantyStartDate);
        const endDate = new Date(variables.warrantyEndDate);
        
        if (isNaN(startDate.getTime())) return '质保期开始日期格式无效';
        if (isNaN(endDate.getTime())) return '质保期结束日期格式无效';
        if (endDate <= startDate) return '质保期结束日期必须晚于开始日期';

        return null;
    }

    // 通用验证方法
    static validateContractNo(contractNo: string): boolean {
        const contractNoRegex = /^[A-Za-z0-9-]+$/;
        return contractNoRegex.test(contractNo);
    }

    static validateAmount(amount: number): boolean {
        return !isNaN(amount) && amount > 0;
    }

    static validateDate(date: string): boolean {
        const dateObj = new Date(date);
        return dateObj.toString() !== 'Invalid Date';
    }

    static validateWarrantyDocuments(selectedDocs: WarrantyDocumentType[]): string | null {
        if (!selectedDocs || selectedDocs.length === 0) {
            return '请至少选择一个文档';
        }
        return null;
    }

    static validateTemplateType(templateType: string, availableTypes: string[]): string | null {
        if (!availableTypes.includes(templateType)) {
            return '无效的模板类型';
        }
        return null;
    }

    static validateDates(startDate: string, endDate: string): string | null {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            return '结束日期必须晚于开始日期';
        }
        return null;
    }
}

export default Validators;