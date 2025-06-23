import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { FabricInventory } from '../types/index';

interface PrintableLabelProps {
  item: FabricInventory;
  size?: 'small' | 'medium' | 'large';
}

const PrintableLabel: React.FC<PrintableLabelProps> = ({ item, size = 'medium' }) => {
  const sizeConfig = {
    small: { width: 60, height: 40, qrSize: 50, fontSize: 8 },
    medium: { width: 80, height: 60, qrSize: 70, fontSize: 10 },
    large: { width: 100, height: 80, qrSize: 90, fontSize: 12 }
  };

  const config = sizeConfig[size];

  return (
    <div 
      className="printable-label"
      style={{
        width: `${config.width}mm`,
        height: `${config.height}mm`,
        border: '1px solid #000',
        padding: '2mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        pageBreakInside: 'avoid',
        margin: '2mm',
        fontSize: `${config.fontSize}px`,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* 顶部：商品信息 */}
      <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '1mm' }}>
          {item.productName}
        </div>
        <div style={{ fontSize: '0.9em' }}>
          {item.colorName} | {item.mill}
        </div>
        <div style={{ fontSize: '0.8em' }}>
          缸号: {item.batchNumber}
        </div>
      </div>

      {/* 中间：二维码 */}
      <div style={{ textAlign: 'center', margin: '1mm 0' }}>
        <QRCodeSVG
          value={JSON.stringify({
            id: item.id,
            type: item.type,
            productName: item.productName,
            colorName: item.colorName,
            mill: item.mill,
            batchNumber: item.batchNumber,
            weight: item.weight,
            entryDate: item.entryDate
          })}
          size={config.qrSize}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* 底部：ID和重量 */}
      <div style={{ textAlign: 'center', fontSize: '0.8em', lineHeight: 1.1 }}>
        <div style={{ fontWeight: 'bold' }}>{item.id}</div>
        <div>{item.weight} 斤</div>
        <div>{item.entryDate}</div>
      </div>
    </div>
  );
};

export default PrintableLabel; 