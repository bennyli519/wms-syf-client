import { AppDatabase, FabricProduct, FabricColor, ActivityLog } from '../types/index';

const DB_KEY = 'fabricInventoryDb_v1';

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
  inventory: [],
  outboundDocs: [],
  activityLog: []
};

export class DataManager {
  // 加载数据
  static loadDatabase(): AppDatabase {
    try {
      const storedData = localStorage.getItem(DB_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
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