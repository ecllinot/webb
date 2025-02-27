import path from 'path';
import fs from 'fs-extra';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { 
    WarrantyPaymentVariables, 
    WarrantyDocumentType,
    TEMPLATE_FILES,
    WarrantyDocRequest,
    WarrantyDocResponse
} from '../types/warranty.types';

export async function generateWarrantyDocs(
    data: WarrantyDocRequest
): Promise<WarrantyDocResponse> {
    try {
        const outputDir = path.join(process.cwd(), 'output', 'warranty');
        await fs.ensureDir(outputDir);

        const documentPaths: string[] = [];
        const downloadUrls: string[] = [];
        const fileNames: string[] = [];

        // 只处理选中的文档
        for (const docType of data.selectedDocs) {
            const templateFile = TEMPLATE_FILES[docType];
            if (!templateFile) {
                console.warn(`未找到模板文件: ${docType}`);
                continue;
            }

            const templatePath = path.join(
                process.cwd(),
                'src',
                'templates',
                'warranty',
                templateFile
            );

            // 检查模板文件是否存在
            if (!await fs.pathExists(templatePath)) {
                console.warn(`模板文件不存在: ${templateFile}`);
                continue;
            }

            // 生成输出文件名
            const timestamp = new Date().getTime();
            const outputFileName = `${docType}_${data.contractNo}_${timestamp}${path.extname(templateFile)}`;
            const outputPath = path.join(outputDir, outputFileName);

            // 根据文件类型处理
            if (templateFile.endsWith('.docx')) {
                await processWordTemplate(templatePath, outputPath, data.variables);
            } else if (templateFile.endsWith('.xlsx')) {
                await processExcelTemplate(templatePath, outputPath, data.variables);
            }

            documentPaths.push(outputPath);
            downloadUrls.push(`/api/warranty/download/${outputFileName}`);
            fileNames.push(outputFileName);
        }

        return {
            documentPaths,
            downloadUrls,
            fileNames
        };
    } catch (error) {
        console.error('质保金文档生成错误:', error);
        throw error;
    }
}

// Excel 文件处理函数
async function processExcelTemplate(templatePath: string, outputPath: string, variables: WarrantyPaymentVariables): Promise<void> {
    try {
        const XLSX = require('xlsx');
        
        // 读取 Excel 模板
        const workbook = XLSX.readFile(templatePath);
        
        // 遍历所有工作表
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            
            // 获取工作表的有效范围
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            
            // 遍历每个单元格
            for (let R = range.s.r; R <= range.e.r; R++) {
                for (let C = range.s.c; C <= range.e.c; C++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.t === 's' && cell.v) {  // 如果是字符串类型的单元格
                        let cellValue = cell.v;
                        // 替换变量
                        Object.entries(variables).forEach(([varKey, varValue]) => {
                            const placeholder = `{${varKey}}`;
                            if (cellValue.includes(placeholder)) {
                                let formattedValue = varValue;
                                if (typeof varValue === 'number') {
                                    formattedValue = varValue.toFixed(2);
                                }
                                cellValue = cellValue.replace(placeholder, String(formattedValue));
                            }
                        });
                        
                        // 更新单元格值
                        worksheet[cellAddress] = {
                            t: 's',
                            v: cellValue,
                            w: cellValue
                        };
                    }
                }
            }
        }
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        await fs.ensureDir(outputDir);
        
        // 写入新文件
        XLSX.writeFile(workbook, outputPath, { bookType: 'xlsx' });
        
        console.log(`Excel文件处理成功: ${outputPath}`);
    } catch (error) {
        console.error('Excel 文件处理错误:', error);
        throw new Error(`Excel文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}

// Word 文件处理函数
async function processWordTemplate(templatePath: string, outputPath: string, variables: WarrantyPaymentVariables): Promise<void> {
    try {
        const content = await fs.readFile(templatePath, 'binary');
        const zip = new PizZip(content);
        
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        });
        
        // 渲染文档
        doc.render(variables);
        
        // 生成文档
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });
        
        // 写入文件
        await fs.writeFile(outputPath, buf);
        
        console.log(`Word文件处理成功: ${outputPath}`);
    } catch (error) {
        console.error('Word 文件处理错误:', error);
        throw error;
    }
}

export default {
    generateWarrantyDocs
};