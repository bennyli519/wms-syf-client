import { AppDatabase, FabricProduct, FabricColor, ActivityLog, FabricInventory } from '../types/index';

const DB_KEY = 'fabricInventoryDb_v1';

// 生成mock库存数据
const generateMockInventory = (): FabricInventory[] => {
  const mockData: FabricInventory[] = [];
  let idCounter = 1;
  
  const productNames = ['40支半磨拉架', '30支半磨拉架', '32支精梳棉', '莫代尔混纺', '天丝亚麻'];
  const colorNames = ['豆沙', '卡其', '藏青', '米白', '深灰'];
  const mills = ['荣达欣', '105走', '恒昌', '明鑫'];
  
  // 生成不同日期
  const today = new Date();
  const getRandomDate = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().split('T')[0];
  };
  
  // 为每个产品-颜色-布厂组合生成库存
  productNames.forEach((productName, pIndex) => {
    colorNames.forEach((colorName, cIndex) => {
      mills.forEach((mill, mIndex) => {
        // 随机决定这个组合的库存数量（0-15疋）
        const stockCount = Math.floor(Math.random() * 16);
        
        for (let i = 0; i < stockCount; i++) {
          const entryDate = getRandomDate(90); // 90天内的随机入库日期
          const uniqueId = `F${entryDate.replace(/-/g, '').slice(2)}-${String(idCounter).padStart(4, '0')}`;
          
          // 随机决定是否已出库（20%概率）
          const isDispatched = Math.random() < 0.2 && i < stockCount - 1; // 保证至少有一些在库
          
          const item: FabricInventory = {
            id: uniqueId,
            type: 'fabric',
            productName,
            colorName,
            mill,
            batchNumber: `G${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`, // 随机缸号
            weight: Math.round((Math.random() * 5 + 15) * 10) / 10, // 15-20斤随机重量
            entryDate,
            status: isDispatched ? '已出库' : '在库'
          };
          
          // 如果已出库，添加出库信息
          if (isDispatched) {
            const dispatchDate = new Date(entryDate);
            dispatchDate.setDate(dispatchDate.getDate() + Math.floor(Math.random() * 30) + 1);
            item.dispatchDate = dispatchDate.toISOString().split('T')[0];
            item.customer = ['华丰制衣', '永盛服饰', '明鑫纺织', '恒昌实业', '荣达制造'][Math.floor(Math.random() * 5)];
          }
          
          mockData.push(item);
          idCounter++;
        }
      });
    });
  });
  
  return mockData;
};

// 生成mock活动日志
const generateMockActivityLog = (): ActivityLog[] => {
  const activities: ActivityLog[] = [];
  const today = new Date();
  
  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const isEntry = Math.random() > 0.4;
    const quantity = Math.floor(Math.random() * 8) + 1;
    const products = ['40支半磨拉架', '30支半磨拉架', '32支精梳棉', '莫代尔混纺', '天丝亚麻'];
    const customers = ['华丰制衣', '永盛服饰', '明鑫纺织', '恒昌实业', '荣达制造'];
    
    if (isEntry) {
      activities.push({
        description: `批量入库 ${quantity} 疋${products[Math.floor(Math.random() * products.length)]}`,
        type: '入库操作',
        timestamp: date
      });
    } else {
      activities.push({
        description: `快速出库 ${quantity} 疋${products[Math.floor(Math.random() * products.length)]}`,
        type: `出库至 ${customers[Math.floor(Math.random() * customers.length)]}`,
        timestamp: date
      });
    }
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Mock数据 - 专注于前端交互展示
const defaultDatabase: AppDatabase = {
  fabricProductMaster: [
    { id: 1, name: '40支半磨拉架' },
    { id: 2, name: '30支半磨拉架' },
    { id: 3, name: '32支精梳棉' },
    { id: 4, name: '莫代尔混纺' },
    { id: 5, name: '天丝亚麻' }
  ],
  fabricColors: [
    { id: 1, code: 'B152798/QA', name: '豆沙' },
    { id: 2, code: 'B152799/QA', name: '卡其' },
    { id: 3, code: 'B152800/QA', name: '藏青' },
    { id: 4, code: 'B152801/QA', name: '米白' },
    { id: 5, code: 'B152802/QA', name: '深灰' }
  ],
  fabricMills: ['荣达欣', '105走', '恒昌', '明鑫', '永盛', '华丰'],
  inventory: generateMockInventory(), // 使用生成的mock数据
  outboundDocs: [],
  activityLog: generateMockActivityLog() // 使用生成的mock活动日志
};

export class DataManager {
  // 加载数据
  static loadDatabase(): AppDatabase {
    try {
      const storedData = localStorage.getItem(DB_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // 检查是否有库存数据，如果没有则使用默认mock数据
        if (!parsed.inventory || parsed.inventory.length === 0) {
          return JSON.parse(JSON.stringify(defaultDatabase));
        }
        // 确保数据结构完整
        return {
          ...defaultDatabase,
          ...parsed
        };
      }
      return JSON.parse(JSON.stringify(defaultDatabase));
    } catch (error) {
      console.error('数据库加载失败，使用默认数据:', error);
      return JSON.parse(JSON.stringify(defaultDatabase));
    }
  }

  // 重置数据库到默认状态
  static resetDatabase(): AppDatabase {
    const freshDatabase = JSON.parse(JSON.stringify(defaultDatabase));
    localStorage.setItem(DB_KEY, JSON.stringify(freshDatabase));
    return freshDatabase;
  }

  // 保存数据
  static saveDatabase(database: AppDatabase): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(database));
    } catch (error) {
      console.error('数据库保存失败:', error);
      throw new Error('数据保存失败，请检查存储空间');
    }
  }

  // 记录操作日志
  static logActivity(database: AppDatabase, description: string, type: string): void {
    const log: ActivityLog = {
      description,
      type,
      timestamp: new Date()
    };
    
    database.activityLog.unshift(log);
    // 保留最近20条记录
    if (database.activityLog.length > 20) {
      database.activityLog = database.activityLog.slice(0, 20);
    }
    
    this.saveDatabase(database);
  }

  // 获取下一个可用ID
  static getNextId(items: Array<{ id: number }>): number {
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }

  // 检查重复
  static checkDuplicate<T extends { name: string }>(items: T[], name: string, excludeId?: number): boolean {
    return items.some(item => 
      item.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      (excludeId === undefined || (item as any).id !== excludeId)
    );
  }

  // 检查颜色代码重复
  static checkColorCodeDuplicate(colors: FabricColor[], code: string, excludeId?: number): boolean {
    return colors.some(color => 
      color.code.trim().toLowerCase() === code.trim().toLowerCase() && 
      (excludeId === undefined || color.id !== excludeId)
    );
  }
}

// 创建全局数据管理钩子
let globalDatabase: AppDatabase | null = null;

export const useDataManager = () => {
  if (!globalDatabase) {
    globalDatabase = DataManager.loadDatabase();
  }

  const updateDatabase = (updater: (db: AppDatabase) => void) => {
    if (globalDatabase) {
      updater(globalDatabase);
      DataManager.saveDatabase(globalDatabase);
    }
  };

  const refreshDatabase = () => {
    globalDatabase = DataManager.loadDatabase();
    return globalDatabase;
  };

  return {
    database: globalDatabase,
    updateDatabase,
    refreshDatabase,
    logActivity: (description: string, type: string) => {
      if (globalDatabase) {
        DataManager.logActivity(globalDatabase, description, type);
      }
    }
  };
}; 