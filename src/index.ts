// src/index.ts

import express from 'express';
import cors from 'cors';
import { ApiResponse } from './types';
import contractRoutes from './routes/contract.routes';
import paymentRoutes from './routes/payment.routes';
import guaranteeRoutes from './routes/guarantee.routes';  // 添加导入
import warrantyRoutes from './routes/warranty.routes';    // 添加导入


const app = express();
const port = process.env.PORT || 3001;

// 请求日志中间件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    // 只在开发环境下打印详细日志
    if (process.env.NODE_ENV === 'development') {
        console.log('Headers:', req.headers);
        // 克隆请求体以避免影响后续中间件
        if (req.body) {
            const bodyClone = JSON.parse(JSON.stringify(req.body));
            console.log('Body:', bodyClone);
        }
    }
    
    // 添加响应日志
    const originalSend = res.send;
    res.send = function(data) {
        console.log(`[${timestamp}] Response:`, data);
        return originalSend.call(this, data);
    };
    
    next();
});

// CORS 配置
app.use(cors({
    origin:  [
    'http://localhost:5173',
    'http://localhost:3001'
  ], // 指定前端开发服务器地址
    methods: ['POST', 'OPTIONS'],    // 只允许 POST 和 OPTIONS 方法
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // CORS 预检请求缓存1天
}));

// 请求体解析中间件
app.use(express.json({
    limit: '10mb' // 限制请求体大小
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));


// 基础路由测试
app.post('/', (_req, res) => {
    console.log('Root endpoint accessed');
    const response: ApiResponse = {
        success: true,
        message: 'Server is running',
        data: {
            version: '1.0.0',
            env: process.env.NODE_ENV
        }
    };
    res.json(response);
});

// API 路由
app.use('/api/contract', contractRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/guarantee', guaranteeRoutes); // 添加这行
app.use('/api/warranty', warrantyRoutes);   // 添加这行

// 404 处理
app.use((_req, res) => {
    const response: ApiResponse = {
        success: false,
        message: 'Route not found'
    };
    res.status(404).json(response);
});

// 统一错误处理中间件
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    
    // 区分开发环境和生产环境的错误响应
    const response: ApiResponse = {
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message || 'Internal Server Error'
            : 'Internal Server Error' // 生产环境不暴露具体错误信息
    };
    
    if (process.env.NODE_ENV === 'development') {
        (response as any).stack = err.stack;
    }
    
    res.status(err.status || 500).json(response);
});

// 启动服务器
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nAvailable routes:');
    console.log('Payment routes:');
    console.log('- POST /api/payment/generate - 生成付款文档');
    console.log('- POST /api/payment/types - 获取付款类型列表');
    console.log('- POST /api/payment/download - 下载生成的文档');
    console.log('\nContract routes:');
    console.log('- POST /api/contract/generate - 生成合同文档');
    console.log('- POST /api/contract/validate - 验证合同数据');
    console.log('- POST /api/contract/types - 获取合同类型列表');
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});

// 优雅关闭
const gracefulShutdown = () => {
    console.log('\nReceived shutdown signal: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });

    // 如果 10 秒内没有完成关闭，强制退出
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// 注册进程信号处理器
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;