import React from 'react'
import { Card, Form, Input, Button, Select, InputNumber, DatePicker, Space, message } from 'antd'
import { ProCard } from '@ant-design/pro-components'

const { Option } = Select
const { TextArea } = Input

const FabricEntry: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('Form values:', values)
    message.success('布料信息录入成功！')
    form.resetFields()
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
    message.error('请填写所有必填字段！')
  }

  return (
    <div style={{ padding: 24 }}>
      <ProCard title="布料单录入" bordered>
        <Form
          form={form}
          name="fabricEntry"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Form.Item
              label="布料名称"
              name="fabricName"
              rules={[{ required: true, message: '请输入布料名称！' }]}
            >
              <Input placeholder="请输入布料名称" />
            </Form.Item>

            <Form.Item
              label="布料类型"
              name="fabricType"
              rules={[{ required: true, message: '请选择布料类型！' }]}
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
              rules={[{ required: true, message: '请输入颜色！' }]}
            >
              <Input placeholder="请输入颜色" />
            </Form.Item>

            <Form.Item
              label="供应商"
              name="supplier"
              rules={[{ required: true, message: '请输入供应商！' }]}
            >
              <Input placeholder="请输入供应商名称" />
            </Form.Item>

            <Form.Item
              label="数量（米）"
              name="quantity"
              rules={[{ required: true, message: '请输入数量！' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="请输入数量"
              />
            </Form.Item>

            <Form.Item
              label="单价"
              name="unitPrice"
              rules={[{ required: true, message: '请输入单价！' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入单价"
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              label="采购日期"
              name="purchaseDate"
              rules={[{ required: true, message: '请选择采购日期！' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择采购日期" />
            </Form.Item>

            <Form.Item
              label="批次号"
              name="batchNumber"
            >
              <Input placeholder="请输入批次号" />
            </Form.Item>
          </div>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="请输入布料描述（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交录入
              </Button>
              <Button htmlType="button" onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </ProCard>
    </div>
  )
}

export default FabricEntry 