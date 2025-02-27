import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { 
  BasePaymentRequest, 
  CustomerType, 
  PaymentType,
  WorksBureauPaymentRequest,
  ProgressivePaymentRequest
} from '../types/payment.types';
import { calculatePayment } from '../utils/payment.utils';

export class PaymentController {
  // 生成付款申请文档
  static async generatePaymentDocument(req: Request, res: Response) {
    try {
      const paymentData = req.body;
      const documentBuffer = await DocumentService.generatePaymentDocument(paymentData);

      // 设置更多的响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent('付款申请单.docx')}`);
      res.setHeader('Content-Length', documentBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('X-Content-Type-Options', 'nosniff');

      res.send(documentBuffer);
    } catch (error) {
      console.error('付款申请文档生成错误:', error);
      res.status(500).json({
        success: false,
        message: '文档生成失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 计算付款金额
  static async calculatePayment(req: Request, res: Response) {
    try {
      const paymentData = req.body;
      console.log('Received payment data:', paymentData);

      // 基本验证
      if (!paymentData || typeof paymentData !== 'object') {
        return res.status(400).json({
          success: false,
          message: '无效的请求数据'
        });
      }

      // 验证必填字段
      const { customerType, paymentType, contractName, contractNumber, contractAmount } = paymentData;
      
      if (!customerType || !paymentType || !contractName || !contractNumber || !contractAmount) {
        return res.status(400).json({
          success: false,
          message: '缺少必要字段'
        });
      }

      // 验证金额
      if (typeof contractAmount !== 'number' || contractAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: '无效的合同金额'
        });
      }

      // 计算付款金额
      const calculation = calculatePayment(paymentData);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      console.error('付款金额计算错误:', error);
      res.status(500).json({
        success: false,
        message: '计算失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取付款类型
  static getPaymentTypes(req: Request, res: Response) {
    try {
      const { customerType } = req.params;

      // 验证客户类型
      if (!Object.values(CustomerType).includes(customerType as CustomerType)) {
        return res.status(400).json({
          success: false,
          message: '无效的客户类型'
        });
      }

      // 返回可用的付款类型
      res.json({
        success: true,
        data: Object.values(PaymentType)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取付款类型失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}