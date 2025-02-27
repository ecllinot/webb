import express from 'express';
import { ContractController } from '../controllers/contract.controller';
import { 
    ContractInfo, 
    PaymentTerm, 
    GuaranteeInfo, 
    ApiResponse,
    PaymentType,
    TemplateType,
    GuaranteeType,
    CustomerType
} from '../types/contract.types';


const router = express.Router();

// 保存合同信息
router.post('/save', async (req, res) => {
    try {
        console.log('Received contract save request:', req.body);
        const { contractInfo, paymentTerms, guaranteeInfo } = req.body as {
            contractInfo: ContractInfo;
            paymentTerms: PaymentTerm[];
            guaranteeInfo: GuaranteeInfo;
        };
        
        // 添加数据验证
        if (!contractInfo || !paymentTerms) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // 验证必要字段
        if (!contractInfo.contractNo || !contractInfo.customerName || !contractInfo.projectName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required contract information'
            });
        }

        // 调用控制器保存数据
        await ContractController.saveContract(req, res);
    } catch (error: any) {
        console.error('Error saving contract:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save contract'
        });
    }
});

// 测试路由
router.post('/test', (req, res) => {
    console.log('Contract test route accessed');
    const response: ApiResponse = {
        success: true,
        message: 'Contract test endpoint is working'
    };
    res.json(response);
});

// 创建合同
router.post('/', (req, res) => {
    try {
        const { contractInfo, paymentTerms } = req.body as {
            contractInfo: ContractInfo;
            paymentTerms: PaymentTerm[];
        };
        
        // 验证请求数据
        if (!contractInfo || !paymentTerms) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // 验证合同信息的必需字段
        if (!contractInfo.contractNo || !contractInfo.customerName || 
            !contractInfo.projectName || !contractInfo.amount || 
            !contractInfo.signDate || !contractInfo.contractName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required contract information'
            });
        }

        // 验证付款条款
        const totalRatio = paymentTerms.reduce((sum: number, term: PaymentTerm) => sum + term.ratio, 0);
        if (totalRatio !== 100) {
            return res.status(400).json({
                success: false,
                message: 'Payment terms total must be 100%'
            });
        }

        // 这里添加合同创建逻辑
        const contractId = Date.now().toString(); // 临时使用时间戳作为ID

        const response: ApiResponse = {
            success: true,
            message: 'Contract created successfully',
            data: {
                id: contractId,
                ...contractInfo,
                paymentTerms
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create contract'
        });
    }
});

// 获取合同详情
router.post('/detail', async (req, res) => {
    try {
        const { contractId } = req.body;
        
        if (!contractId) {
            return res.status(400).json({
                success: false,
                message: 'Contract ID is required'
            });
        }

        // 获取当前合同详情
        await ContractController.getCurrentContract(req, res);
    } catch (error) {
        console.error('Error fetching contract details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contract details'
        });
    }
});

// 获取当前合同
router.get('/current', async (req, res) => {
    await ContractController.getCurrentContract(req, res);
});

export default router;