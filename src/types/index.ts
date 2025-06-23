// 主数据类型定义
export interface FabricProduct {
  id: number;
  name: string;
}

export interface FabricColor {
  id: number;
  code: string;
  name: string;
}

export interface FabricMasterData {
  fabricProducts: FabricProduct[];
  fabricColors: FabricColor[];
  fabricMills: string[];
}

// 库存数据类型定义
export interface FabricInventory {
  id: string; // F240618-0001 格式
  type: 'fabric';
  productName: string;
  colorName: string;
  colorCode?: string;
  mill: string;
  weight: number; // 斤为单位
  entryDate: string;
  status: '在库' | '已出库';
  dispatchDate?: string;
  customer?: string;
}

// 出库单据类型定义
export interface OutboundDocument {
  id: string;
  date: string;
  customer: string;
  items: string[]; // 物品ID数组
  type: 'fabric';
}

// 操作日志类型定义
export interface ActivityLog {
  description: string;
  type: string;
  timestamp: Date;
}

// 应用数据库类型定义
export interface AppDatabase {
  fabricProductMaster: FabricProduct[];
  fabricColors: FabricColor[];
  fabricMills: string[];
  inventory: FabricInventory[];
  outboundDocs: OutboundDocument[];
  activityLog: ActivityLog[];
} 