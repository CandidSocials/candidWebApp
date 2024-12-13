interface CacheItem<T> {
    data: T;
    timestamp: number;
  }
  
  export class ChatCache {
    private messageCache: Map<string, CacheItem<any>>;
    private roomCache: Map<string, CacheItem<any>>;
    private readonly cacheTimeout: number;
  
    constructor(cacheTimeout: number = 5 * 60 * 1000) { // 5 minutes default
      this.messageCache = new Map();
      this.roomCache = new Map();
      this.cacheTimeout = cacheTimeout;
    }
  
    private isExpired(timestamp: number): boolean {
      return Date.now() - timestamp > this.cacheTimeout;
    }
  
    getMessages(roomId: string): any[] | null {
      const cached = this.messageCache.get(roomId);
      if (!cached || this.isExpired(cached.timestamp)) {
        return null;
      }
      return cached.data;
    }
  
    setMessages(roomId: string, messages: any[]): void {
      this.messageCache.set(roomId, {
        data: messages,
        timestamp: Date.now()
      });
    }
  
    getRooms(userId: string): any[] | null {
      const cached = this.roomCache.get(userId);
      if (!cached || this.isExpired(cached.timestamp)) {
        return null;
      }
      return cached.data;
    }
  
    setRooms(userId: string, rooms: any[]): void {
      this.roomCache.set(userId, {
        data: rooms,
        timestamp: Date.now()
      });
    }
  
    updateRoomMessages(roomId: string, message: any): void {
      const cached = this.messageCache.get(roomId);
      if (cached) {
        cached.data.push(message);
        cached.timestamp = Date.now();
        this.messageCache.set(roomId, cached);
      }
    }
  
    clearCache(): void {
      this.messageCache.clear();
      this.roomCache.clear();
    }
  
    clearRoomCache(roomId: string): void {
      this.messageCache.delete(roomId);
    }
  
    clearUserCache(userId: string): void {
      this.roomCache.delete(userId);
    }
  }
  
  export const chatCache = new ChatCache();