import { 
    CustomerType, 
    PaymentType, 
    WorksBureauPaymentRequest, 
    ProgressivePaymentRequest 
} from '../types/payment.types';

// 工务署付款比例配置
const WORKS_BUREAU_RATIOS = {
    [PaymentType.ADVANCE]: 0.3,    // 预付款 30%
    [PaymentType.DELIVERY]: 0.5,   // 交付款 50%
    [PaymentType.COMPLETION]: 0.1, // 验收款 10%
    [PaymentType.WARRANTY]: 0.1    // 质保金 10%
};

// 华为和基建客户累计付款比例
const PROGRESSIVE_RATIOS = {
    ADVANCE: 0.1,     // 预付款 10%
    DELIVERY: 0.8,    // 到货款 累计80%
    COMPLETION: 0.97, // 竣工款 累计97%
    WARRANTY: 0.03    // 质保金 3%
};

export function calculatePayment(paymentData: WorksBureauPaymentRequest | ProgressivePaymentRequest) {
    const { customerType, paymentType, contractAmount } = paymentData;
    let amount = 0;
    let calculationFormula = '';

    if (customerType === CustomerType.WORKS_BUREAU) {
        // 工务署付款计算
        amount = contractAmount * WORKS_BUREAU_RATIOS[paymentType];
        calculationFormula = `合同金额 ${contractAmount} × ${WORKS_BUREAU_RATIOS[paymentType] * 100}%`;
    } else {
        // 华为和基建客户付款计算
        const progressiveData = paymentData as ProgressivePaymentRequest;
        
        switch (paymentType) {
            case PaymentType.ADVANCE:
                // 预付款 = 合同金额 × 10%
                amount = contractAmount * PROGRESSIVE_RATIOS.ADVANCE;
                calculationFormula = `合同金额 ${contractAmount} × ${PROGRESSIVE_RATIOS.ADVANCE * 100}%`;
                break;

            case PaymentType.DELIVERY:
                // 到货款 = 本期投资估值 × 80% - 已付款金额
                amount = progressiveData.currentInvestment * PROGRESSIVE_RATIOS.DELIVERY - progressiveData.previouslyPaid;
                calculationFormula = `本期投资估值 ${progressiveData.currentInvestment} × ${PROGRESSIVE_RATIOS.DELIVERY * 100}% - 已付款金额 ${progressiveData.previouslyPaid}`;
                break;

            case PaymentType.COMPLETION:
                // 竣工款 = 本期投资估值 × 97% - 已付款金额
                amount = progressiveData.currentInvestment * PROGRESSIVE_RATIOS.COMPLETION - progressiveData.previouslyPaid;
                calculationFormula = `本期投资估值 ${progressiveData.currentInvestment} × ${PROGRESSIVE_RATIOS.COMPLETION * 100}% - 已付款金额 ${progressiveData.previouslyPaid}`;
                break;

            case PaymentType.WARRANTY:
                // 质保金 = 合同金额 × 3%
                amount = contractAmount * PROGRESSIVE_RATIOS.WARRANTY;
                calculationFormula = `合同金额 ${contractAmount} × ${PROGRESSIVE_RATIOS.WARRANTY * 100}%`;
                break;
        }
    }

    // 确保金额不为负数，并四舍五入到2位小数
    amount = Math.max(0, Math.round(amount * 100) / 100);

    return {
        amount,
        amountInWords: convertToChineseAmount(amount),
        calculationFormula
    };
}

// 金额转中文大写
function convertToChineseAmount(amount: number): string {
    const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const cnIntRadice = ['', '拾', '佰', '仟'];
    const cnIntUnits = ['', '万', '亿', '兆'];
    const cnDecUnits = ['角', '分'];
    const cnInteger = '整';
    const cnIntLast = '元';

    // 转换为字符串，并分割整数和小数部分
    const parts = amount.toString().split('.');
    let int = parts[0];
    const decimal = parts[1] || '00';

    // 处理整数部分
    let chineseInt = '';
    let zeroCount = 0;
    const intLen = int.length;

    for (let i = 0; i < intLen; i++) {
        const n = parseInt(int.charAt(i));
        const p = intLen - i - 1;
        const q = p / 4;
        const m = p % 4;

        if (n === 0) {
            zeroCount++;
        } else {
            if (zeroCount > 0) {
                chineseInt += cnNums[0];
            }
            zeroCount = 0;
            chineseInt += cnNums[n] + cnIntRadice[m];
        }

        if (m === 0 && zeroCount < 4) {
            chineseInt += cnIntUnits[q];
        }
    }

    chineseInt += cnIntLast;

    // 处理小数部分
    let chineseDecimal = '';
    for (let i = 0; i < 2; i++) {
        const n = parseInt(decimal.charAt(i));
        if (n !== 0) {
            chineseDecimal += cnNums[n] + cnDecUnits[i];
        }
    }

    // 拼接结果
    if (chineseDecimal === '') {
        return chineseInt + cnInteger;
    }
    return chineseInt + chineseDecimal;
}
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount);
}
