import axios from 'axios';
import { 
    ContractInfo,
    PaymentRequest,
    ApiResponse
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// 错误处理工具函数
const handleError = (error: any, defaultMessage: string) => {
    console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        timestamp: new Date().toISOString()
    });

    if (error.response) {
        const errorMessage = error.response.data?.message || defaultMessage;
        throw new Error(errorMessage);
    }

    if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('网络请求失败，请检查网络连接');
    }

    console.error('Request configuration error:', error.config);
    throw new Error(defaultMessage);
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// 添加请求拦截器
api.interceptors.request.use(
    config => {
        console.log(`[${new Date().toISOString()}] Sending request:`, {
            url: config.url,
            method: config.method,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 添加响应拦截器
api.interceptors.response.use(
    response => {
        console.log(`[${new Date().toISOString()}] Received response:`, {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

// 合同服务
export const contractService = {
    createContract: async (contractData: ContractInfo): Promise<ApiResponse> => {
        try {
            const response = await api.post('/contracts', contractData);
            return response.data;
        } catch (error: any) {
            handleError(error, '创建合同失败');
        }
    },

    testConnection: async (): Promise<ApiResponse> => {
        try {
            const response = await api.post('/contracts/test');
            return response.data;
        } catch (error: any) {
            handleError(error, '连接测试失败');
        }
    }
};

// 付款服务
export const paymentService = {
    generateDocuments: async (data: PaymentRequest): Promise<Blob> => {
        try {
            console.log('发送付款申请数据:', data);
            const response = await api.post('/payments/generate', data, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('生成文档错误:', error);
            handleError(error, '生成付款文档失败');
        }
    },

    calculatePayment: async (paymentData: any): Promise<ApiResponse> => {
        try {
            const response = await api.post('/payments/calculate', paymentData);
            return response.data;
        } catch (error: any) {
            handleError(error, '计算付款金额失败');
        }
    },

    getPaymentTypes: async (customerType: string): Promise<ApiResponse> => {
        try {
            const response = await api.post('/payments/types', { customerType });
            return response.data;
        } catch (error: any) {
            handleError(error, '获取付款类型失败');
        }
    }
};

export default {
    contract: contractService,
    payment: paymentService
};
