// 环境变量配置
export const config = {
    // 服务器配置
    server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost'
    },
    
    // 路径配置
    paths: {
        outputDir: 'output',
        templatesDir: 'src/templates',  // 这里加上逗号
        subDirs: {
            payment: 'payment',
            guarantee: 'guarantee',
            warranty: 'warranty'
        }
    },
    
    // CORS 配置
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // API 配置
    api: {
        prefix: '/api',
        version: 'v1'
    },

    // 文件上传配置
    upload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['.docx', '.xlsx', '.pdf']
    }
};

export default config;