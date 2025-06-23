import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Space, 
  Button, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Statistic,
  Checkbox,
  Tooltip,
  message,
  Modal,
  Form,
  InputNumber
} from 'antd';
import { 
  SearchOutlined, 
  PrinterOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDataManager } from '../../utils/dataManager';
import type { FabricInventory } from '../../types/index';
import { useNavigate } from 'react-router-dom';
import { DataManager } from '../../utils/dataManager';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface GroupedInventory {
  key: string;
  productName: string;
  colorName: string;
  mill: string;
  inStockCount: number;
  totalCount: number;
  totalWeight: number;
  items: FabricInventory[];
}

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const { database, updateDatabase, logActivity, refreshDatabase } = useDataManager();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('inStockCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // 快速出库相关状态
  const [quickOutboundVisible, setQuickOutboundVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedInventory | null>(null);
  const [outboundForm] = Form.useForm();

  // 获取库存数据并分组
  const groupedData = useMemo(() => {
    if (!database?.inventory) return [];
    
    const fabricInventory = database.inventory.filter(item => item.type === 'fabric') as FabricInventory[];
    
    // 按品名+颜色+布厂分组
    const groups = fabricInventory.reduce((acc, item) => {
      const key = `${item.productName}|${item.colorName}|${item.mill}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          productName: item.productName,
          colorName: item.colorName,
          mill: item.mill,
          inStockCount: 0,
          totalCount: 0,
          totalWeight: 0,
          items: []
        };
      }
      
      acc[key].totalCount++;
      acc[key].items.push(item);
      
      if (item.status === '在库') {
        acc[key].inStockCount++;
        acc[key].totalWeight += item.weight;
      }
      
      return acc;
    }, {} as Record<string, GroupedInventory>);
    
    return Object.values(groups);
  }, [database?.inventory]);

  // 搜索和筛选
  const filteredData = useMemo(() => {
    let filtered = groupedData;
    
    // 搜索过滤
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(group => 
        group.productName.toLowerCase().includes(searchLower) ||
        group.colorName.toLowerCase().includes(searchLower) ||
        group.mill.toLowerCase().includes(searchLower) ||
        group.items.some(item => item.id.toLowerCase().includes(searchLower))
      );
    }
    
    // 状态筛选
    if (statusFilter !== 'all') {
      if (statusFilter === 'in-stock') {
        filtered = filtered.filter(group => group.inStockCount > 0);
      } else if (statusFilter === 'out-of-stock') {
        filtered = filtered.filter(group => group.inStockCount === 0);
      }
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'inStockCount':
          aValue = a.inStockCount;
          bValue = b.inStockCount;
          break;
        case 'totalWeight':
          aValue = a.totalWeight;
          bValue = b.totalWeight;
          break;
        case 'productName':
          aValue = a.productName;
          bValue = b.productName;
          break;
        default:
          aValue = a.inStockCount;
          bValue = b.inStockCount;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });
    
    return filtered;
  }, [groupedData, searchText, statusFilter, sortBy, sortOrder]);

  // 计算基础统计
  const statistics = useMemo(() => {
    const totalInStock = groupedData.reduce((sum, group) => sum + group.inStockCount, 0);
    const totalWeight = groupedData.reduce((sum, group) => sum + group.totalWeight, 0);
    const totalCategories = groupedData.length;
    
    return {
      totalInStock,
      totalWeight,
      totalCategories
    };
  }, [groupedData]);

  // 切换分组展开状态
  const toggleGroupExpansion = (key: string) => {
    setExpandedGroups(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // 快速出库功能
  const handleQuickOutbound = (group: GroupedInventory) => {
    setSelectedGroup(group);
    setQuickOutboundVisible(true);
  };

  const handleOutboundSubmit = async (values: any) => {
    if (!selectedGroup) return;
    
    const { customer, quantity } = values;
    const availableItems = selectedGroup.items.filter(item => item.status === '在库');
    
    if (quantity > availableItems.length) {
      message.error(`库存不足！当前在库数量：${availableItems.length} 疋`);
      return;
    }
    
    // 按入库时间排序，先进先出
    const itemsToDispatch = availableItems
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
      .slice(0, quantity);
    
    const today = new Date().toISOString().split('T')[0];
    
    // 更新库存状态
    updateDatabase((db) => {
      itemsToDispatch.forEach(item => {
        const inventoryItem = db.inventory.find(i => i.id === item.id);
        if (inventoryItem) {
          inventoryItem.status = '已出库';
          inventoryItem.dispatchDate = today;
          inventoryItem.customer = customer;
        }
      });
    });
    
    logActivity(`快速出库 ${quantity} 疋${selectedGroup.productName}`, `出库至 ${customer}`);
    message.success(`成功出库 ${quantity} 疋商品至 ${customer}！`);
    
    setQuickOutboundVisible(false);
    outboundForm.resetFields();
    setSelectedGroup(null);
  };

  // 补打标签功能
  const handlePrintLabels = (group: GroupedInventory) => {
    const inStockItems = group.items.filter(item => item.status === '在库');
    if (inStockItems.length === 0) {
      message.warning('该品类无在库商品，无法打印标签！');
      return;
    }
    
    // 跳转到二维码生成页面
    const itemIds = inStockItems.map(item => item.id);
    navigate(`/inventory/qr-generation?items=${itemIds.join(',')}`);
  };

  // 重置mock数据
  const handleResetMockData = () => {
    Modal.confirm({
      title: '重置Mock数据',
      content: '这将清除所有当前数据并重新生成Mock数据，确定继续吗？',
      onOk: () => {
        DataManager.resetDatabase();
        refreshDatabase();
        message.success('Mock数据重置成功！');
      }
    });
  };

  // 明细表格列定义
  const detailColumns: ColumnsType<FabricInventory> = [
    {
      title: '商品编号',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => <Text code style={{ fontSize: '12px' }}>{id}</Text>
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
      align: 'right',
      render: (weight: number) => `${weight.toFixed(1)} 斤`
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record) => (
        <Space>
          <Tag color={status === '在库' ? 'green' : 'default'}>
            {status}
          </Tag>
          {status === '在库' && (
            <Tooltip title={`库龄: ${Math.floor((Date.now() - new Date(record.entryDate).getTime()) / (1000 * 60 * 60 * 24))} 天`}>
              <ClockCircleOutlined style={{ color: '#666', fontSize: '12px' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: '入库日期',
      dataIndex: 'entryDate',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '出库信息',
      width: 120,
      render: (_, record) => (
        record.status === '已出库' ? (
          <div style={{ fontSize: '12px' }}>
            <div>{record.dispatchDate}</div>
            <Text type="secondary">{record.customer}</Text>
          </div>
        ) : '-'
      )
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        record.status === '在库' ? (
          <Space size="small">
            <Tooltip title="单独出库">
              <Button 
                type="link" 
                size="small" 
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  const group = groupedData.find(g => g.items.some(item => item.id === record.id));
                  if (group) {
                    setSelectedGroup({
                      ...group,
                      items: [record]
                    });
                    setQuickOutboundVisible(true);
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="打印标签">
              <Button 
                type="link" 
                size="small" 
                icon={<QrcodeOutlined />}
                onClick={() => navigate(`/inventory/qr-generation?items=${record.id}`)}
              />
            </Tooltip>
          </Space>
        ) : null
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div className="page-header">
        <h1>
          <BarChartOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          布料库存列表
        </h1>
        <p>查看和管理所有布料库存，支持按品名、颜色、布厂分组查看。</p>
      </div>

      {/* 基础统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="在库总数" 
              value={statistics.totalInStock}
              suffix="疋"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="在库总重量" 
              value={statistics.totalWeight.toFixed(1)}
              suffix="斤"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="品类总数" 
              value={statistics.totalCategories}
              suffix="个"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选工具栏 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索品名、颜色、布厂、商品编号..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
              style={{ maxWidth: '400px' }}
            />
          </Col>
          <Col>
            <Select
              placeholder="按状态筛选"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="in-stock">有库存</Option>
              <Option value="out-of-stock">无库存</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="排序方式"
              style={{ width: 150 }}
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <Option value="inStockCount-desc">库存数量 ↓</Option>
              <Option value="inStockCount-asc">库存数量 ↑</Option>
              <Option value="totalWeight-desc">总重量 ↓</Option>
              <Option value="totalWeight-asc">总重量 ↑</Option>
              <Option value="productName-asc">品名 A-Z</Option>
              <Option value="productName-desc">品名 Z-A</Option>
            </Select>
          </Col>
          <Col>
            <Button 
              type="dashed"
              onClick={handleResetMockData}
              style={{ borderColor: '#faad14', color: '#faad14' }}
            >
              重置Mock数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 分组库存列表 */}
      <Card title={`库存分组列表 (${filteredData.length} 个品类)`}>
        <div className="grouped-inventory-list">
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
              <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>暂无符合条件的库存数据</div>
            </div>
          ) : (
            filteredData.map((group) => (
              <div key={group.key} className="inventory-group" style={{ marginBottom: '16px' }}>
                {/* 分组汇总行 */}
                <div 
                  className="group-header"
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => toggleGroupExpansion(group.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ marginRight: '24px', minWidth: '200px' }}>
                      <Text strong>{group.productName}</Text>
                    </div>
                    <div style={{ marginRight: '24px', minWidth: '120px' }}>
                      <Tag color="blue">{group.colorName}</Tag>
                    </div>
                    <div style={{ marginRight: '24px', minWidth: '120px' }}>
                      <Text type="secondary">{group.mill}</Text>
                    </div>
                    <div style={{ marginRight: '24px', minWidth: '120px' }}>
                      <Text strong style={{ color: 'var(--primary-color)' }}>
                        {group.inStockCount} 疋
                      </Text>
                      {group.totalCount > group.inStockCount && (
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                          / {group.totalCount} 总
                        </Text>
                      )}
                    </div>
                    <div style={{ marginRight: '24px', minWidth: '120px' }}>
                      <Text strong>{group.totalWeight.toFixed(1)} 斤</Text>
                    </div>
                  </div>
                  
                  <div>
                    <Space>
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<PrinterOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintLabels(group);
                        }}
                        disabled={group.inStockCount === 0}
                      >
                        补打标签
                      </Button>
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<ShoppingCartOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickOutbound(group);
                        }}
                        disabled={group.inStockCount === 0}
                      >
                        快速出库
                      </Button>
                      <Button type="link" size="small">
                        {expandedGroups.includes(group.key) ? '收起明细' : '查看明细'}
                      </Button>
                    </Space>
                  </div>
                </div>

                {/* 明细展开区域 */}
                {expandedGroups.includes(group.key) && (
                  <div 
                    className="group-details"
                    style={{
                      border: '1px solid #d9d9d9',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      padding: '16px'
                    }}
                  >
                    <Table
                      dataSource={group.items.sort((a, b) => a.id.localeCompare(b.id))}
                      columns={detailColumns}
                      pagination={false}
                      size="small"
                      rowKey="id"
                      scroll={{ x: 700 }}
                      rowClassName={(record) => 
                        record.status === '已出库' ? 'out-of-stock-row' : ''
                      }
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 快速出库模态框 */}
      <Modal
        title="快速出库"
        open={quickOutboundVisible}
        onCancel={() => {
          setQuickOutboundVisible(false);
          outboundForm.resetFields();
          setSelectedGroup(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={outboundForm}
          layout="vertical"
          onFinish={handleOutboundSubmit}
        >
          {selectedGroup && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <Text strong>{selectedGroup.productName}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                {selectedGroup.colorName} - {selectedGroup.mill}
              </Text>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                可出库数量: {selectedGroup.inStockCount} 疋
              </div>
            </div>
          )}
          
          <Form.Item
            label="客户名称"
            name="customer"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          
          <Form.Item
            label="出库数量"
            name="quantity"
            rules={[
              { required: true, message: '请输入出库数量' },
              { type: 'number', min: 1, max: selectedGroup?.inStockCount || 0, message: `数量应在 1-${selectedGroup?.inStockCount || 0} 之间` }
            ]}
          >
            <InputNumber 
              placeholder="请输入出库数量" 
              style={{ width: '100%' }}
              min={1}
              max={selectedGroup?.inStockCount || 0}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setQuickOutboundVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认出库
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .out-of-stock-row {
          background-color: #fff2f0;
          opacity: 0.7;
        }
        .group-header:hover {
          background-color: #f0f0f0;
        }
        .inventory-group {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default InventoryList;