// src/components/Disclaimer.tsx
export default function Disclaimer() {
  return (
    <div className="text-sm text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="font-medium mb-2">免责声明：</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>本工具仅提供文档生成服务，不存储任何用户数据</li>
        <li>所有数据处理均在浏览器本地进行</li>
        <li>请勿输入敏感信息</li>
        <li>生成的文档将立即下载到您的设备，服务器不保留任何副本</li>
      </ul>
    </div>
  );
}