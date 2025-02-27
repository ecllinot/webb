import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';

export class DocumentController {
  static async generateDocument(req: Request, res: Response) {
    try {
      const { templateType, subType, data } = req.body;

      // 生成文档
      const documentBuffer = await DocumentService.generateDocument(
        templateType,
        subType,
        data
      );

      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${templateType}_${subType}.docx`);

      // 发送文档
      res.send(documentBuffer);
    } catch (error) {
      console.error('文档生成错误:', error);
      res.status(500).json({
        success: false,
        message: '文档生成失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  static async getTemplateTypes(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const templates = DocumentService.getTemplateTypes(type as any);
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取模板类型失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}