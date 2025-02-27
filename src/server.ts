import express from 'express';
import cors from 'cors';
import paymentRoutes from './routes/payment.routes';
import guaranteeRoutes from './routes/guarantee.routes';
import warrantyRoutes from './routes/warranty.routes';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use('/api/payments', paymentRoutes);
app.use('/api/guarantees', guaranteeRoutes);
app.use('/api/warranties', warrantyRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

export default app;