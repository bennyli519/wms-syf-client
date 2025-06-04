import React from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-layout'
import { 
  AppstoreOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import FabricEntry from './pages/inventory/FabricEntry'
import FabricOrderGeneration from './pages/inventory/FabricOrderGeneration'
import InventoryList from './pages/inventory/InventoryList'

const App: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 获取当前页面标题
  const getPageTitle = (pathname: string) => {
    const routeMap: Record<string, string> = {
      '/': '首页',
      '/inventory/fabric-entry': '布料单录入',
      '/inventory/fabric-order-generation': '布单生成',
      '/inventory/inventory-list': '库存列表',
    }
    return routeMap[pathname] || '首页'
  }

  return (
    <ProLayout
      title="管理后台"
      logo={false}
      location={{
        pathname: location.pathname,
      }}
      menu={{
        type: 'sub',
        defaultOpenAll:true,
        // defaultOpenAll: true,
      }}
      menuDataRender={() => [
        {
          path: '/inventory',
          name: '库存管理',
          icon: <AppstoreOutlined />,
          children: [
            {
              path: '/inventory/fabric-entry',
              name: '布料单录入',
              icon: <PlusCircleOutlined />,
            },
            {
              path: '/inventory/fabric-order-generation',
              name: '布单生成',
              icon: <FileTextOutlined />,
            },
            {
              path: '/inventory/inventory-list',
              name: '库存列表',
              icon: <UnorderedListOutlined />,
            },
          ],
        },
      ]}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) {
              navigate(item.path)
            }
          }}
        >
          {dom}
        </div>
      )}
      pageTitleRender={() => getPageTitle(location.pathname)}
    >
      <Routes>
        <Route path="/" element={<div style={{ padding: 24 }}>欢迎使用管理后台</div>} />
        <Route path="/inventory/fabric-entry" element={<FabricEntry />} />
        <Route path="/inventory/fabric-order-generation" element={<FabricOrderGeneration />} />
        <Route path="/inventory/inventory-list" element={<InventoryList />} />
      </Routes>
    </ProLayout>
  )
}

export default App 