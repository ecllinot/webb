// src/routes/guarantee.routes.ts
import { Router, Request, Response } from 'express';
import { DocGenerator, SubType, DocumentType } from '../utils/docGenerator';
import { formatDate, formatCurrency, numberToChineseAmount } from '../utils/formatters';
import path from 'path';
import * as fs from 'fs';

// 更新保函类型定义
enum GuaranteeType {
    ADVANCE = 'advance',
    PERFORMANCE = 'performance',
    WARRANTY = 'warranty',
    DELIVERY = 'delivery'
}

// 添加模板类型定义
type TemplateType = 'works_bureau' | 'construction' | 'hsbc' | 'huawei';

interface GuaranteeRequest {
    templateType: TemplateType;  // 修改这里，使用新的 TemplateType
    guaranteeType: GuaranteeType;
    contractData: {
        contractNo: string;
        contractName: string;
        customerName: string;
        projectName: string;
        contractAmount: number;
        validityPeriod: string;
        signDate: string;
        guaranteeInfo?: {
            advancePaymentRatio: number;
            performanceRatio: number;
            warrantyRatio: number;
            advancePaymentValidity: string;
            deliveryPaymentValidity: string;
            warrantyValidity: string;
        };
        [key: string]: any;
    };
}

const router = Router();

// 更新保函比例配置，使用 TemplateType
const DEFAULT_GUARANTEE_RATIOS: Record<TemplateType, Partial<Record<GuaranteeType, number>>> = {
    'works_bureau': {
        [GuaranteeType.ADVANCE]: 0.3,    // 30%
        [GuaranteeType.DELIVERY]: 0.5,   // 50%
    },
    'construction': {
        [GuaranteeType.ADVANCE]: 0.1,    // 10%
        [GuaranteeType.WARRANTY]: 0.03,  // 3%
    },
    'hsbc': {},      // 汇丰银行使用自定义比例
    'huawei': {}     // 华为暂无默认比例
};

const VALID_SUBTYPES: TemplateType[] = ['works_bureau', 'huawei', 'construction', 'hsbc'];

// 验证请求
const validateGuaranteeRequest = (request: GuaranteeRequest): string | null => {
    if (!request.contractData) return '合同数据不能为空';
    if (!request.contractData.contractNo) return '合同编号不能为空';
    if (!request.contractData.customerName) return '客户名称不能为空';
    if (!request.contractData.contractAmount || request.contractData.contractAmount <= 0) return '合同金额必须大于0';
    if (!request.contractData.validityPeriod) return '有效期不能为空';
    if (!VALID_SUBTYPES.includes(request.templateType)) return '无效的模板类型';
    return null;
};

// 计算保函金额
const calculateGuaranteeAmount = (request: GuaranteeRequest): number => {
    const { templateType, guaranteeType, contractData } = request;
    // 如果是汇丰银行模板，使用从前端传来的保函比例
    if (templateType === 'hsbc' && contractData.guaranteeInfo) {
        switch (guaranteeType) {
            case GuaranteeType.ADVANCE:
                return contractData.contractAmount * (contractData.guaranteeInfo.advancePaymentRatio / 100);
            case GuaranteeType.PERFORMANCE:
                return contractData.contractAmount * (contractData.guaranteeInfo.performanceRatio / 100);
            case GuaranteeType.WARRANTY:
                return contractData.contractAmount * (contractData.guaranteeInfo.warrantyRatio / 100);
            default:
                return 0;
        }
    }
    // 其他模板使用默认比例
    const ratio = DEFAULT_GUARANTEE_RATIOS[templateType]?.[guaranteeType];
    return contractData.contractAmount * (ratio || 0);
};

// 获取保函比例
const getGuaranteeRatio = (request: GuaranteeRequest): number => {
    const { templateType, guaranteeType, contractData } = request;
    if (templateType === 'hsbc' && contractData.guaranteeInfo) {
        switch (guaranteeType) {
            case GuaranteeType.ADVANCE:
                return contractData.guaranteeInfo.advancePaymentRatio / 100;
            case GuaranteeType.PERFORMANCE:
                return contractData.guaranteeInfo.performanceRatio / 100;
            case GuaranteeType.WARRANTY:
                return contractData.guaranteeInfo.warrantyRatio / 100;
            default:
                return 0;
        }
    }
    return DEFAULT_GUARANTEE_RATIOS[templateType]?.[guaranteeType] || 0;
};


router.post('/generate', async (req: Request, res: Response) => {
    try {
        const request: GuaranteeRequest = req.body;
        // 验证请求
        const validationError = validateGuaranteeRequest(request);
        if (validationError) {
            throw new Error(validationError);
        }

        // 计算保函金额
        const guaranteeAmount = calculateGuaranteeAmount(request);
        const guaranteeRatio = getGuaranteeRatio(request);

        // 生成文件名
        const fileName = `保函申请_${request.guaranteeType}_${new Date().getTime()}`;

        // 准备变量
        const variables = {
            ...request.contractData,
            guaranteeAmount,
            guaranteeRatio: `${guaranteeRatio * 100}%`,
            guaranteeAmountInWords: numberToChineseAmount(guaranteeAmount),
            // 根据保函类型设置对应的有效期
            advancePaymentValidity: request.guaranteeType === GuaranteeType.ADVANCE ?
                request.contractData.guaranteeInfo?.advancePaymentValidity : undefined,
            deliveryPaymentValidity: request.guaranteeType === GuaranteeType.DELIVERY ?
                request.contractData.guaranteeInfo?.deliveryPaymentValidity : undefined,
            warrantyValidity: request.guaranteeType === GuaranteeType.WARRANTY ?
                request.contractData.guaranteeInfo?.warrantyValidity : undefined,
            validityPeriod: request.contractData.validityPeriod
        };

        // 生成文档
        const docGenerator = new DocGenerator();
        const buffer = await docGenerator.generateDocument({
            type: 'guarantee' as DocumentType,
            subType: request.templateType,
            documentType: request.guaranteeType,
            variables
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}.docx`);
        res.send(buffer);

    } catch (error) {
        console.error('Error generating guarantee documents:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '生成文档失败'
        });
    }
});

router.post('/types', (_req: Request, res: Response) => {
    try {
        const types = Object.values(GuaranteeType);
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '获取保函类型失败'
        });
    }
});

export default router;