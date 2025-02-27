export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}


export interface FileResponse {
    downloadUrl: string;
    previewUrl?: string;
}

export interface TemplateStructure {
    payment: {
        [key: string]: string[];
    };
    guarantee: {
        [key: string]: string[];
    };
    warranty: string[];
}