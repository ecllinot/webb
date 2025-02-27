import { prisma } from '../utils/db';

interface ContractInfo {
    projectName: string;      // 项目名称
    contractName: string;     // 合同名称
    contractNo: string;       // 合同编号
    customerName: string;     // 客户名称
    contractAmount: number;   // 合同金额
    signDate?: string;       // 签订日期
    startDate?: string;      // 开始日期
    endDate?: string;        // 结束日期
    status?: string;         // 合同状态
}

/**
 * 获取合同信息
 * @param contractNo 合同编号
 * @returns 合同信息或null
 */
export async function getContractInfo(contractNo: string): Promise<ContractInfo | null> {
    try {
        // 从数据库获取合同信息
        const contract = await prisma.contract.findUnique({
            where: { contractNo },
            select: {
                projectName: true,
                contractName: true,
                contractNo: true,
                customerName: true,
                contractAmount: true,
                signDate: true,
                startDate: true,
                endDate: true,
                status: true
            }
        });

        if (!contract) {
            console.warn(`未找到合同信息: ${contractNo}`);
            return null;
        }

        // 格式化日期字段
        return {
            ...contract,
            signDate: contract.signDate?.toISOString().split('T')[0],
            startDate: contract.startDate?.toISOString().split('T')[0],
            endDate: contract.endDate?.toISOString().split('T')[0]
        };

    } catch (error) {
        console.error('获取合同信息失败:', error);
        throw new Error('获取合同信息失败');
    }
}