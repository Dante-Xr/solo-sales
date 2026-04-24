/**
 * Task 9: 紧迫感元素 - CountdownTimer 单元测试
 */

import { render, screen, act } from "@testing-library/react"
import { CountdownTimer } from "../CountdownTimer"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      days: "天",
      hours: "时",
      minutes: "分",
      seconds: "秒",
      ended: "已结束",
    }
    return map[key] || key
  },
}))

describe("CountdownTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("应该渲染倒计时显示", () => {
    const futureDate = new Date(Date.now() + 86400000)
    render(<CountdownTimer targetDate={futureDate} label="优惠倒计时" />)

    expect(screen.getByText("优惠倒计时")).toBeInTheDocument()
    expect(screen.getByText("天")).toBeInTheDocument()
    expect(screen.getByText("时")).toBeInTheDocument()
    expect(screen.getByText("分")).toBeInTheDocument()
    expect(screen.getByText("秒")).toBeInTheDocument()
  })

  it("倒计时结束后应该显示已结束", () => {
    const pastDate = new Date(Date.now() - 1000)
    render(<CountdownTimer targetDate={pastDate} />)

    expect(screen.getByText("已结束")).toBeInTheDocument()
  })

  it("倒计时应该每秒更新", () => {
    const futureDate = new Date(Date.now() + 3661000)
    render(<CountdownTimer targetDate={futureDate} />)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText("秒")).toBeInTheDocument()
  })

  it("应该支持字符串日期格式", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    render(<CountdownTimer targetDate={futureDate} />)

    expect(screen.getByText("天")).toBeInTheDocument()
  })
})
