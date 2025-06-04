import React, { useState } from 'react'
import { Table, Button, Space, Input, Select, Tag, Card, Statistic, Row, Col, Tooltip } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { 
  SearchOutlined, 
  FilterOutlined, 
  ExportOutlined, 
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input

interface InventoryItem {
  key: string
  id: string
  fabricName: string
  fabricType: string
  color: string
  supplier: string
  quantity: number
  unitPrice: number
  totalValue: number
  purchaseDate: string
  batchNumber: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

// Mock data for demonstration
const mockInventoryData: InventoryItem[] = [
  {
    key: '1',
    id: 'FAB001',
    fabricName: '优质棉布',
    fabricType: '棉布',
    color: '白色',
    supplier: '布料供应商有限公司',
    quantity: 150,
    unitPrice: 12.50,
    totalValue: 1875.00,
    purchaseDate: '2024-01-15',
    batchNumber: 'BCH001',
    status: 'in-stock'
  },
  {
    key: '2',
    id: 'FAB002',
    fabricName: '丝绸混纺',
    fabricType: '丝绸',
    color: '蓝色',
    supplier: '优质纺织品有限公司',
    quantity: 25,
    unitPrice: 45.00,
    totalValue: 1125.00,
    purchaseDate: '2024-01-20',
    batchNumber: 'BCH002',
    status: 'low-stock'
  },
  {
    key: '3',
    id: 'FAB003',
    fabricName: '基础涤纶',
    fabricType: '涤纶',
    color: '黑色',
    supplier: '全球面料集团',
    quantity: 0,
    unitPrice: 8.75,
    totalValue: 0,
    purchaseDate: '2024-01-10',
    batchNumber: 'BCH003',
    status: 'out-of-stock'
  },
  {
    key: '4',
    id: 'FAB004',
    fabricName: '优质羊毛',
    fabricType: '羊毛',
    color: '灰色',
    supplier: '布料供应商有限公司',
    quantity: 80,
    unitPrice: 32.00,
    totalValue: 2560.00,
    purchaseDate: '2024-01-25',
    batchNumber: 'BCH004',
    status: 'in-stock'
  },
  {
    key: '5',
    id: 'FAB005',
    fabricName: '天然亚麻',
    fabricType: '亚麻',
    color: '米色',
    supplier: '优质纺织品有限公司',
    quantity: 45,
    unitPrice: 18.00,
    totalValue: 810.00,
    purchaseDate: '2024-01-30',
    batchNumber: 'BCH005',
    status: 'in-stock'
  }
]

const InventoryList: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>(mockInventoryData)
  const [filteredData, setFilteredData] = useState<InventoryItem[]>(mockInventoryData)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'green'
      case 'low-stock': return 'orange'
      case 'out-of-stock': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-stock': return '有库存'
      case 'low-stock': return '库存不足'
      case 'out-of-stock': return '缺货'
      default: return status
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    filterData(value, statusFilter, typeFilter)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    filterData(searchText, value, typeFilter)
  }

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value)
    filterData(searchText, statusFilter, value)
  }

  const filterData = (search: string, status: string, type: string) => {
    let filtered = data

    if (search) {
      filtered = filtered.filter(item =>
        item.fabricName.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase()) ||
        item.color.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status)
    }

    if (type !== 'all') {
      filtered = filtered.filter(item => item.fabricType === type)
    }

    setFilteredData(filtered)
  }

  const calculateStats = () => {
    const totalItems = data.length
    const inStock = data.filter(item => item.status === 'in-stock').length
    const lowStock = data.filter(item => item.status === 'low-stock').length
    const outOfStock = data.filter(item => item.status === 'out-of-stock').length
    const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0)

    return { totalItems, inStock, lowStock, outOfStock, totalValue }
  }

  const stats = calculateStats()

  const columns: ColumnsType<InventoryItem> = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '布料名称',
      dataIndex: 'fabricName',
      key: 'fabricName',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'fabricType',
      key: 'fabricType',
      width: 100,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color: string) => (
        <Tag color="blue">{color}</Tag>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      align: 'right',
      render: (quantity: number) => `${quantity} 米`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '采购日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
    },
    {
      title: '批次',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="总项目数" 
                value={stats.totalItems}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="有库存" 
                value={stats.inStock}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="库存不足" 
                value={stats.lowStock}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="总价值" 
                value={stats.totalValue}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <ProCard title="库存列表" bordered>
          <Space style={{ marginBottom: 16 }}>
            <Search
              placeholder="搜索布料、编号、供应商..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
            <Select
              placeholder="按状态筛选"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="in-stock">有库存</Option>
              <Option value="low-stock">库存不足</Option>
              <Option value="out-of-stock">缺货</Option>
            </Select>
            <Select
              placeholder="按类型筛选"
              style={{ width: 150 }}
              value={typeFilter}
              onChange={handleTypeFilter}
            >
              <Option value="all">全部类型</Option>
              <Option value="棉布">棉布</Option>
              <Option value="涤纶">涤纶</Option>
              <Option value="丝绸">丝绸</Option>
              <Option value="羊毛">羊毛</Option>
              <Option value="亚麻">亚麻</Option>
            </Select>
            <Button icon={<ExportOutlined />} type="default">
              导出
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 1200 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
            }}
            rowClassName={(record) => {
              if (record.status === 'out-of-stock') return 'out-of-stock-row'
              if (record.status === 'low-stock') return 'low-stock-row'
              return ''
            }}
          />
        </ProCard>
      </Space>

      <style>{`
        .out-of-stock-row {
          background-color: #fff2f0;
        }
        .low-stock-row {
          background-color: #fffbe6;
        }
      `}</style>
    </div>
  )
}

export default InventoryList