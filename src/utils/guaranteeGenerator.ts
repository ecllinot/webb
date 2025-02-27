import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import { CustomerType, GuaranteeType, GuaranteeVariables } from '../types/guarantee.types';

export async function generateGuaranteeDoc(
    customerType: CustomerType,
    guaranteeType: GuaranteeType,
    variables: GuaranteeVariables
): Promise<string> {
    try {
        // 获取模板路径
        const templatePath = path.join(
            process.cwd(),
            'src',
            'templates',
            'guarantee',
            customerType,
            `${guaranteeType}.docx`
        );

        console.log('使用模板路径:', templatePath);

        // 读取模板文件
        const content = fs.readFileSync(templatePath, 'binary');

        // 创建 PizZip 实例
        const zip = new PizZip(content);

        // 统一使用单括号作为分隔符
        const delimiters = { start: '{', end: '}' };

        // 创建 Docxtemplater 实例
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: delimiters  // 所有客户统一使用单括号
        });

        // 准备变量数据
        const data = {
            ...variables,
            currentDate: new Date().toLocaleDateString('zh-CN')
        };

        console.log('渲染数据:', JSON.stringify(data, null, 2));

        // 渲染文档
        try {
            doc.render(data);
        } catch (error) {
            console.error('渲染错误:', error);
            if (error instanceof Error) {
                throw new Error(`文档渲染失败: ${error.message}`);
            }
            throw new Error('文档渲染失败：未知错误');
        }

        // 生成输出文件名
        const timestamp = new Date().getTime();
        const fileName = `${customerType}_${guaranteeType}_${timestamp}.docx`;
        const outputDir = path.join(process.cwd(), 'output', 'guarantee');
        const outputPath = path.join(outputDir, fileName);

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 生成文档
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        // 写入文件
        fs.writeFileSync(outputPath, buf);
        console.log('文档已生成:', outputPath);

        return outputPath;

    } catch (error) {
        console.error('保函生成错误:', error);
        throw error;
    }
}
