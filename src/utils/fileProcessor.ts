import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { 
    WarrantyRecord, 
    FileProcessResult,
    WarrantyStatus 
} from '../types/warranty.types';

export class FileProcessor {
    /**
     * 处理Excel数据
     * @param buffer Excel文件buffer
     * @returns 处理后的质保金记录数组
     */
    static processExcelData(buffer: Buffer): WarrantyRecord[] {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const records: any[] = XLSX.utils.sheet_to_json(worksheet);

            // 验证和转换数据
            return records.map(record => ({
                contractNo: String(record.contractNo || ''),
                projectName: String(record.projectName || ''),
                warrantyAmount: Number(record.warrantyAmount) || 0,
                expiryDate: new Date(record.expiryDate),
                status: this.validateStatus(record.status),
                remarks: record.remarks ? String(record.remarks) : undefined
            }));
        } catch (error) {
            console.error('Excel数据处理错误:', error);
            throw new Error(error instanceof Error ? 
                `Excel数据处理失败: ${error.message}` : 
                'Excel数据处理失败'
            );
        }
    }

    /**
     * 生成Excel文件
     * @param data 质保金记录数组
     * @returns Excel文件buffer
     */
    static generateExcel(data: WarrantyRecord[]): Buffer {
        try {
            // 准备表头
            const headers = {
                contractNo: '合同编号',
                projectName: '项目名称',
                warrantyAmount: '质保金金额',
                expiryDate: '到期日期',
                status: '状态',
                remarks: '备注'
            };

            // 格式化数据
            const formattedData = data.map(record => ({
                ...record,
                expiryDate: record.expiryDate.toISOString().split('T')[0],
                warrantyAmount: record.warrantyAmount.toFixed(2)
            }));

            // 创建工作表
            const worksheet = XLSX.utils.json_to_sheet([headers, ...formattedData], {
                header: Object.keys(headers),
                skipHeader: true
            });

            // 设置列宽
            const colWidths = [15, 30, 15, 15, 10, 30];
            worksheet['!cols'] = colWidths.map(width => ({ width }));

            // 创建工作簿
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '质保金记录');
            
            return XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx',
                bookSST: false
            });
        } catch (error) {
            console.error('Excel生成错误:', error);
            throw new Error(error instanceof Error ? 
                `Excel生成失败: ${error.message}` : 
                'Excel生成失败'
            );
        }
    }

    /**
     * 生成文档预览
     * @param buffer 文件buffer
     * @param fileType 文件类型
     * @returns 预览HTML字符串
     */
    static async generatePreview(buffer: Buffer, fileType: string): Promise<string> {
        try {
            switch (fileType.toLowerCase()) {
                case 'xlsx': {
                    const workbook = XLSX.read(buffer, { type: 'buffer' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    return XLSX.utils.sheet_to_html(firstSheet);
                }
                case 'docx': {
                    const result = await mammoth.convertToHtml({buffer: buffer});
                    return result.value;
                }
                default:
                    throw new Error(`不支持的文件类型: ${fileType}`);
            }
        } catch (error) {
            console.error('预览生成失败:', error);
            throw new Error(error instanceof Error ? 
                `预览生成失败: ${error.message}` : 
                '预览生成失败'
            );
        }
    }

    /**
     * 处理上传的文件
     * @param file 上传的文件
     * @returns 处理结果
     */
static async processUploadedFile(file: Express.Multer.File): Promise<FileProcessResult> {
    try {
        const fileExt = file.originalname.split('.').pop();
        if (!fileExt) {
            throw new Error('无法确定文件类型');
        }

        // 根据路由中的使用方式修改返回值
        const result: FileProcessResult = {
            success: true,
            data: [],
            previewUrl: ''
        };

        // 如果是 Excel 文件，处理数据
        if (fileExt === 'xlsx') {
            result.data = this.processExcelData(file.buffer);
        }
		

        // 生成预览
        result.previewUrl = await this.generatePreview(file.buffer, fileExt);

        return result;
    } catch (error) {
        console.error('文件处理错误:', error);
        throw new Error(error instanceof Error ? 
            `文件处理失败: ${error.message}` : 
            '文件处理失败'
        );
    }
}



    /**
     * 验证状态值
     * @param status 状态值
     * @returns 有效的状态值
     */
    private static validateStatus(status: any): WarrantyStatus {
        if (Object.values(WarrantyStatus).includes(status)) {
            return status as WarrantyStatus;
        }
        return WarrantyStatus.PENDING; // 默认状态
    }
}