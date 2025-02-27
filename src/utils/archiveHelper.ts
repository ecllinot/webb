// src/utils/archiveHelper.ts
import JSZip from 'jszip';

interface FileContent {
  content: Buffer;
  filename: string;
}

export async function createArchive(files: FileContent[]): Promise<Buffer> {
  const zip = new JSZip();

  // 添加文件到 ZIP
  files.forEach(file => {
    zip.file(file.filename, file.content);
  });

  // 生成 ZIP 文件
  return await zip.generateAsync({ type: 'nodebuffer' });
}
