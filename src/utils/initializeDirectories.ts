import fs from 'fs';
import path from 'path';
import { CustomerType as PaymentCustomerType, PaymentType } from '../types/payment.types';
import { GuaranteeTemplateType, GuaranteeType } from '../types/guarantee.types';
import { config } from '../config';

// 定义模板结构类型
type TemplateStructure = {
    payment: {
        [K in PaymentCustomerType]: PaymentType[];
    };
    guarantee: {
        [K in GuaranteeTemplateType]: GuaranteeType[];
    };
};

// 定义模板结构
const TEMPLATE_STRUCTURE: TemplateStructure = {
    // 付款申请模板
    payment: {
        [PaymentCustomerType.WORKS_BUREAU]: [
            PaymentType.ADVANCE,
            PaymentType.DELIVERY,
            PaymentType.COMPLETION,
            PaymentType.WARRANTY
        ],
        [PaymentCustomerType.HUAWEI]: [
            PaymentType.ADVANCE,
            PaymentType.DELIVERY,
            PaymentType.COMPLETION,
            PaymentType.WARRANTY
        ],
        [PaymentCustomerType.CONSTRUCTION]: [
            PaymentType.ADVANCE,
            PaymentType.DELIVERY,
            PaymentType.COMPLETION,
            PaymentType.WARRANTY
        ],
        [PaymentCustomerType.OTHER]: [
            PaymentType.ADVANCE,
            PaymentType.DELIVERY,
            PaymentType.COMPLETION,
            PaymentType.WARRANTY
        ]
    },
    // 保函模板
    guarantee: {
        [GuaranteeTemplateType.WORKS_BUREAU]: [
            GuaranteeType.ADVANCE_PAYMENT,
            GuaranteeType.DELIVERY_PAYMENT
        ],
        [GuaranteeTemplateType.HSBC]: [
            GuaranteeType.ADVANCE_PAYMENT,
            GuaranteeType.PERFORMANCE,
            GuaranteeType.WARRANTY
        ],
        [GuaranteeTemplateType.INFRASTRUCTURE]: [
            GuaranteeType.ADVANCE_PAYMENT,
            GuaranteeType.WARRANTY
        ]
    }
};

export function initializeDirectories() {
    const { paths } = config;
    const baseDir = process.cwd();

    // 确保输出目录存在
    const outputDir = path.join(baseDir, paths.outputDir);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // 创建付款申请输出目录
    const paymentOutputDir = path.join(outputDir, paths.subDirs.payment);
    if (!fs.existsSync(paymentOutputDir)) {
        fs.mkdirSync(paymentOutputDir);
    }

    // 创建保函申请输出目录
    const guaranteeOutputDir = path.join(outputDir, paths.subDirs.guarantee);
    if (!fs.existsSync(guaranteeOutputDir)) {
        fs.mkdirSync(guaranteeOutputDir);
    }

    // 确保模板目录结构完整
    const templatesDir = path.join(baseDir, 'src', 'templates');
    
    // 付款申请模板目录
    const paymentTemplatesDir = path.join(templatesDir, 'payment');
    ensureCustomerTypeDirs(paymentTemplatesDir, Object.values(PaymentCustomerType));
    
    // 为每个客户类型创建付款类型模板
    Object.entries(TEMPLATE_STRUCTURE.payment).forEach(([customerType, paymentTypes]) => {
        const customerTypeDir = path.join(paymentTemplatesDir, customerType);
        ensureTemplateFiles(customerTypeDir, paymentTypes);
    });

    // 保函申请模板目录
    const guaranteeTemplatesDir = path.join(templatesDir, 'guarantee');
    ensureCustomerTypeDirs(guaranteeTemplatesDir, Object.values(GuaranteeTemplateType));
    
    // 为每个模板类型创建对应的保函类型模板
    Object.entries(TEMPLATE_STRUCTURE.guarantee).forEach(([templateType, guaranteeTypes]) => {
        const templateTypeDir = path.join(guaranteeTemplatesDir, templateType);
        ensureTemplateFiles(templateTypeDir, guaranteeTypes);
    });
}

function ensureCustomerTypeDirs(baseDir: string, types: string[]) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    types.forEach(type => {
        const dir = path.join(baseDir, type);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
}

function ensureTemplateFiles(dir: string, types: string[]) {
    types.forEach(type => {
        const templateFile = path.join(dir, `${type}.docx`);
        if (!fs.existsSync(templateFile)) {
            fs.writeFileSync(templateFile, '');
        }
    });
}

export function checkTemplateFiles(): void {
    const templatesRoot = path.resolve(process.cwd(), 'src', 'templates');
    let missingTemplates: string[] = [];

    Object.entries(TEMPLATE_STRUCTURE).forEach(([category, structure]) => {
        Object.entries(structure).forEach(([customerType, templates]) => {
            templates.forEach(templateName => {
                const templatePath = path.join(
                    templatesRoot,
                    category,
                    customerType,
                    `${templateName}.docx`
                );
                
                if (!fs.existsSync(templatePath)) {
                    missingTemplates.push(`${category}/${customerType}/${templateName}.docx`);
                }
            });
        });
    });

    if (missingTemplates.length > 0) {
        console.log('\n⚠️ 以下模板文件需要添加:');
        missingTemplates.forEach(template => {
            console.log(`  src/templates/${template}`);
        });
        console.log('\n提示: 请将对应的模板文件复制到上述路径\n');
    } else {
        console.log('✓ 所有模板文件已就绪');
    }
}

export type { TemplateStructure };