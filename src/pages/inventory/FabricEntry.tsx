import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Select, 
  Input, 
  Modal, 
  message, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Space,
  Popconfirm,
  Alert,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  FileAddOutlined,
  InfoCircleOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDataManager } from '../../utils/dataManager';
import type { FabricInventory } from '../../types/index';

interface TableRowData {
  key: string;
  productName: string;
  colorName: string;
  mill: string;
  batchNumber: string; // 缸号
  weights: number[]; // 每疋的重量数组
  isValid: boolean;
}

interface WeightModalProps {
  visible: boolean;
  weights: number[];
  onSave: (weights: number[]) => void;
  onCancel: () => void;
}

const WeightModal: React.FC<WeightModalProps> = ({ visible, weights, onSave, onCancel }) => {
  const [localWeights, setLocalWeights] = useState<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    setLocalWeights(weights.length > 0 ? [...weights] : [0]);
    setFocusedIndex(0);
  }, [weights, visible]);

  // 处理焦点变化
  useEffect(() => {
    const inputs = document.querySelectorAll('.weight-input');
    const targetInput = inputs[focusedIndex] as HTMLInputElement;
    if (targetInput) {
      targetInput.focus();
      // 选中所有文本，方便快速替换
      targetInput.select();
    }
  }, [focusedIndex]);

  const addWeight = () => {
    const newWeights = [...localWeights, 0];
    setLocalWeights(newWeights);
    // 自动聚焦到新添加的行
    setTimeout(() => {
      setFocusedIndex(newWeights.length - 1);
      // 确保新输入框获得焦点
      const inputs = document.querySelectorAll('.weight-input');
      const newInput = inputs[newWeights.length - 1] as HTMLInputElement;
      if (newInput) {
        newInput.focus();
      }
    }, 50);
  };

  const updateWeight = (index: number, value: number) => {
    const newWeights = [...localWeights];
    newWeights[index] = value || 0;
    setLocalWeights(newWeights);
  };

  const removeWeight = (index: number) => {
    if (localWeights.length > 1) {
      setLocalWeights(localWeights.filter((_, i) => i !== index));
      // 调整焦点位置
      if (focusedIndex >= localWeights.length - 1) {
        setFocusedIndex(Math.max(0, localWeights.length - 2));
      }
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index === localWeights.length - 1) {
          // 如果是最后一行，添加新行
          addWeight();
        } else {
          // 否则移动到下一行
          setFocusedIndex(index + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        // Enter键添加新行
        addWeight();
        break;
      case 'Delete':
      case 'Backspace':
        // 如果输入框为空且不是第一行，删除当前行
        const target = e.currentTarget as HTMLInputElement;
        if (target.value === '' && localWeights.length > 1) {
          e.preventDefault();
          removeWeight(index);
        }
        break;
    }
  };

  // 处理输入值变化，确保只能输入数字
  const handleInputChange = (index: number, value: string) => {
    // 允许输入数字和小数点
    const numericValue = value.replace(/[^0-9.]/g, '');
    // 防止多个小数点
    const parts = numericValue.split('.');
    const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    // 更新数据（数字）
    const numberValue = parseFloat(cleanValue) || 0;
    updateWeight(index, numberValue);
  };

  const handleSave = () => {
    const validWeights = localWeights.filter(w => w > 0);
    if (validWeights.length === 0) {
      message.error('至少需要一个有效重量');
      return;
    }
    onSave(validWeights);
  };

  return (
    <Modal
      title='录入重量明细'
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={600}
    >
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '8px', border: '1px solid #d9d9d9', textAlign: 'center' }}>序号</th>
              <th style={{ padding: '8px', border: '1px solid #d9d9d9', textAlign: 'center' }}>重量(斤)</th>
              <th style={{ padding: '8px', border: '1px solid #d9d9d9', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {localWeights.map((weight, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9', textAlign: 'center' }}>
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                  <Input
                    className='weight-input'
                    key={`weight-${index}`}
                    value={weight > 0 ? weight.toString() : ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    style={{ width: '100%', textAlign: 'center' }}
                    placeholder='请输入重量'
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #d9d9d9', textAlign: 'center' }}>
                  <Button 
                    type='link' 
                    danger 
                    onClick={() => removeWeight(index)}
                    disabled={localWeights.length <= 1}
                    icon={<DeleteOutlined />}
                    size='small'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <Button type='dashed' onClick={addWeight} icon={<PlusOutlined />}>
            添加一行
          </Button>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f6f8fa', 
          borderRadius: '6px', 
          fontSize: '12px', 
          color: '#666',
          border: '1px solid #e1e4e8'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⌨️ 键盘快捷操作：</div>
          <div>• <kbd>↓</kbd> 下一行 (最后一行时自动添加新行)</div>
          <div>• <kbd>↑</kbd> 上一行</div>
          <div>• <kbd>Enter</kbd> 添加新行</div>
          <div>• <kbd>Backspace</kbd> 空值时删除当前行</div>
        </div>
      </div>
    </Modal>
  );
};

const FabricEntry: React.FC = () => {
  const navigate = useNavigate();
  const { database, updateDatabase, logActivity } = useDataManager();
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [currentRowKey, setCurrentRowKey] = useState<string>('');

  // 添加新行
  const addNewRow = () => {
    const newKey = Date.now().toString();
    const newRow: TableRowData = {
      key: newKey,
      productName: '',
      colorName: '',
      mill: '',
      batchNumber: '',
      weights: [],
      isValid: false
    };
    setTableData([...tableData, newRow]);
  };

  // 删除行
  const deleteRow = (key: string) => {
    setTableData(tableData.filter(row => row.key !== key));
  };

  // 更新行数据
  const updateRowData = (key: string, field: keyof TableRowData, value: any) => {
    setTableData(prevData => 
      prevData.map(row => {
        if (row.key === key) {
          const updatedRow = { ...row, [field]: value };
          // 验证行数据完整性
          updatedRow.isValid = !!(
            updatedRow.productName && 
            updatedRow.colorName && 
            updatedRow.mill && 
            updatedRow.batchNumber &&
            updatedRow.weights.length > 0
          );
          return updatedRow;
        }
        return row;
      })
    );
  };

  // 打开重量编辑模态框
  const openWeightModal = (key: string) => {
    const row = tableData.find(r => r.key === key);
    if (row) {
      setCurrentRowKey(key);
      setWeightModalVisible(true);
    }
  };

  // 保存重量数据
  const saveWeights = (weights: number[]) => {
    updateRowData(currentRowKey, 'weights', weights);
    setWeightModalVisible(false);
    setCurrentRowKey('');
  };



  // 计算汇总数据
  const getSummaryData = () => {
    const validRows = tableData.filter(row => row.isValid);
    const totalPieces = validRows.reduce((sum, row) => sum + row.weights.length, 0);
    const totalWeight = validRows.reduce((sum, row) => 
      sum + row.weights.reduce((rowSum, weight) => rowSum + weight, 0), 0
    );
    const categoryCount = validRows.length;
    
    return { totalPieces, totalWeight, categoryCount, validRows };
  };

  // 提交入库
  const handleSubmit = () => {
    const { validRows, totalPieces } = getSummaryData();
    
    if (validRows.length === 0) {
      message.error('请至少添加一条有效的入库记录');
      return;
    }

    Modal.confirm({
      title: '确认入库',
      content: `确定要录入 ${totalPieces} 疋布料吗？入库成功后将跳转到二维码生成页面。`,
      onOk: () => {
        // 生成库存记录
        const today = new Date().toISOString().split('T')[0];
        const newInventoryItems: FabricInventory[] = [];
        const newItemIds: string[] = [];
        let idCounter = (database?.inventory.length || 0) + 1;

        validRows.forEach(row => {
          row.weights.forEach(weight => {
            const uniqueId = `F${today.replace(/-/g, '').slice(2)}-${String(idCounter).padStart(4, '0')}`;
            newInventoryItems.push({
              id: uniqueId,
              type: 'fabric',
              productName: row.productName,
              colorName: row.colorName,
              mill: row.mill,
              batchNumber: row.batchNumber,
              weight: weight, // 直接使用输入的斤数
              entryDate: today,
              status: '在库'
            });
            newItemIds.push(uniqueId);
            idCounter++;
          });
        });

        // 保存到数据库
        updateDatabase((db) => {
          db.inventory.push(...newInventoryItems);
        });

        logActivity(`批量入库 ${totalPieces} 疋布料`, '入库操作');
        message.success(`成功录入 ${totalPieces} 疋布料！正在跳转到二维码生成页面...`);
        
        // 清空表格
        setTableData([]);
        
        // 跳转到二维码生成页面，传递新入库的商品ID
        setTimeout(() => {
          navigate(`/inventory/qr-generation?items=${newItemIds.join(',')}`);
        }, 1000);
      }
    });
  };

  const { totalPieces, totalWeight, categoryCount } = getSummaryData();

  const columns = [
    {
      title: '布料品名',
      dataIndex: 'productName',
      width: 200,
      render: (value: string, record: TableRowData) => (
        <Input
          value={value || ''}
          placeholder='输入布料品名'
          style={{ width: '100%' }}
          onChange={(e) => updateRowData(record.key, 'productName', e.target.value)}
        />
      )
    },
    {
      title: '颜色',
      dataIndex: 'colorName',
      width: 150,
      render: (value: string, record: TableRowData) => (
        <Select
          value={value || undefined}
          placeholder='选择颜色'
          style={{ width: '100%' }}
          onChange={(val) => updateRowData(record.key, 'colorName', val)}
          showSearch
        >
          {database?.fabricColors.map(color => (
            <Select.Option key={color.id} value={color.name}>
              {color.name} ({color.code})
            </Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: '布厂',
      dataIndex: 'mill',
      width: 120,
      render: (value: string, record: TableRowData) => (
        <Select
          value={value || undefined}
          placeholder='选择布厂'
          style={{ width: '100%' }}
          onChange={(val) => updateRowData(record.key, 'mill', val)}
          showSearch
        >
          {database?.fabricMills.map(mill => (
            <Select.Option key={mill} value={mill}>
              {mill}
            </Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: '缸号',
      dataIndex: 'batchNumber',
      width: 120,
      render: (value: string, record: TableRowData) => (
        <Input
          value={value || ''}
          placeholder='输入缸号'
          style={{ width: '100%' }}
          onChange={(e) => updateRowData(record.key, 'batchNumber', e.target.value)}
        />
      )
    },
    {
      title: '斤数录入',
      dataIndex: 'weights',
      width: 150,
      render: (weights: number[], record: TableRowData) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {weights.length > 0 ? `${weights.length} 疋 / ${weights.reduce((a, b) => a + b, 0).toFixed(1)} 斤` : '未录入'}
          </div>
          <Button 
            type='primary'
            size='small'
            icon={<EditOutlined />} 
            onClick={() => openWeightModal(record.key)}
            style={{ fontSize: '12px' }}
          >
            录入斤数
          </Button>
        </div>
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: TableRowData) => (
        <Popconfirm
          title='确定删除这行吗？'
          onConfirm={() => deleteRow(record.key)}
        >
          <Button type='link' danger icon={<DeleteOutlined />} size='small' />
        </Popconfirm>
      )
    }
  ];

  const currentRowData = tableData.find(row => row.key === currentRowKey);

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div className='page-header'>
        <h1>
          <FileAddOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          布料批量入库
        </h1>
        <p>一次性录入整张布料货单，支持多品类、多重量的快速批量录入。</p>
      </div>

      <Row gutter={24}>
        {/* 左侧：入库明细表格 */}
        <Col xs={24} lg={18}>
          <Card title='入库明细' style={{ marginBottom: '16px' }}>
            <Alert
              message='操作提示'
              description='1. 直接输入布料品名，选择颜色和布厂  2. 填写缸号便于追溯  3. 点击【录入斤数】按钮录入每疋重量  4. 所有信息填写完整后才能入库'
              type='info'
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: '16px' }}
              showIcon
            />
            
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={false}
              scroll={{ x: 800 }}
              rowClassName={(record) => !record.isValid && record.productName ? 'table-row-error' : ''}
              locale={{ emptyText: '暂无数据，点击下方按钮添加' }}
            />
            
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button 
                type='dashed' 
                icon={<PlusOutlined />} 
                onClick={addNewRow}
                size='large'
              >
                添加品类行
              </Button>
            </div>
          </Card>
        </Col>

        {/* 右侧：汇总信息 */}
        <Col xs={24} lg={6}>
          <Card title='入库汇总' style={{ marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <Statistic title='总疋数' value={totalPieces} suffix='疋' style={{ marginBottom: '16px' }} />
              <Statistic title='总重量' value={totalWeight.toFixed(1)} suffix='斤' style={{ marginBottom: '16px' }} />
              <Statistic title='品类数' value={categoryCount} suffix='个' style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '14px', color: '#666' }}>
                入库日期: {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                <Button 
                  type='primary' 
                  size='large' 
                  block
                  disabled={categoryCount === 0}
                  onClick={handleSubmit}
                  icon={<QrcodeOutlined />}
                >
                  确认入库并生成二维码
                </Button>
                <Button 
                  size='large' 
                  block
                  onClick={() => setTableData([])}
                  disabled={tableData.length === 0}
                >
                  清空重来
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 重量录入模态框 */}
      <WeightModal
        visible={weightModalVisible}
        weights={currentRowData?.weights || []}
        onSave={saveWeights}
        onCancel={() => {
          setWeightModalVisible(false);
          setCurrentRowKey('');
        }}
      />
    </div>
  );
};

export default FabricEntry; 