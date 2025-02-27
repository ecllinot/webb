declare module 'docxtemplater' {
    class Docxtemplater {
        constructor(zip: any, options?: any);
        setData(data: any): void;
        render(): void;
        getZip(): any;
    }
    export = Docxtemplater;
}