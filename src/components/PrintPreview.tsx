import React, { useRef } from 'react';
import { Modal, Button, Space, Select, Row, Col, Divider } from 'antd';
import { PrinterOutlined, EyeOutlined } from '@ant-design/icons';
import PrintableLabel from './PrintableLabel';
import type { FabricInventory } from '../types/index';

interface PrintPreviewProps {
  visible: boolean;
  items: FabricInventory[];
  onClose: () => void;
  onPrintComplete: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ 
  visible, 
  items, 
  onClose, 
  onPrintComplete 
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [labelSize, setLabelSize] = React.useState<'small' | 'medium' | 'large'>('medium');
  const [printing, setPrinting] = React.useState(false);

  // 执行打印
  const handlePrint = () => {
    if (!printRef.current) return;

    setPrinting(true);
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setPrinting(false);
      return;
    }

    // 打印样式
    const printStyles = `
      <style>
        @media print {
          body { 
            margin: 0; 
            padding: 10mm;
            font-family: Arial, sans-serif;
          }
          .print-container {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
            justify-content: flex-start;
          }
          .printable-label {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            margin: 10mm;
            size: A4;
          }
        }
        @media screen {
          body { 
            padding: 20px;
            background: #f5f5f5;
          }
          .print-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            justify-content: flex-start;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
        }
      </style>
    `;

    // 打印内容
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>商品标签打印</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-container">
            ${printRef.current.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // 等待内容加载完成后打印
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setPrinting(false);
      onPrintComplete();
    }, 500);
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          打印预览
          <span style={{ fontSize: '14px', color: '#666' }}>
            ({items.length} 个标签)
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={
        <Space>
          <Select
            value={labelSize}
            onChange={setLabelSize}
            style={{ width: 120 }}
          >
            <Select.Option value="small">小标签 (60×40mm)</Select.Option>
            <Select.Option value="medium">中标签 (80×60mm)</Select.Option>
            <Select.Option value="large">大标签 (100×80mm)</Select.Option>
          </Select>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            icon={<PrinterOutlined />}
            loading={printing}
            onClick={handlePrint}
          >
            开始打印
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              标签数量: <strong>{items.length}</strong> 个
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              标签尺寸: <strong>{labelSize === 'small' ? '60×40mm' : labelSize === 'medium' ? '80×60mm' : '100×80mm'}</strong>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* 打印预览区域 */}
      <div 
        ref={printRef}
        style={{
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #d9d9d9',
          borderRadius: '6px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px',
          justifyContent: 'flex-start'
        }}>
          {items.map(item => (
            <PrintableLabel 
              key={item.id} 
              item={item} 
              size={labelSize}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
        💡 提示：点击"开始打印"将打开新窗口进行打印，请确保打印机已连接并正常工作。
      </div>
    </Modal>
  );
};

export default PrintPreview; 