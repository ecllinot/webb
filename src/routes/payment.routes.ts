// src/routes/payment.routes.ts
import { Router, Request, Response } from 'express';
import { DocGenerator } from '../utils/docGenerator';
import {
    PaymentTemplateType,
    PaymentType,
    CustomerType,
    PaymentRequest,
    ApiResponse
} from '../types/payment.types';
import { Validators } from '../utils/validators';
import { calculatePayment } from '../utils/paymentCalculator';
import { formatDate, numberToChineseAmount } from '../utils/formatters';
import path from 'path';
import * as fs from 'fs';

const router = Router();

// 付款比例配置
const paymentRatios: Record<PaymentType, number> = {
    [PaymentType.ADVANCE]: 0.30,
    [PaymentType.DELIVERY]: 0.50,
    [PaymentType.COMPLETION]: 0.10,
    [PaymentType.WARRANTY]: 0.10
};

router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { templateType, paymentType, contractData } = req.body;

        // 构造请求对象
        const paymentRequest: PaymentRequest = {
            templateType,
            paymentType,
            contractData: {
                ...contractData,
                currentInvestment: contractData.currentInvestment || 0,
                previouslyPaid: contractData.previouslyPaid || 0
            }
        };

        // 验证请求
        const validationError = Validators.validatePaymentRequest(paymentRequest);
        if (validationError) {
            throw new Error(validationError);
        }

        // 计算付款金额
        const paymentResult = calculatePayment({
            customerType: templateType as CustomerType,
            paymentType: paymentRequest.paymentType,
            contractAmount: paymentRequest.contractData.contractAmount,
            contractNo: paymentRequest.contractData.contractNo,
            currentInvestment: paymentRequest.contractData.currentInvestment || 0,
            previouslyPaid: paymentRequest.contractData.previouslyPaid || 0
        });

        // 生成文件名
        const fileName = `付款申请_${paymentType}_${new Date().getTime()}`;

        // 获取付款比例
        const currentPaymentRatio = paymentRatios[paymentRequest.paymentType as PaymentType];
        
        // 准备变量
        const variables = {
            ...contractData,
            contractName: contractData.contractName || `${contractData.projectName}合同`,
            customerName: contractData.customerName,
            contractNo: contractData.contractNo,
            projectName: contractData.projectName,
            contractAmount: contractData.contractAmount,
            // 使用类型安全的付款比例
            paymentRatio: `${currentPaymentRatio * 100}%`,
          // 保函比例（根据付款类型设置对应的比例）
    advanceGuaranteeRatio: paymentRequest.paymentType === PaymentType.ADVANCE ? '30%' : undefined,
    deliveryGuaranteeRatio: paymentRequest.paymentType === PaymentType.DELIVERY ? '50%' : undefined,
    warrantyGuaranteeRatio: paymentRequest.paymentType === PaymentType.WARRANTY ? '5%' : undefined,
    
    // 保函有效期
    advanceGuaranteeValidity: formatDate(contractData.advanceGuaranteeValidity),
    deliveryGuaranteeValidity: formatDate(contractData.deliveryGuaranteeValidity),
    warrantyGuaranteeValidity: formatDate(contractData.warrantyGuaranteeValidity),
    
    // 其他日期
    signDate: formatDate(contractData.signDate),
    currentDate: formatDate(new Date().toISOString()),
            // 格式化金额
            currentInvestment: contractData.currentInvestment || 0,
            previouslyPaid: contractData.previouslyPaid || 0,
            paymentAmount: paymentResult.amount,
            paymentAmountInWords: paymentResult.amountInWords,
            calculationFormula: paymentResult.calculationFormula,
            // 添加金额的中文大写
            currentInvestmentInWords: numberToChineseAmount(contractData.currentInvestment || 0),
            previouslyPaidInWords: numberToChineseAmount(contractData.previouslyPaid || 0),
            contractAmountInWords: numberToChineseAmount(contractData.contractAmount)
        };

        // 生成文档
        const docGenerator = new DocGenerator();
        const buffer = await docGenerator.generateDocument({
            type: 'payment',
            subType: templateType,
            documentType: paymentType,
            variables
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}.docx`);
        res.send(buffer);

    } catch (error) {
        console.error('Error generating payment documents:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '文档生成失败'
        });
    }
});


router.post('/types', (_req: Request, res: Response<ApiResponse>) => {
    try {
        const types = Object.values(PaymentType);
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '获取付款类型失败'
        });
    }
});

router.post('/download', async (req: Request, res: Response) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({
                success: false,
                message: '文件名不能为空'
            });
        }

        const filePath = path.join(__dirname, '../temp', fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('文件下载失败:', err);
                res.status(500).json({
                    success: false,
                    message: '文件下载失败'
                });
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '文件下载失败'
        });
    }
});

export default router;