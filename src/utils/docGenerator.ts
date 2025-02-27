// src/utils/docGenerator.ts
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { formatCurrency, formatDate, numberToChineseAmount } from './formatters';

export type DocumentType = 'payment' | 'guarantee' | 'warranty';
export type SubType = 'works_bureau' | 'huawei' | 'construction' | 'hsbc';

export interface DocumentParams {
  type: DocumentType;
  subType: SubType;
  documentType: string;
  variables: Record<string, any>;
}

interface TemplatePaths {
  [key: string]: string;
}

export class DocGenerator {
  private getTemplatePath(type: DocumentType, subType: string, documentType: string): string {
    const templatesDir = path.join(__dirname, '..', 'templates');
    
    let templatePath: string;
    
    // 检查是否是特殊的 Excel 文档
    const isExcelDoc = ['issue_statistics', 'deduction_list'].includes(documentType.replace(/^warranty_/, ''));
    const extension = isExcelDoc ? '.xlsx' : '.docx';

    switch(type) {
      case 'payment':
        templatePath = path.join(templatesDir, 'payment', subType, `${documentType}${extension}`);
        break;
      case 'guarantee':
        templatePath = path.join(templatesDir, 'guarantee', subType, `${documentType}_payment${extension}`);
        break;
      case 'warranty':
        // 移除可能存在的重复前缀
        const docName = documentType.replace(/^warranty_/, '');
        templatePath = path.join(templatesDir, 'warranty', `warranty_${docName}${extension}`);
        break;
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }

    console.log('模板路径:', templatePath);
    console.log('文件扩展名:', extension);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    return templatePath;
  }

  private formatDocumentVariables(variables: Record<string, any>): Record<string, any> {
    try {
      // 创建一个新的对象来存储格式化后的数据
      const formatted: Record<string, any> = {};
      
      // 复制所有原始变量
      Object.assign(formatted, variables);

      // 定义需要格式化的日期字段
      const dateFields = [
        'signDate',
        'advancePaymentValidity',
        'deliveryPaymentValidity',
        'warrantyValidity',
        'validityPeriod'
      ];

      // 处理日期字段
      dateFields.forEach(field => {
        if (variables[field]) {
          formatted[field] = formatDate(variables[field]);
          console.log(`格式化日期 ${field}:`, variables[field], '=>', formatted[field]);
        }
      });

      // 定义需要格式化的金额字段
      const amountFields = [
        'contractAmount',
        'guaranteeAmount',
        'warrantyAmount',
        'currentInvestment',
        'previouslyPaid',
        'applyAmount'
      ];

      // 处理金额字段
      amountFields.forEach(field => {
        if (typeof variables[field] === 'number') {
          formatted[field] = formatCurrency(variables[field]);
          formatted[`${field}InWords`] = numberToChineseAmount(variables[field]);
          console.log(`格式化金额 ${field}:`, variables[field], '=>', formatted[field]);
        }
      });

      // 输出最终格式化的变量用于调试
      console.log('格式化后的变量:', formatted);
      return formatted;

    } catch (error) {
      console.error('数据格式化错误:', error);
      throw error;
    }
  }

  async generateDocument(data: DocumentParams): Promise<Buffer> {
    try {
      const templatePath = this.getTemplatePath(data.type, data.subType, data.documentType);
      const extension = path.extname(templatePath).toLowerCase();

      // Excel 文件直接返回
      if (extension === '.xlsx') {
        console.log('处理 Excel 文件:', templatePath);
        return fs.readFileSync(templatePath);
      }

      // Word 文档的处理逻辑
      console.log('处理 Word 文档:', templatePath);
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });

      const formattedVariables = this.formatDocumentVariables(data.variables);
      console.log('渲染文档使用的变量:', formattedVariables);
      
      doc.render(formattedVariables);

      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });

      return buffer;
    } catch (error) {
      console.error('文档生成错误:', error);
      throw error;
    }
  }

  async generateMultipleDocuments(documents: DocumentParams[]): Promise<Buffer[]> {
    return Promise.all(
      documents.map(doc => this.generateDocument(doc))
    );
  }

  async saveDocument(buffer: Buffer, outputPath: string): Promise<void> {
    try {
      await this.ensureTempDirectory(path.dirname(outputPath));
      await fs.promises.writeFile(outputPath, buffer);
      console.log('文档已保存到:', outputPath);
    } catch (error) {
      console.error('保存文档错误:', error);
      throw error;
    }
  }

  private async ensureTempDirectory(dirPath: string): Promise<void> {
    try {
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
        console.log('已创建目录:', dirPath);
      }
    } catch (error) {
      console.error('创建临时目录失败:', error);
      throw error;
    }
  }

  async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log('已清理临时文件:', filePath);
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

export const docGenerator = new DocGenerator();