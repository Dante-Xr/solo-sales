/**
 * Cache 类型定义测试
 * 验证 CacheEntry 泛型接口和内存缓存类型安全
 */

import type { CacheEntry } from '../cache'

describe('Cache Types', () => {
  test('CacheEntry should hold typed value and expiry', () => {
    const stringEntry: CacheEntry<string> = {
      value: 'test',
      expiry: Date.now() + 60000
    }

    const numberEntry: CacheEntry<number> = {
      value: 123,
      expiry: Date.now() + 60000
    }

    const objectEntry: CacheEntry<{ id: string; name: string }> = {
      value: { id: '1', name: 'Test' },
      expiry: Date.now() + 60000
    }

    expect(stringEntry.value).toBe('test')
    expect(numberEntry.value).toBe(123)
    expect(objectEntry.value.id).toBe('1')
  })

  test('CacheEntry should enforce value type', () => {
    // 这个测试验证类型检查在编译时有效
    const entry: CacheEntry<string> = {
      value: 'valid',
      expiry: Date.now()
    }

    // TypeScript 应该阻止以下赋值（编译时错误）
    // const wrongEntry: CacheEntry<string> = {
    //   value: 123,  // Type error: number is not assignable to string
    //   expiry: Date.now()
    // }

    expect(entry.value).toBe('valid')
  })

  test('CacheEntry expiry should be a number timestamp', () => {
    const entry: CacheEntry<string> = {
      value: 'test',
      expiry: Date.now() + 300000
    }

    expect(typeof entry.expiry).toBe('number')
    expect(entry.expiry).toBeGreaterThan(Date.now())
  })

  test('Map with CacheEntry should support generic types', () => {
    const cache = new Map<string, CacheEntry<unknown>>()

    cache.set('string', { value: 'test', expiry: Date.now() + 60000 })
    cache.set('number', { value: 42, expiry: Date.now() + 60000 })
    cache.set('object', { value: { id: 1 }, expiry: Date.now() + 60000 })

    const stringEntry = cache.get('string')
    const numberEntry = cache.get('number')
    const objectEntry = cache.get('object')

    expect(stringEntry?.value).toBe('test')
    expect(numberEntry?.value).toBe(42)
    expect(objectEntry?.value).toEqual({ id: 1 })
  })
})
