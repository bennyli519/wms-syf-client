import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  message, 
  Row, 
  Col, 
  Space,
  Checkbox,
  Divider,
  Typography
} from 'antd';
import { 
  QrcodeOutlined, 
  PrinterOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDataManager } from '../../utils/dataManager';
import PrintPreview from '../../components/PrintPreview';
import type { FabricInventory } from '../../types/index';

const { Title, Text } = Typography;

interface QRCodeItem extends FabricInventory {
  selected: boolean;
  qrGenerated: boolean;
}

const QRCodeGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { database, updateDatabase, logActivity } = useDataManager();
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [printPreviewVisible, setPrintPreviewVisible] = useState(false);

  // 从URL参数获取需要生成二维码的商品ID
  useEffect(() => {
    const itemIds = searchParams.get('items')?.split(',') || [];
    if (itemIds.length > 0 && database) {
      const targetItems = database.inventory
        .filter(item => itemIds.includes(item.id))
        .map(item => ({
          ...item,
          selected: true,
          qrGenerated: false
        }));
      setItems(targetItems);
    }
  }, [searchParams, database]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setItems(items.map(item => ({ ...item, selected: checked })));
  };

  // 单项选择
  const handleItemSelect = (id: string, checked: boolean) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, selected: checked } : item
    );
    setItems(newItems);
    setSelectAll(newItems.every(item => item.selected));
  };

  // 生成二维码
  const generateQRCodes = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      message.warning('请至少选择一个商品');
      return;
    }

    setGenerating(true);
    try {
      // 模拟二维码生成过程
      for (let i = 0; i < selectedItems.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 模拟生成延迟
        setItems(prev => prev.map(item => 
          item.id === selectedItems[i].id 
            ? { ...item, qrGenerated: true }
            : item
        ));
      }
      
      logActivity(`生成 ${selectedItems.length} 个商品二维码`, '二维码生成');
      message.success(`成功生成 ${selectedItems.length} 个二维码！`);
    } catch (error) {
      message.error('二维码生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 打印标签
  const printLabels = () => {
    const generatedItems = items.filter(item => item.qrGenerated);
    if (generatedItems.length === 0) {
      message.warning('请先生成二维码');
      return;
    }

    // 打开打印预览
    setPrintPreviewVisible(true);
  };

  // 打印完成回调
  const handlePrintComplete = () => {
    const generatedItems = items.filter(item => item.qrGenerated);
    setPrintPreviewVisible(false);
    logActivity(`打印 ${generatedItems.length} 个商品标签`, '标签打印');
    message.success(`成功发送 ${generatedItems.length} 个标签到打印机！`);
  };

  // 返回入库页面
  const goBackToEntry = () => {
    navigate('/inventory/fabric-entry');
  };

  // 完成并返回列表
  const finishAndGoToList = () => {
    navigate('/inventory/list');
  };

  const columns = [
    {
      title: '选择',
      width: 60,
      render: (_: any, record: QRCodeItem) => (
        <Checkbox
          checked={record.selected}
          onChange={(e) => handleItemSelect(record.id, e.target.checked)}
        />
      )
    },
    {
      title: '商品编号',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>{id}</Text>
      )
    },
    {
      title: '布料品名',
      dataIndex: 'productName',
      width: 150
    },
    {
      title: '颜色',
      dataIndex: 'colorName',
      width: 100
    },
    {
      title: '布厂',
      dataIndex: 'mill',
      width: 100
    },
    {
      title: '缸号',
      dataIndex: 'batchNumber',
      width: 100
    },
    {
      title: '重量',
      dataIndex: 'weight',
      width: 80,
      render: (weight: number) => `${weight} 斤`
    },
    {
      title: '状态',
      width: 100,
      render: (_: any, record: QRCodeItem) => (
        <Space>
          {record.qrGenerated ? (
            <Text type="success">
              <CheckCircleOutlined /> 已生成
            </Text>
          ) : (
            <Text type="secondary">待生成</Text>
          )}
        </Space>
      )
    }
  ];

  const selectedCount = items.filter(item => item.selected).length;
  const generatedCount = items.filter(item => item.qrGenerated).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div className='page-header'>
        <h1>
          <QrcodeOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          商品二维码生成
        </h1>
        <p>为刚入库的商品生成唯一二维码，便于后续追踪和出库管理。</p>
      </div>

      <Row gutter={24}>
        {/* 左侧：商品列表 */}
        <Col xs={24} lg={20}>
          <Card 
            title={
              <Space>
                <span>待生成商品列表</span>
                <Text type="secondary">({items.length} 个商品)</Text>
              </Space>
            }
          >
            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={selectAll}
                indeterminate={selectedCount > 0 && selectedCount < items.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                全选 ({selectedCount}/{items.length})
              </Checkbox>
            </div>

            <Table
              dataSource={items}
              columns={columns}
              pagination={false}
              rowKey="id"
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧：操作面板 */}
        <Col xs={24} lg={4}>
          <Card title="操作进度">
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
                  {generatedCount}/{items.length}
                </Title>
                <Text type="secondary">已生成二维码</Text>
              </div>

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  icon={<QrcodeOutlined />}
                  loading={generating}
                  disabled={selectedCount === 0}
                  onClick={generateQRCodes}
                >
                  {generatedCount > 0 ? '重新生成选中项' : `生成二维码 (${selectedCount})`}
                </Button>
                
                <Button 
                  size="large" 
                  block
                  icon={<PrinterOutlined />}
                  disabled={generatedCount === 0}
                  onClick={printLabels}
                >
                  打印预览 ({generatedCount})
                </Button>

                <Divider style={{ margin: '8px 0' }} />

                <Button 
                  size="large" 
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={goBackToEntry}
                >
                  继续入库
                </Button>

                <Button 
                  size="large" 
                  block
                  icon={<FileAddOutlined />}
                  onClick={finishAndGoToList}
                >
                  完成操作
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 打印预览组件 */}
      <PrintPreview
        visible={printPreviewVisible}
        items={items.filter(item => item.qrGenerated)}
        onClose={() => setPrintPreviewVisible(false)}
        onPrintComplete={handlePrintComplete}
      />
    </div>
  );
};

export default QRCodeGeneration; 