/**
 * 错误处理工具类型测试
 * 验证类型守卫和错误消息提取函数
 */

import { isError, getErrorMessage, getErrorStack } from '../errors'
import type { CatchError } from '../errors'

describe('Error Handling Types', () => {
  test('CatchError should be Error or unknown', () => {
    const standardError: CatchError = new Error('Standard error')
    const unknownError: CatchError = 'string error'
    const objectError: CatchError = { message: 'Custom error' }

    expect(standardError).toBeInstanceOf(Error)
    expect(typeof unknownError).toBe('string')
    expect(typeof objectError).toBe('object')
  })

  test('isError should correctly identify Error instances', () => {
    expect(isError(new Error('test'))).toBe(true)
    expect(isError(new TypeError('test'))).toBe(true)
    expect(isError('string')).toBe(false)
    expect(isError(123)).toBe(false)
    expect(isError(null)).toBe(false)
    expect(isError(undefined)).toBe(false)
    expect(isError({ message: 'not an error' })).toBe(false)
  })

  test('getErrorMessage should extract message from Error', () => {
    expect(getErrorMessage(new Error('Error message'))).toBe('Error message')
  })

  test('getErrorMessage should handle string errors', () => {
    expect(getErrorMessage('String error')).toBe('String error')
  })

  test('getErrorMessage should handle objects with message property', () => {
    expect(getErrorMessage({ message: 'Object error' })).toBe('Object error')
  })

  test('getErrorMessage should return default message for unknown types', () => {
    expect(getErrorMessage(null)).toBe('An unknown error occurred')
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred')
    expect(getErrorMessage(123)).toBe('An unknown error occurred')
    expect(getErrorMessage({})).toBe('An unknown error occurred')
  })

  test('getErrorStack should return stack from Error', () => {
    const error = new Error('Test')
    const stack = getErrorStack(error)
    expect(stack).toBeDefined()
    expect(stack).toContain('Error: Test')
  })

  test('getErrorStack should return undefined for non-Error types', () => {
    expect(getErrorStack('string')).toBeUndefined()
    expect(getErrorStack(123)).toBeUndefined()
    expect(getErrorStack(null)).toBeUndefined()
    expect(getErrorStack({ message: 'test' })).toBeUndefined()
  })
})
