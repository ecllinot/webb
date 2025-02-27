import { BasePaymentRequest, CustomerType, PaymentType, ProgressivePaymentRequest } from '../types/payment.types';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs-extra';
import path from 'path';
import { calculatePayment } from '../utils/payment.utils';

export class DocumentService {
  // 数字转中文大写
  private static numberToChineseAmount(num: number): string {
    const chnNumChar = ["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"];
    const chnUnitSection = ["","万","亿","万亿"];
    const chnUnitChar = ["","拾","佰","仟"];
    
    const numString = Math.floor(num).toString();
    let index = 0;
    let sectionToChn = '';
    let result = '';
    
    while (index < numString.length) {
      const section = numString.slice(Math.max(0, numString.length - (index + 4)), numString.length - index);
      sectionToChn = this.sectionToChinese(section, chnNumChar, chnUnitChar);
      
      if (sectionToChn) {
        result = sectionToChn + chnUnitSection[index / 4] + result;
      }
      
      index += 4;
    }

    return result + "元整";
  }

  private static sectionToChinese(section: string, chnNumChar: string[], chnUnitChar: string[]): string {
    let result = '';
    let zero = false;
    let pos = 0;

    while (pos < section.length) {
      const num = parseInt(section.charAt(pos));
      if (num === 0) {
        if (!zero) {
          zero = true;
          result += chnNumChar[0];
        }
      } else {
        zero = false;
        result += chnNumChar[num] + chnUnitChar[section.length - 1 - pos];
      }
      pos++;
    }

    return result;
  }

  // 格式化金额
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static async generatePaymentDocument(data: BasePaymentRequest): Promise<Buffer> {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'payment',
        data.customerType,
        `${data.paymentType}.docx`
      );

      console.log('Template path:', templatePath);

      if (!await fs.pathExists(templatePath)) {
        throw new Error(`找不到模板文件: ${templatePath}`);
      }

      const content = await fs.readFile(templatePath);
      const calculation = calculatePayment(data);

      // 准备模板数据
      const templateData = {
        // 工务署模板变量
        customerName: data.customerType === CustomerType.WORKS_BUREAU ? '工务署' : '',
        contractNumber: data.contractNumber,
        contractName: data.contractName,
        paymentAmountInWords: this.numberToChineseAmount(calculation.amount),
        paymentAmount: this.formatCurrency(calculation.amount),

        // 华为&基建客户模板变量
        contractAmount: this.formatCurrency(data.contractAmount),
        currentInvestment: data.customerType !== CustomerType.WORKS_BUREAU 
          ? this.formatCurrency((data as ProgressivePaymentRequest).currentInvestment)
          : '',
        calculationFormula: calculation.calculationFormula,
        guaranteeValidityPeriod: data.customerType !== CustomerType.WORKS_BUREAU 
          ? (data as ProgressivePaymentRequest).guaranteeValidityPeriod || ''
          : '',

        // 通用字段
        currentDate: data.currentDate || new Date().toLocaleDateString('zh-CN'),
      };

      console.log('Template data:', templateData);

      // 创建文档
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter() { return ''; }
      });

      // 渲染文档
      doc.render(templateData);

      // 生成文档
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      return buffer;

    } catch (error) {
      console.error('Document generation error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}