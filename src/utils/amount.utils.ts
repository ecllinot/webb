export function convertToChineseAmount(amount: number): string {
    const chineseNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
    
    // 处理整数部分
    const integerPart = Math.floor(amount).toString();
    let result = '';
    
    for (let i = 0; i < integerPart.length; i++) {
        const digit = parseInt(integerPart[i]);
        const unit = units[integerPart.length - 1 - i];
        result += chineseNums[digit] + unit;
    }

    // 处理小数部分
    const decimalPart = Math.round((amount % 1) * 100);
    if (decimalPart > 0) {
        result += '元';
        const jiao = Math.floor(decimalPart / 10);
        const fen = decimalPart % 10;
        
        if (jiao > 0) result += chineseNums[jiao] + '角';
        if (fen > 0) result += chineseNums[fen] + '分';
    } else {
        result += '元整';
    }

    return result;
}

export function formatSimpleAmount(amount: number): string {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}