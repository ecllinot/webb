// 定义合同接口
interface Contract {
    contractNo: string;
    projectName: string;
    contractName: string;
    customerName: string;
    contractAmount: number;
    signDate?: Date;
    startDate?: Date;
    endDate?: Date;
}

// 提供一个完整的 mock 实现
export const prisma = {
    contract: {
        findMany: async (): Promise<Contract[]> => [],
        findUnique: async (query: any): Promise<Contract | null> => ({
            contractNo: 'TEST001',
            projectName: '测试项目',
            contractName: '测试合同',
            customerName: '测试客户',
            contractAmount: 100000,
            signDate: new Date(),
            startDate: new Date(),
            endDate: new Date()
        }),
        create: async (data: any): Promise<Contract> => data,
        update: async (data: any): Promise<Contract> => data,
        delete: async (data: any): Promise<Contract> => data
    }
};