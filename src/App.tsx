import React from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-layout'
import { 
  DashboardOutlined,
  FileAddOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import FabricEntry from './pages/inventory/FabricEntry'
import FabricOrderGeneration from './pages/inventory/FabricOrderGeneration'
import InventoryList from './pages/inventory/InventoryList'
import Settings from './pages/inventory/Settings'

const App: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 获取当前页面标题
  const getPageTitle = (pathname: string) => {
    const routeMap: Record<string, string> = {
      '/': '智能库存管理系统',
      '/global-dashboard': '总览仪表盘',
      '/fabric/dashboard': '布料仪表盘',
      '/fabric/entry': '布料批量入库',
      '/fabric/outbound': '布料出库开单',
      '/fabric/list': '布料库存列表',
      '/settings': '资料设定',
    }
    return routeMap[pathname] || '智能库存管理系统'
  }

  return (
    <ProLayout
      title="智能库存系统"
      logo={false}
      location={{
        pathname: location.pathname,
      }}
      menu={{
        type: 'sub',
        defaultOpenAll: true,
      }}
      theme="dark"
      menuDataRender={() => [
        {
          path: '/global-dashboard',
          name: '总览仪表盘',
          icon: <GlobalOutlined />,
        },
        {
          path: '/fabric',
          name: '布料管理',
          icon: <FileAddOutlined />,
          children: [
            {
              path: '/fabric/dashboard',
              name: '仪表盘',
              icon: <DashboardOutlined />,
            },
            {
              path: '/fabric/entry',
              name: '批量入库',
              icon: <FileAddOutlined />,
            },
            {
              path: '/fabric/outbound',
              name: '出库开单',
              icon: <ShoppingCartOutlined />,
            },
            {
              path: '/fabric/list',
              name: '库存列表',
              icon: <UnorderedListOutlined />,
            },
          ],
        },
        {
          path: '/settings',
          name: '资料设定',
          icon: <SettingOutlined />,
        },
      ]}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) {
              navigate(item.path)
            }
          }}
          style={{ color: '#ffffff' }}
        >
          {dom}
        </div>
      )}
      pageTitleRender={() => getPageTitle(location.pathname)}
    >
      <Routes>
        <Route path="/" element={<FabricEntry />} />
        <Route path="/global-dashboard" element={<div style={{ padding: 24 }}>总览仪表盘 - 开发中</div>} />
        <Route path="/fabric/dashboard" element={<div style={{ padding: 24 }}>布料仪表盘 - 开发中</div>} />
        <Route path="/fabric/entry" element={<FabricEntry />} />
        <Route path="/fabric/outbound" element={<div style={{ padding: 24 }}>出库开单 - 开发中</div>} />
        <Route path="/fabric/list" element={<InventoryList />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* 保留旧路由兼容性 */}
        <Route path="/inventory/fabric-entry" element={<FabricEntry />} />
        <Route path="/inventory/fabric-order-generation" element={<FabricOrderGeneration />} />
        <Route path="/inventory/inventory-list" element={<InventoryList />} />
      </Routes>
    </ProLayout>
  )
}

export default App 