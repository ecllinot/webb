import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
) => {
    console.error('Error:', err);
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : '服务器内部错误'
    });
};