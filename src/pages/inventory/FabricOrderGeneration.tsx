import React, { useState } from 'react'
import { Card, Form, Input, Button, Select, InputNumber, DatePicker, Space, message, Table, Tag } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

interface OrderItem {
  key: string
  fabricType: string
  color: string
  quantity: number
  urgency: string
}

const FabricOrderGeneration: React.FC = () => {
  const [form] = Form.useForm()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [itemForm] = Form.useForm()

  const urgencyColors = {
    'low': 'green',
    'medium': 'orange',
    'high': 'red'
  }

  const addOrderItem = () => {
    itemForm.validateFields().then((values) => {
      const newItem: OrderItem = {
        key: Date.now().toString(),
        fabricType: values.fabricType,
        color: values.color,
        quantity: values.quantity,
        urgency: values.urgency,
      }
      setOrderItems([...orderItems, newItem])
      itemForm.resetFields()
      message.success('项目已添加到订单！')
    }).catch(() => {
      message.error('请填写所有项目字段！')
    })
  }

  const removeOrderItem = (key: string) => {
    setOrderItems(orderItems.filter(item => item.key !== key))
    message.success('项目已从订单中移除！')
  }

  const generateOrder = (values: any) => {
    if (orderItems.length === 0) {
      message.error('请至少添加一个项目到订单！')
      return
    }

    const orderData = {
      ...values,
      items: orderItems,
      orderDate: new Date().toISOString(),
      totalItems: orderItems.length,
      totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0)
    }

    console.log('Generated Order:', orderData)
    message.success('布料订单生成成功！')
    form.resetFields()
    setOrderItems([])
  }

  const columns = [
    {
      title: '布料类型',
      dataIndex: 'fabricType',
      key: 'fabricType',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: '数量（米）',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: keyof typeof urgencyColors) => {
        const urgencyText = {
          'low': '低',
          'medium': '中',
          'high': '高'
        }
        return (
          <Tag color={urgencyColors[urgency]}>{urgencyText[urgency]}</Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: OrderItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeOrderItem(record.key)}
        >
          移除
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Order Information */}
        <ProCard title="订单信息" bordered>
          <Form
            form={form}
            name="orderInfo"
            layout="vertical"
            onFinish={generateOrder}
            autoComplete="off"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <Form.Item
                label="订单名称"
                name="orderName"
                rules={[{ required: true, message: '请输入订单名称！' }]}
              >
                <Input placeholder="请输入订单名称" />
              </Form.Item>

              <Form.Item
                label="供应商"
                name="supplier"
                rules={[{ required: true, message: '请选择供应商！' }]}
              >
                <Select placeholder="请选择供应商">
                  <Option value="supplier1">布料供应商有限公司</Option>
                  <Option value="supplier2">优质纺织品有限公司</Option>
                  <Option value="supplier3">全球面料集团</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="预期交货日期"
                name="expectedDeliveryDate"
                rules={[{ required: true, message: '请选择预期交货日期！' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择预期交货日期" />
              </Form.Item>

              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级！' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="订单备注"
              name="orderNotes"
            >
              <TextArea
                rows={3}
                placeholder="请输入此订单的特殊说明或备注"
              />
            </Form.Item>
          </Form>
        </ProCard>

        {/* Add Items */}
        <ProCard title="添加订单项目" bordered>
          <Form
            form={itemForm}
            name="addItem"
            layout="vertical"
            autoComplete="off"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'end' }}>
              <Form.Item
                label="布料类型"
                name="fabricType"
                rules={[{ required: true, message: '必填！' }]}
              >
                <Select placeholder="请选择布料类型">
                  <Option value="cotton">棉布</Option>
                  <Option value="polyester">涤纶</Option>
                  <Option value="silk">丝绸</Option>
                  <Option value="wool">羊毛</Option>
                  <Option value="linen">亚麻</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="颜色"
                name="color"
                rules={[{ required: true, message: '必填！' }]}
              >
                <Input placeholder="请输入颜色" />
              </Form.Item>

              <Form.Item
                label="数量（米）"
                name="quantity"
                rules={[{ required: true, message: '必填！' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="数量"
                />
              </Form.Item>

              <Form.Item
                label="紧急程度"
                name="urgency"
                rules={[{ required: true, message: '必填！' }]}
              >
                <Select placeholder="紧急程度">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="dashed" onClick={addOrderItem} icon={<PlusOutlined />}>
                添加项目到订单
              </Button>
            </Form.Item>
          </Form>
        </ProCard>

        {/* Order Items Table */}
        <ProCard title="订单项目" bordered>
          <Table
            columns={columns}
            dataSource={orderItems}
            pagination={false}
            locale={{ emptyText: '暂无添加到订单的项目' }}
          />
          
          {orderItems.length > 0 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <span>总项目数: <strong>{orderItems.length}</strong></span>
                <span>总数量: <strong>{orderItems.reduce((sum, item) => sum + item.quantity, 0)} 米</strong></span>
              </Space>
            </div>
          )}
        </ProCard>

        {/* Generate Order Button */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            onClick={() => form.submit()}
            disabled={orderItems.length === 0}
          >
            生成布料订单
          </Button>
        </div>
      </Space>
    </div>
  )
}

export default FabricOrderGeneration 