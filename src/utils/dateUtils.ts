export class DateUtils {
    static formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static addYears(date: Date, years: number): Date {
        const newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() + years);
        return newDate;
    }

    static calculateWarrantyEndDate(startDate: string): string {
        const date = new Date(startDate);
        const endDate = this.addYears(date, 2); // 质保期两年
        return this.formatDate(endDate);
    }

    static isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
}
