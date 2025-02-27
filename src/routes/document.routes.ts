import express from 'express';
export const router = express.Router();


// 文档生成路由
router.post('/generate', async (req, res) => {
    try {
        console.log('收到文档生成请求:', req.body);
        const { documentType, contractId, projectName, clientName, amount } = req.body;

        // 验证必要参数
        if (!documentType || !contractId || !projectName || !clientName || !amount) {
            return res.status(400).json({
                success: false,
                message: '缺少必要的文档信息'
            });
        }

        // 验证文档类型
        const validTypes = ['payment', 'guarantee', 'warranty'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: '无效的文档类型'
            });
        }

        // 返回成功响应
        res.status(200).json({
            success: true,
            message: '文档生成成功',
            data: {
                documentType,
                contractId,
                projectName,
                clientName,
                amount,
                generateTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('文档生成错误:', error);
        res.status(500).json({
            success: false,
            message: '文档生成失败，请重试'
        });
    }
});

