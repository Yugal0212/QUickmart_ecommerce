import { Injectable } from '@angular/core';

interface CacheItem {
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiCacheService {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

  constructor() {}

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
