import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"
import { MessageChannel, MessagePort } from "worker_threads"

// Polyfill for Node.js globals (required by alipay-sdk and other dependencies)
global.TextDecoder = TextDecoder as any
global.TextEncoder = TextEncoder as any
global.MessageChannel = MessageChannel as any
global.MessagePort = MessagePort as any

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
