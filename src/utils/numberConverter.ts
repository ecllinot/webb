export class NumberConverter {
    private static readonly DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    private static readonly UNITS = ['', '拾', '佰', '仟'];
    private static readonly GROUPS = ['', '万', '亿', '兆'];
    private static readonly MONEY_UNITS = ['元', '角', '分'];

    public static toChineseMoney(num: number): string {
        // 处理小于0的情况
        if (num < 0) {
            return `负${this.toChineseMoney(-num)}`;
        }

        // 处理0的情况
        if (num === 0) {
            return '零元整';
        }

        // 将数字转换为字符串，并保留两位小数
        const strNum = num.toFixed(2);
        const intPart = parseInt(strNum);
        const decPart = Math.round((num - intPart) * 100);

        let result = this.convertInteger(intPart);

        // 处理小数部分
        if (decPart > 0) {
            const jiao = Math.floor(decPart / 10);
            const fen = decPart % 10;

            if (jiao > 0) {
                result += this.DIGITS[jiao] + '角';
            }
            if (fen > 0) {
                result += this.DIGITS[fen] + '分';
            }
        } else {
            result += '整';
        }

        return result;
    }

    private static convertInteger(num: number): string {
        if (num === 0) {
            return '';
        }

        let result = '';
        let groupIndex = 0;
        
        while (num > 0) {
            const group = num % 10000;
            num = Math.floor(num / 10000);
            
            let temp = this.convertGroup(group);
            if (group !== 0) {
                temp += this.GROUPS[groupIndex];
            }
            
            result = temp + result;
            groupIndex++;
        }

        return result + '元';
    }

    private static convertGroup(num: number): string {
        if (num === 0) {
            return '';
        }

        let result = '';
        let hasZero = false;
        let unitIndex = 0;

        while (num > 0) {
            const digit = num % 10;
            
            if (digit === 0) {
                hasZero = true;
            } else {
                if (hasZero) {
                    result = this.DIGITS[0] + result;
                    hasZero = false;
                }
                result = this.DIGITS[digit] + this.UNITS[unitIndex] + result;
            }
            
            unitIndex++;
            num = Math.floor(num / 10);
        }

        return result;
    }
}
