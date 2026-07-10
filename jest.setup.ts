import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"
import { MessageChannel, MessagePort } from "worker_threads"

// Polyfill for Node.js globals (required by alipay-sdk and other dependencies)
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
global.MessageChannel = MessageChannel as unknown as typeof global.MessageChannel
global.MessagePort = MessagePort as unknown as typeof global.MessagePort

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
