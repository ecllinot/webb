import express from 'express';
import { router as contractRouter } from './contract.routes';
import { router as paymentRouter } from './payment.routes';
import { router as guaranteeRouter } from './guarantee.routes';
import { router as warrantyRouter } from './warranty.routes';

const router = express.Router();

// 注册所有路由
router.use('/api/contracts', contractRouter);
router.use('/api/payments', paymentRouter);
router.use('/api/guarantees', guaranteeRouter);
router.use('/api/warranties', warrantyRouter);

export default router;