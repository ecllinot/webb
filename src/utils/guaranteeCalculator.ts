import { CustomerType, GuaranteeType } from '../types/guarantee.types';

// 默认保函比例配置
const DEFAULT_GUARANTEE_RATIOS = {
    [CustomerType.WORKS_BUREAU]: {
        [GuaranteeType.ADVANCE_PAYMENT]: 0.3,    // 预付款保函 30%
        [GuaranteeType.DELIVERY_PAYMENT]: 0.5,   // 发货款保函 50%
    },
    [CustomerType.CONSTRUCTION]: {
        [GuaranteeType.ADVANCE_PAYMENT]: 0.1,    // 预付款保函 10%
    }
};

/**
 * 计算保函金额
 * @param customerType 客户类型
 * @param guaranteeType 保函类型
 * @param contractAmount 合同金额
 * @param customRatio 自定义比例（用于汇丰银行保函）
 * @param customAmount 自定义金额（用于汇丰银行保函）
 * @returns 计算后的保函金额
 */
export function calculateGuaranteeAmount(
    customerType: CustomerType,
    guaranteeType: GuaranteeType,
    contractAmount: number,
    customRatio?: number,
    customAmount?: number
): number {
    // 汇丰银行保函使用自定义金额
    if (customerType === CustomerType.HSBC && customAmount) {
        return customAmount;
    }

    // 其他保函使用默认比例计算
    const ratio = customRatio || DEFAULT_GUARANTEE_RATIOS[customerType]?.[guaranteeType];
    
    if (!ratio) {
        throw new Error('未指定有效的保函比例');
    }

    // 计算保函金额
    const amount = contractAmount * ratio;
    
    // 四舍五入到2位小数
    return Math.round(amount * 100) / 100;
}


/**
 * 将数字转换为中文大写金额
 * @param amount 金额
 * @returns 中文大写金额
 */
export function convertToChinese(amount: number): string {
    const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
    const numbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    
    // 处理整数部分
    const integerPart = Math.floor(amount).toString();
    let result = '';
    
    for (let i = 0; i < integerPart.length; i++) {
        const digit = parseInt(integerPart[i]);
        const unit = units[integerPart.length - 1 - i];
        result += numbers[digit] + unit;
    }
    
    return result + '圆整';
}