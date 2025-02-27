// backend/src/config/app.ts
export const appConfig = {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    apiPrefix: '/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};