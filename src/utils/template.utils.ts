import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export class TemplateUtils {
    /**
     * 获取模板路径
     * @param category 文档类别 (payment/guarantee/warranty)
     * @param customerType 客户类型
     * @param templateName 模板名称
     */
    static getTemplatePath(category: string, customerType?: string, templateName?: string): string {
        const basePath = path.join(process.cwd(), config.paths.templatesDir, category);
        
        if (!customerType) {
            return path.join(basePath, templateName || '');
        }
        
        return path.join(basePath, customerType, templateName || '');
    }

    /**
     * 获取输出路径
     * @param category 文档类别
     * @param fileName 文件名
     */
    static getOutputPath(category: string, fileName: string): string {
        return path.join(process.cwd(), config.paths.outputDir, category, fileName);
    }

    /**
     * 生成唯一文件名
     * @param prefix 文件名前缀
     * @param extension 文件扩展名
     */
    static generateFileName(prefix: string, extension: string = 'docx'): string {
        const timestamp = new Date().getTime();
        const uuid = uuidv4().slice(0, 8);
        return `${prefix}_${timestamp}_${uuid}.${extension}`;
    }

    /**
     * 加载模板文件
     * @param category 文档类别
     * @param customerType 客户类型
     * @param templateName 模板名称
     */
    static async loadTemplate(category: string, customerType: string, templateName: string): Promise<Buffer> {
        try {
            const templatePath = this.getTemplatePath(category, customerType, templateName);
            
            if (!await fs.pathExists(templatePath)) {
                throw new Error(`模板文件不存在: ${templatePath}`);
            }
            
            return await fs.readFile(templatePath);
        } catch (error) {
            console.error('加载模板错误:', error);
            throw new Error(`加载模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 处理模板
     * @param templateBuffer 模板文件buffer
     * @param data 要填充的数据
     */
    static async processTemplate(templateBuffer: Buffer, data: any): Promise<Buffer> {
        try {
            const zip = new PizZip(templateBuffer);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // 渲染数据到模板
            doc.render(data);

            // 生成文档
            return doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE'
            });
        } catch (error) {
            console.error('模板处理错误:', error);
            throw new Error(`模板处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 保存生成的文件
     * @param category 文档类别
     * @param fileName 文件名
     * @param buffer 文件内容
     */
    static async saveDocument(category: string, fileName: string, buffer: Buffer): Promise<string> {
        try {
            const outputPath = this.getOutputPath(category, fileName);
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, buffer);
            return outputPath;
        } catch (error) {
            console.error('保存文档错误:', error);
            throw new Error(`保存文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 生成文档的完整流程
     * @param category 文档类别
     * @param customerType 客户类型
     * @param templateName 模板名称
     * @param data 要填充的数据
     * @param fileNamePrefix 文件名前缀
     */
    static async generateDocument(
        category: string,
        customerType: string,
        templateName: string,
        data: any,
        fileNamePrefix: string
    ): Promise<{
        filePath: string;
        fileName: string;
    }> {
        try {
            // 加载模板
            const templateBuffer = await this.loadTemplate(category, customerType, templateName);
            
            // 处理模板
            const processedBuffer = await this.processTemplate(templateBuffer, data);
            
            // 生成文件名
            const fileName = this.generateFileName(fileNamePrefix);
            
            // 保存文档
            const filePath = await this.saveDocument(category, fileName, processedBuffer);
            
            return {
                filePath,
                fileName
            };
        } catch (error) {
            console.error('生成文档错误:', error);
            throw new Error(`生成文档失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     */
    static async fileExists(filePath: string): Promise<boolean> {
        try {
            return await fs.pathExists(filePath);
        } catch (error) {
            console.error('检查文件存在错误:', error);
            return false;
        }
    }

    /**
     * 删除文件
     * @param filePath 文件路径
     */
    static async deleteFile(filePath: string): Promise<void> {
        try {
            if (await this.fileExists(filePath)) {
                await fs.unlink(filePath);
            }
        } catch (error) {
            console.error('删除文件错误:', error);
            throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
}