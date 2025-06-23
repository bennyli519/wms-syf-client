import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Modal, Row, Col, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useDataManager } from '../../utils/dataManager';
import { FabricProduct, FabricColor } from '../../types/index';

const Settings: React.FC = () => {
  const { database, updateDatabase, logActivity } = useDataManager();
  const [form] = Form.useForm();
  const [colorForm] = Form.useForm();
  const [millForm] = Form.useForm();

  // 刷新组件状态
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 添加布料品名
  const handleAddProduct = async (values: { name: string }) => {
    if (!values.name?.trim()) {
      message.error('请输入品名');
      return;
    }

    const name = values.name.trim();
    
    // 检查重复
    const exists = database?.fabricProductMaster.some(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (exists) {
      message.error('该品名已存在');
      return;
    }

    updateDatabase((db) => {
      const newId = Math.max(...db.fabricProductMaster.map(p => p.id), 0) + 1;
      db.fabricProductMaster.push({ id: newId, name });
    });

    logActivity(`新增布料品名: ${name}`, '资料设定');
    message.success('添加成功');
    form.resetFields();
    refresh();
  };

  // 删除布料品名
  const handleDeleteProduct = (product: FabricProduct) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除品名"${product.name}"吗？此操作无法撤销。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        updateDatabase((db) => {
          db.fabricProductMaster = db.fabricProductMaster.filter(p => p.id !== product.id);
        });
        logActivity(`删除布料品名: ${product.name}`, '资料设定');
        message.success('删除成功');
        refresh();
      }
    });
  };

  // 添加布料颜色
  const handleAddColor = async (values: { name: string; code: string }) => {
    if (!values.name?.trim() || !values.code?.trim()) {
      message.error('请填写完整的颜色信息');
      return;
    }

    const name = values.name.trim();
    const code = values.code.trim();
    
    // 检查重复
    const nameExists = database?.fabricColors.some(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );
    const codeExists = database?.fabricColors.some(c => 
      c.code.toLowerCase() === code.toLowerCase()
    );
    
    if (nameExists) {
      message.error('该颜色名称已存在');
      return;
    }
    
    if (codeExists) {
      message.error('该颜色代码已存在');
      return;
    }

    updateDatabase((db) => {
      const newId = Math.max(...db.fabricColors.map(c => c.id), 0) + 1;
      db.fabricColors.push({ id: newId, name, code });
    });

    logActivity(`新增布料颜色: ${name} (${code})`, '资料设定');
    message.success('添加成功');
    colorForm.resetFields();
    refresh();
  };

  // 删除布料颜色
  const handleDeleteColor = (color: FabricColor) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除颜色"${color.name} (${color.code})"吗？此操作无法撤销。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        updateDatabase((db) => {
          db.fabricColors = db.fabricColors.filter(c => c.id !== color.id);
        });
        logActivity(`删除布料颜色: ${color.name} (${color.code})`, '资料设定');
        message.success('删除成功');
        refresh();
      }
    });
  };

  // 添加布厂
  const handleAddMill = async (values: { name: string }) => {
    if (!values.name?.trim()) {
      message.error('请输入布厂名称');
      return;
    }

    const name = values.name.trim();
    
    // 检查重复
    const exists = database?.fabricMills.some(mill => 
      mill.toLowerCase() === name.toLowerCase()
    );
    
    if (exists) {
      message.error('该布厂已存在');
      return;
    }

    updateDatabase((db) => {
      db.fabricMills.push(name);
    });

    logActivity(`新增布厂: ${name}`, '资料设定');
    message.success('添加成功');
    millForm.resetFields();
    refresh();
  };

  // 删除布厂
  const handleDeleteMill = (millName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除布厂"${millName}"吗？此操作无法撤销。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        updateDatabase((db) => {
          db.fabricMills = db.fabricMills.filter(mill => mill !== millName);
        });
        logActivity(`删除布厂: ${millName}`, '资料设定');
        message.success('删除成功');
        refresh();
      }
    });
  };

  if (!database) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div className="page-header">
        <h1>
          <SettingOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          资料设定
        </h1>
        <p>在此管理您系统中的基础资料，如产品名称、颜色等。修改后将在"批量入库"等页面生效。</p>
      </div>

      <Row gutter={[16, 16]}>
        {/* 布料品名管理 */}
        <Col xs={24} lg={12}>
          <div className="master-data-card">
            <h3>布料品名</h3>
            <div className="master-data-list">
              {database.fabricProductMaster.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '32px' }}>
                  暂无数据
                </div>
              ) : (
                database.fabricProductMaster.map((product) => (
                  <div key={product.id} className="master-data-item">
                    <div className="content">{product.name}</div>
                    <div className="actions">
                      <DeleteOutlined 
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <Form form={form} onFinish={handleAddProduct} className="add-form">
              <Form.Item name="name" rules={[{ required: true, message: '请输入品名' }]}>
                <Input placeholder="新增布料品名" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                添加
              </Button>
            </Form>
          </div>
        </Col>

        {/* 布料颜色管理 */}
        <Col xs={24} lg={12}>
          <div className="master-data-card">
            <h3>布料颜色</h3>
            <div className="master-data-list">
              {database.fabricColors.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '32px' }}>
                  暂无数据
                </div>
              ) : (
                database.fabricColors.map((color) => (
                  <div key={color.id} className="master-data-item">
                    <div className="content">
                      <div style={{ fontWeight: 'bold' }}>{color.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {color.code}
                      </div>
                    </div>
                    <div className="actions">
                      <DeleteOutlined 
                        className="delete-btn"
                        onClick={() => handleDeleteColor(color)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <Form form={colorForm} onFinish={handleAddColor}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="name" rules={[{ required: true, message: '请输入颜色名称' }]}>
                    <Input placeholder="颜色名称" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="code" rules={[{ required: true, message: '请输入颜色代码' }]}>
                    <Input placeholder="颜色代码" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                    添加
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>

        {/* 布厂管理 */}
        <Col xs={24} lg={12}>
          <div className="master-data-card">
            <h3>布厂</h3>
            <div className="master-data-list">
              {database.fabricMills.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '32px' }}>
                  暂无数据
                </div>
              ) : (
                database.fabricMills.map((mill, index) => (
                  <div key={index} className="master-data-item">
                    <div className="content">{mill}</div>
                    <div className="actions">
                      <DeleteOutlined 
                        className="delete-btn"
                        onClick={() => handleDeleteMill(mill)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <Form form={millForm} onFinish={handleAddMill} className="add-form">
              <Form.Item name="name" rules={[{ required: true, message: '请输入布厂名称' }]}>
                <Input placeholder="新增布厂" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                添加
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Settings; 