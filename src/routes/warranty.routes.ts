// src/routes/warranty.routes.ts
import { Router, Request, Response } from 'express';
import { DocGenerator, SubType } from '../utils/docGenerator';
import archiver from 'archiver';
import { formatDate } from '../utils/formatters';
import {
    WarrantyDocumentType,
    WarrantyPaymentVariables,
    WarrantyDocRequest,
    WarrantyPaymentResponse,
    TEMPLATE_FILES,
    WARRANTY_RATIO,
    WARRANTY_PERIOD
} from '../types/warranty.types';

const router = Router();

// 计算保修期结束日期
const calculateWarrantyEndDate = (startDate: string): string => {
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + WARRANTY_PERIOD);
    return date.toISOString();
};

router.post('/generate', async (req: Request<{}, {}, WarrantyDocRequest>, res: Response) => {
    try {
        console.log('Received warranty request:', JSON.stringify(req.body, null, 2));

        const {
            warrantyStartDate,
            contractData,
            selectedDocs,
            warrantyPeriod = WARRANTY_PERIOD
        } = req.body;

        // 验证数据
        if (!warrantyStartDate) {
            throw new Error('保修开始日期不能为空');
        }

        if (!contractData?.contractNo) {
            throw new Error('合同编号不能为空');
        }

        if (!selectedDocs || selectedDocs.length === 0) {
            throw new Error('请选择至少一个文档类型');
        }

        // 验证必要的变量
        const requiredFields = {
            contractName: '合同名称',
            customerName: '客户名称',
            projectName: '项目名称',
            contractAmount: '合同金额'
        };

        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!contractData[field as keyof typeof contractData]) {
                throw new Error(`${label}不能为空`);
            }
        });

        if (!contractData.contractAmount || contractData.contractAmount <= 0) {
            throw new Error('合同金额必须大于0');
        }

        // 计算保修期结束日期
        const warrantyEndDate = calculateWarrantyEndDate(warrantyStartDate);

        // 准备文档变量
        const documentVariables: WarrantyPaymentVariables = {
            ...contractData,
            warrantyAmount: contractData.contractAmount * WARRANTY_RATIO,
            warrantyStartDate: formatDate(warrantyStartDate),
            warrantyEndDate: formatDate(warrantyEndDate),
            applyAmount: contractData.contractAmount * WARRANTY_RATIO
        };

        console.log('Selected docs:', selectedDocs);

        // 生成文档请求列表
        const documents = selectedDocs.map(docType => {
            const templateName = TEMPLATE_FILES[docType]
                .replace('.docx', '')
                .replace('.xlsx', '')
                .replace(/^warranty_/, ''); // 移除可能存在的前缀

            console.log('Processing document type:', docType, 'Template name:', templateName);

            return {
                type: 'warranty' as const,
                subType: '' as SubType,
                documentType: templateName,
                variables: documentVariables
            };
        });

        console.log('Documents to generate:', documents);

        // 生成文档
        const docGenerator = new DocGenerator();
        const buffers = await docGenerator.generateMultipleDocuments(documents);

        // 如果只有一个文档，直接返回
       if (buffers.length === 1) {
            const originalFile = TEMPLATE_FILES[selectedDocs[0]];
            const fileExtension = originalFile.endsWith('xlsx') ? '.xlsx' : '.docx';
            
            // 根据文件类型设置正确的 Content-Type
            const contentType = fileExtension === '.xlsx' 
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename=warranty_doc${fileExtension}`);
            res.send(buffers[0]);
            return;
        }

        // 多个文档打包成zip
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=warranty_docs.zip');

        archive.pipe(res);

        // 使用原始文件的扩展名
        buffers.forEach((buffer, index) => {
            const originalFile = TEMPLATE_FILES[selectedDocs[index]];
            const fileExtension = originalFile.endsWith('xlsx') ? '.xlsx' : '.docx';
            const fileName = `warranty_doc_${index + 1}${fileExtension}`;
            console.log(`Adding file to zip: ${fileName}`);
            archive.append(buffer, { name: fileName });
        });

        await archive.finalize();
		

    } catch (error) {
        console.error('Error generating warranty documents:', error);
        const response: WarrantyPaymentResponse = {
            success: false,
            message: error instanceof Error ? error.message : '生成文档失败'
        };
        res.status(500).json(response);
    }
});

// 获取可用的文档类型
router.get('/document-types', (_req: Request, res: Response) => {
    try {
        const types = Object.values(WarrantyDocumentType);
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : '获取文档类型失败'
        });
    }
});

export default router;