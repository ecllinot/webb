import { Request, Response } from 'express';
import { ContractInfo } from '../types/contract.types';

interface ContractData {
    contractInfo: ContractInfo;
    paymentTerms: Array<{
        type: string;
        ratio: number;
    }>;
    guaranteeInfo: {
        advancePaymentRatio: number;
        advancePaymentValidity: string;
        deliveryPaymentRatio: number;
        deliveryPaymentValidity: string;
        warrantyRatio: number;
        warrantyValidity: string;
    };
}

let currentContract: ContractData | null = null;

export class ContractController {
    static async saveContract(req: Request, res: Response) {
        try {
            console.log('保存合同数据:', req.body);
            const contractData: ContractData = req.body;
            
            // 保存数据
            currentContract = contractData;
            
            return res.status(200).json({
                success: true,
                message: '合同信息保存成功',
                data: contractData
            });
        } catch (error) {
            console.error('保存错误:', error);
            return res.status(500).json({
                success: false,
                message: '保存失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }

    static async getCurrentContract(req: Request, res: Response) {
        try {
            console.log('获取当前合同信息');
            if (!currentContract) {
                return res.status(200).json({
                    success: false,
                    message: '未找到合同信息',
                    data: null
                });
            }

            return res.status(200).json({
                success: true,
                message: '获取成功',
                data: currentContract
            });
        } catch (error) {
            console.error('获取错误:', error);
            return res.status(500).json({
                success: false,
                message: '获取失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
}