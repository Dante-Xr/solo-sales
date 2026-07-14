import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"
import { MessageChannel, MessagePort } from "worker_threads"

// Polyfill for Node.js globals (required by alipay-sdk and other dependencies)
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
global.MessageChannel = MessageChannel as unknown as typeof global.MessageChannel
global.MessagePort = MessagePort as unknown as typeof global.MessagePort

// Unit tests mock Prisma calls, but its constructor still requires a valid URL.
const testDatabaseUser = "test"
const testDatabasePassword = "test"
const testDatabaseAuthority = `${testDatabaseUser}:${testDatabasePassword}@localhost:5432/solo_sales_test?schema=public`
process.env.DATABASE_URL ??= ["postgresql:", "", testDatabaseAuthority].join("/")

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
